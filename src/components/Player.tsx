// Petit personnage de padel dessiné, généré à partir de l'identifiant de la carte.
// Chaque carte a toujours le même personnage (pose, tenue, coiffure, teint) ; aucun ne représente un vrai joueur.
import type { CardDef } from "@/lib/cards";

function hash(s: string, seed: number) {
  let h = 2166136261 ^ seed;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0);
}
const pick = <T,>(arr: T[], id: string, seed: number) => arr[hash(id, seed) % arr.length]!;

const SKIN = ["#f8dcc8", "#efc4a2", "#dca57e", "#bd8158", "#93603e", "#64412b"];
const HAIR = ["#1f1a17", "#3b2618", "#6b4123", "#a8672e", "#e2bd62", "#2b2f3a"];
const SHIRT = ["#1859b8", "#2f6be0", "#0f3d82", "#ffffff", "#3aa0e8", "#1d4ed8"];
const TRIM: Record<CardDef["rarity"], string> = { legend: "#e0b23a", epic: "#7a4ae6", rare: "#7fb2ff", common: "#9fb4d0" };
const INK = "#13233a";

function Racket({ x, y, a, color }: { x: number; y: number; a: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${a})`}>
      <rect x="-2.2" y="-13" width="4.4" height="14" rx="2" fill={INK} />
      <rect x="-11" y="-38" width="22" height="27" rx="11" fill={color} stroke={INK} strokeWidth="2.2" />
      <rect x="-7.5" y="-34.5" width="15" height="20" rx="7.5" fill="none" stroke="#fff" strokeWidth="1.2" opacity=".7" />
      {[[-4, -29], [0, -29], [4, -29], [-4, -24.5], [0, -24.5], [4, -24.5], [-2, -20], [2, -20]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="1.1" fill={INK} opacity=".55" />
      ))}
    </g>
  );
}

const Arm = ({ from, to, skin, sleeve }: { from: [number, number]; to: [number, number]; skin: string; sleeve: string }) => {
  const sx = from[0] + (to[0] - from[0]) * 0.3, sy = from[1] + (to[1] - from[1]) * 0.3;
  return (
    <g strokeLinecap="round">
      <line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} stroke={skin} strokeWidth="7" />
      <line x1={from[0]} y1={from[1]} x2={sx} y2={sy} stroke={sleeve} strokeWidth="9" />
      <circle cx={to[0]} cy={to[1]} r="4" fill={skin} />
    </g>
  );
};

export function Player({ c }: { c: CardDef }) {
  const id = c.id, woman = c.tour === "Dames";
  const skin = pick(SKIN, id, 1), hair = pick(HAIR, id, 2), shirt = pick(SHIRT, id, 3);
  const trim = shirt === "#ffffff" ? "#1859b8" : TRIM[c.rarity];
  const bottom = hash(id, 4) % 2 ? "#ffffff" : INK;
  const racketColor = pick(["#1859b8", "#e8f0ff", "#ff7a45", "#22b07d", "#ffd23f", "#e2445c"], id, 5);
  const pose = hash(id, 6) % 4, lefty = hash(id, 7) % 5 === 0;
  const style = hash(id, 8) % 6, beard = !woman && hash(id, 9) % 4 === 0, grin = hash(id, 10) % 2 === 0;
  const band = hash(id, 11) % 3 === 0 ? pick(["#ffffff", "#1859b8", "#e2445c", trim], id, 12) : null;

  const L: [number, number] = [46, 64], R: [number, number] = [74, 64];
  const poses = [
    { r: [86, 40] as [number, number], ra: 18, l: [34, 50] as [number, number] }, // smash
    { r: [93, 74] as [number, number], ra: 75, l: [35, 79] as [number, number] }, // coup droit
    { r: [84, 84] as [number, number], ra: 145, l: [37, 83] as [number, number] }, // prêt
    { r: [84, 86] as [number, number], ra: 160, l: [33, 38] as [number, number] }, // victoire
  ][pose]!;

  const backHair = woman && (style === 0 || style === 5 ? <path d="M74 30c10 2 14 12 12 26-2 6-6 8-8 6 2-8 0-18-6-24z" fill={hair} /> // queue de cheval
    : style === 1 ? <circle cx="60" cy="16" r="8" fill={hair} /> // chignon
    : style === 2 || style === 4 ? <rect x="41" y="28" width="38" height="30" rx="12" fill={hair} /> // longs
    : <path d="M44 34c-6 10-4 22 2 26l4-6M76 34c6 10 4 22-2 26l-4-6" fill={hair} />); // tresses

  const frontHair = (() => {
    if (!woman && style === 1) return <path d="M43 33c0-12 8-17 17-17s17 5 17 17c-6-5-11-6-17-6s-11 1-17 6z" fill={hair} opacity=".55" />; // rasé
    if (!woman && style === 2) return <g fill={hair}>{[[46, 27], [52, 21], [60, 19], [68, 21], [74, 27], [44, 34], [76, 34]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="6.5" />)}</g>; // bouclés
    if (!woman && style === 3) return <path d="M42 34l3-12 5 5 3-10 5 7 4-10 4 9 5-7 3 10 5-4 2 12c-6-5-11-6-17-6s-12 1-17 6z" fill={hair} />; // pics
    if (!woman && style === 4) return (<g><path d="M42 31c0-11 8-16 18-16s18 5 18 16z" fill={shirt === "#ffffff" ? "#1859b8" : shirt} stroke={INK} strokeWidth="1" /><path d="M58 31h26c0 3-3 4-6 4H58z" fill={INK} /></g>); // casquette
    if (woman) return <path d="M43 36c-1-13 7-20 17-20s18 7 17 20c-4-6-9-8-12-8-3 4-9 6-15 5-3 0-5 1-7 3z" fill={hair} />; // frange
    return <path d="M43 34c0-12 8-18 17-18s17 6 17 18c-6-6-11-7-17-7s-11 1-17 7z" fill={hair} />; // court
  })();

  return (
    <svg viewBox="0 0 120 130" aria-hidden="true">
      <ellipse cx="60" cy="126" rx="28" ry="4" fill={INK} opacity=".15" />
      <g transform={lefty ? "translate(120 0) scale(-1 1)" : undefined}>
        {/* jambes */}
        <rect x="50" y="90" width="8" height="26" rx="3" fill={skin} />
        <rect x="62" y="90" width="8" height="26" rx="3" fill={skin} />
        <rect x="50" y="108" width="8" height="8" fill="#fff" /><rect x="62" y="108" width="8" height="8" fill="#fff" />
        <path d="M58 115v8H44c-3 0-4-2-3-4 1-3 5-4 9-4z" fill="#fff" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M62 115v8h14c3 0 4-2 3-4-1-3-5-4-9-4z" fill="#fff" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
        <rect x="45" y="119" width="12" height="2" fill={trim} /><rect x="63" y="119" width="12" height="2" fill={trim} />
        {/* short ou jupe */}
        {woman ? <path d="M45 82h30l4 18H41z" fill={bottom} stroke={INK} strokeWidth="1.2" />
          : <path d="M46 82h28l1 16H62l-2-6-2 6H45z" fill={bottom} stroke={INK} strokeWidth="1.2" />}
        {/* cheveux arrière */}
        {backHair}
        {/* bras gauche (derrière) */}
        <Arm from={L} to={poses.l} skin={skin} sleeve={shirt} />
        {/* maillot */}
        <rect x="44" y="57" width="32" height="30" rx="9" fill={shirt} stroke={INK} strokeWidth="1.2" />
        <path d="M53 57l7 8 7-8" fill="none" stroke={trim} strokeWidth="2.4" />
        <rect x="44.6" y="70" width="4" height="16" rx="2" fill={trim} /><rect x="71.4" y="70" width="4" height="16" rx="2" fill={trim} />
        {c.rarity === "legend" && <path d="M60 71l2 4 4.5.5-3.3 3 1 4.5-4.2-2.3-4.2 2.3 1-4.5-3.3-3 4.5-.5z" fill={trim} />}
        {/* tête */}
        <rect x="56" y="48" width="8" height="10" fill={skin} />
        <circle cx="43" cy="38" r="3.5" fill={skin} /><circle cx="77" cy="38" r="3.5" fill={skin} />
        <circle cx="60" cy="36" r="17" fill={skin} />
        {beard && <path d="M45 40c2 12 9 15 15 15s13-3 15-15c-3 5-8 6-15 6s-12-1-15-6z" fill={hair} opacity=".85" />}
        <ellipse cx="54" cy="38" rx="2.1" ry="2.7" fill={INK} /><ellipse cx="66" cy="38" rx="2.1" ry="2.7" fill={INK} />
        <circle cx="54.7" cy="37.2" r=".7" fill="#fff" /><circle cx="66.7" cy="37.2" r=".7" fill="#fff" />
        <path d="M50.5 33.2q3.5-2 7 0M62.5 33.2q3.5-2 7 0" stroke={hair} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <circle cx="50" cy="43" r="2.4" fill="#ff8a8a" opacity=".35" /><circle cx="70" cy="43" r="2.4" fill="#ff8a8a" opacity=".35" />
        {grin ? <path d="M55 44q5 6 10 0z" fill={INK} /> : <path d="M55.5 44.5q4.5 3.5 9 0" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />}
        {frontHair}
        {band && style !== 4 && <rect x="43" y="27" width="34" height="4.5" rx="2" fill={band} stroke={INK} strokeWidth=".8" />}
        {/* bras droit + raquette */}
        <Racket x={poses.r[0]} y={poses.r[1]} a={poses.ra} color={racketColor} />
        <Arm from={R} to={poses.r} skin={skin} sleeve={shirt} />
        {pose === 3 && <path d="M28 30l2-5M34 28v-6M40 30l-1-5" stroke={trim} strokeWidth="2" strokeLinecap="round" />}
      </g>
    </svg>
  );
}
