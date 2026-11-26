"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { saveAvatar } from "./actions";

const OUT = 400; // taille de l'avatar enregistré, en pixels
type Style = "dessin" | "photo";

// Palette bleu et blanc de l'appli, du plus sombre au plus clair.
const PALETTE: [number, number, number][] = [
  [14, 38, 84], [24, 89, 184], [84, 138, 222], [176, 204, 245], [255, 255, 255],
];
const LINE: [number, number, number] = [10, 28, 64];

// Transforme la photo en dessin bleu et blanc : contours + aplats de couleur.
function cartoon(ctx: CanvasRenderingContext2D) {
  const img = ctx.getImageData(0, 0, OUT, OUT);
  const d = img.data;
  const n = OUT * OUT;
  let lum = new Float32Array(n);
  for (let i = 0; i < n; i++) lum[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
  // Contraste : on étire les tons entre 2 % et 98 %.
  const sorted = Float32Array.from(lum).sort();
  const lo = sorted[Math.floor(n * 0.02)]!, hi = sorted[Math.floor(n * 0.98)]!;
  const span = Math.max(1, hi - lo);
  for (let i = 0; i < n; i++) lum[i] = Math.min(255, Math.max(0, ((lum[i]! - lo) / span) * 255));
  // Adoucissement (deux flous légers) pour des aplats propres.
  for (let pass = 0; pass < 2; pass++) {
    const out = new Float32Array(n);
    for (let y = 0; y < OUT; y++) for (let x = 0; x < OUT; x++) {
      let s = 0, c = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const yy = y + dy, xx = x + dx;
        if (yy >= 0 && yy < OUT && xx >= 0 && xx < OUT) { s += lum[yy * OUT + xx]!; c++; }
      }
      out[y * OUT + x] = s / c;
    }
    lum = out;
  }
  for (let y = 0; y < OUT; y++) for (let x = 0; x < OUT; x++) {
    const i = y * OUT + x;
    let edge = 0;
    if (x > 0 && y > 0 && x < OUT - 1 && y < OUT - 1) {
      const p = (dx: number, dy: number) => lum[(y + dy) * OUT + x + dx]!;
      const gx = -p(-1, -1) - 2 * p(-1, 0) - p(-1, 1) + p(1, -1) + 2 * p(1, 0) + p(1, 1);
      const gy = -p(-1, -1) - 2 * p(0, -1) - p(1, -1) + p(-1, 1) + 2 * p(0, 1) + p(1, 1);
      edge = Math.hypot(gx, gy);
    }
    const level = Math.min(PALETTE.length - 1, Math.floor((lum[i]! / 256) * PALETTE.length));
    const [r, g, b] = edge > 150 ? LINE : PALETTE[level]!;
    d[i * 4] = r; d[i * 4 + 1] = g; d[i * 4 + 2] = b; d[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

export function AvatarMaker() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [bmp, setBmp] = useState<ImageBitmap | null>(null);
  const [zoom, setZoom] = useState(1.3);
  const [center, setCenter] = useState({ x: 0, y: 0 });
  const [style, setStyle] = useState<Style>("dessin");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const drag = useRef<{ x: number; y: number } | null>(null);

  const side = bmp ? Math.min(bmp.width, bmp.height) / zoom : 0;
  const clamp = (c: { x: number; y: number }) => bmp ? {
    x: Math.min(bmp.width - side / 2, Math.max(side / 2, c.x)),
    y: Math.min(bmp.height - side / 2, Math.max(side / 2, c.y)),
  } : c;

  useEffect(() => {
    const cv = canvas.current;
    if (!cv || !bmp) return;
    const ctx = cv.getContext("2d", { willReadFrequently: true })!;
    const c = clamp(center);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, OUT, OUT);
    ctx.drawImage(bmp, c.x - side / 2, c.y - side / 2, side, side, 0, 0, OUT, OUT);
    if (style === "dessin") cartoon(ctx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bmp, zoom, center, style]);

  async function pick(file: File | undefined) {
    setError("");
    if (!file) return;
    try {
      const b = await createImageBitmap(file);
      setBmp(b);
      setZoom(1.3);
      // Par défaut on cadre un peu au-dessus du milieu, là où est souvent le visage.
      setCenter({ x: b.width / 2, y: b.height * 0.42 });
    } catch {
      setError("Cette photo n'a pas pu être ouverte. Essaie une photo JPG ou PNG.");
    }
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drag.current || !bmp) return;
    const scale = side / e.currentTarget.clientWidth;
    const dx = (e.clientX - drag.current.x) * scale, dy = (e.clientY - drag.current.y) * scale;
    drag.current = { x: e.clientX, y: e.clientY };
    setCenter((c) => clamp({ x: clamp(c).x - dx, y: clamp(c).y - dy }));
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canvas.current || !bmp) return setError("Choisis d'abord une photo.");
    if (!consent) return setError("Coche la case pour continuer.");
    const fd = new FormData(e.currentTarget);
    canvas.current.toBlob((blob) => {
      if (!blob) return setError("L'avatar n'a pas pu être créé. Réessaie.");
      fd.set("avatar", new File([blob], "avatar.jpg", { type: "image/jpeg" }));
      start(() => saveAvatar(fd));
    }, "image/jpeg", 0.88);
  }

  return (
    <form onSubmit={submit} className="stack">
      <div className="field">
        <label htmlFor="photo">1. Choisis une photo de toi</label>
        <input id="photo" type="file" accept="image/*" onChange={(e) => pick(e.currentTarget.files?.[0])} />
        <span className="hint">Une photo de face, bien éclairée, avec ton visage seul. Elle reste sur ton téléphone : seul l'avatar final est envoyé.</span>
      </div>

      {bmp && (
        <>
          <div className="avatar-stage">
            <canvas
              ref={canvas} width={OUT} height={OUT} className="avatar-canvas"
              aria-label="Aperçu de ton avatar. Fais glisser pour centrer ton visage."
              onPointerDown={(e) => { drag.current = { x: e.clientX, y: e.clientY }; e.currentTarget.setPointerCapture(e.pointerId); }}
              onPointerMove={move}
              onPointerUp={() => { drag.current = null; }}
              onPointerCancel={() => { drag.current = null; }}
            />
            <span className="hint">Fais glisser l'image pour centrer ton visage.</span>
          </div>
          <div className="field">
            <label htmlFor="zoom">2. Zoom</label>
            <input id="zoom" type="range" min={1} max={4} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.currentTarget.value))} />
          </div>
          <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>3. Choisis le style</legend>
            <div className="choice">
              <label><input type="radio" name="style" value="dessin" checked={style === "dessin"} onChange={() => setStyle("dessin")} />Dessin bleu</label>
              <label><input type="radio" name="style" value="photo" checked={style === "photo"} onChange={() => setStyle("photo")} />Photo</label>
            </div>
          </fieldset>
          <label className="consent">
            <input type="checkbox" name="consent" value="oui" checked={consent} onChange={(e) => setConsent(e.currentTarget.checked)} />
            <span>C'est bien moi sur la photo, et j'accepte que cet avatar soit visible par les joueurs inscrits sur Le 4e Joueur. Je peux le supprimer à tout moment depuis mon profil.</span>
          </label>
        </>
      )}
      {error && <div className="notice bad" role="alert">{error}</div>}
      {bmp && <button className="btn" type="submit" disabled={pending || !consent}>{pending ? "Enregistrement…" : "Enregistrer mon avatar"}</button>}
    </form>
  );
}
