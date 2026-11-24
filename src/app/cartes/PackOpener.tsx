"use client";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getCard, RARITY_LABEL, type Rarity } from "@/lib/cards";
import { CardFace } from "@/components/Card";
import { Holo } from "@/components/Holo";
import { Logo } from "@/components/Logo";
import { openDemoPack, openPack, type PulledCard } from "./actions";

type Phase = "sealed" | "tearing" | "stack" | "done";

function Burst({ rarity }: { rarity: Rarity }) {
  const n = rarity === "legend" ? 36 : rarity === "epic" ? 22 : 0;
  const parts = useMemo(() => Array.from({ length: n }, (_, i) => ({
    a: (i / n) * 360 + Math.random() * 10, d: 110 + Math.random() * 120, s: 6 + Math.random() * 8, t: Math.random() * 0.2,
  })), [n]);
  if (!n) return null;
  return (
    <div className={`burst ${rarity}`} aria-hidden="true">
      {parts.map((p, i) => (
        <span key={i} style={{ "--a": `${p.a}deg`, "--d": `${p.d}px`, "--s": `${p.s}px`, animationDelay: `${p.t}s` } as React.CSSProperties} />
      ))}
    </div>
  );
}

export function PackOpener({ bonus, photos, demo = false }: { bonus: boolean; photos: Record<string, number>; demo?: boolean }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("sealed");
  const [cards, setCards] = useState<PulledCard[]>([]);
  const [revealed, setRevealed] = useState(0);
  const [flash, setFlash] = useState<Rarity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const tear = () => {
    if (phase !== "sealed" || pending) return;
    setError(null);
    start(async () => {
      const res = demo ? await openDemoPack() : await openPack();
      if (!res.ok) { setError(res.error); return; }
      setCards(res.cards);
      setPhase("tearing");
      navigator.vibrate?.(40);
      setTimeout(() => setPhase("stack"), 1100);
    });
  };

  const current = cards[revealed];
  const currentDef = current ? getCard(current.id) : null;
  const [flipped, setFlipped] = useState(false);
  const [charging, setCharging] = useState(false);

  const flip = () => {
    if (!currentDef || flipped || charging) return;
    const r = currentDef.rarity;
    const suspense = r === "legend" ? 1400 : r === "epic" ? 800 : 0;
    if (suspense) { setCharging(true); navigator.vibrate?.(r === "legend" ? [60, 60, 60, 60, 200] : [50, 50, 120]); }
    setTimeout(() => {
      setCharging(false); setFlipped(true);
      if (r === "legend" || r === "epic") { setFlash(r); setTimeout(() => setFlash(null), 900); }
    }, suspense);
  };

  const next = () => {
    if (!flipped) return flip();
    setFlipped(false);
    if (revealed + 1 >= cards.length) { setPhase("done"); if (!demo) router.refresh(); }
    else setRevealed(revealed + 1);
  };

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (phase === "stack" && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); next(); } };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  });

  return (
    <div className="opener">
      {flash && <div className={`flash ${flash}`} aria-hidden="true" />}

      {(phase === "sealed" || phase === "tearing") && (
        <div className="stage">
          <button type="button" className={`pack3d${phase === "tearing" ? " torn" : ""}${pending ? " wobble" : ""}${bonus ? " bonus" : ""}`}
            onClick={tear} disabled={phase === "tearing"} aria-label="Ouvrir le pack du jour">
            <span className="half top-h"><span className="strip" /></span>
            <span className="half bot-h">
              <span className="pack-logo"><Logo /></span>
              <b>{bonus ? "Pack bonus" : "Pack du jour"}</b>
              <small>{bonus ? "4 cartes, dont 1 épique ou mieux" : "3 cartes"}</small>
            </span>
            <span className="shine" aria-hidden="true" />
          </button>
          <p className="sub">{pending ? "Ouverture…" : phase === "tearing" ? "" : "Touche le pack pour le déchirer"}</p>
        </div>
      )}
      {error && <div className="notice warn">{error}</div>}

      {phase === "stack" && currentDef && (
        <div className="stage">
          <div className="count">Carte {revealed + 1} sur {cards.length}</div>
          <div className="deck">
            {cards.slice(revealed + 1).map((_, i) => <span key={i} className="back-under" style={{ transform: `translate(${(i + 1) * 4}px, ${(i + 1) * 4}px)` }} />)}
            <div className={`flipper${flipped ? " on" : ""}${charging ? ` charge ${currentDef.rarity}` : ""}`} key={revealed}>
              <div className="face back" onClick={flip} role="button" tabIndex={0} aria-label="Retourner la carte">
                <span className="back-logo"><Logo /></span>
              </div>
              <div className="face front">
                {flipped && <Burst rarity={currentDef.rarity} />}
                <Holo className={`tc big ${currentDef.rarity}`} onClick={next} label={`${currentDef.name}, ${RARITY_LABEL[currentDef.rarity]}. Carte suivante`}>
                  <CardFace c={currentDef} photoId={photos[currentDef.id]} />
                </Holo>
              </div>
            </div>
          </div>
          <div className="reveal-info" aria-live="polite">
            {flipped ? (
              <>
                <span className={`pill ${current!.isNew ? "ok" : "blue"}`}>{current!.isNew ? "Nouvelle carte !" : `Doublon (×${current!.count})`}</span>
                <b className={`rlabel ${currentDef.rarity}`}>{RARITY_LABEL[currentDef.rarity]}</b>
              </>
            ) : <span className="sub">{charging ? "Quelque chose de rare arrive…" : "Touche la carte pour la retourner"}</span>}
          </div>
          {flipped && <button className="btn" onClick={next}>{revealed + 1 >= cards.length ? "Terminer" : "Carte suivante"}</button>}
        </div>
      )}

      {phase === "done" && (
        <div className="stage">
          <h2>Ton pack du jour</h2>
          <div className="reveal">
            {cards.map((p, i) => {
              const c = getCard(p.id)!;
              return (
                <div key={i} className="pulled">
                  <Holo className={`tc ${c.rarity}`}><CardFace c={c} photoId={photos[c.id]} /></Holo>
                  <span className={`pill ${p.isNew ? "ok" : "blue"}`}>{p.isNew ? "Nouvelle" : "Doublon"}</span>
                </div>
              );
            })}
          </div>
          <p className="sub">{demo ? "Pack de démonstration : rien n'a été ajouté à ton album." : "Reviens demain pour ton prochain pack."}</p>
          {demo && <button className="btn ghost small" onClick={() => { setPhase("sealed"); setCards([]); setRevealed(0); }}>Rejouer</button>}
        </div>
      )}
    </div>
  );
}
