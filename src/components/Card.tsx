import { RARITY_LABEL, type CardDef } from "@/lib/cards";

function Figure({ tour }: { tour: string }) {
  return (
    <svg viewBox="0 0 100 90" aria-hidden="true">
      <circle cx="50" cy="30" r="17" fill="#13233a" opacity=".82" />
      {tour === "Dames" && <path d="M36 24c2-12 26-12 28 0 4 10 2 18-2 22-2-8-4-14-12-16-8 2-10 8-12 16-4-4-6-12-2-22z" fill="#13233a" opacity=".82" />}
      <path d="M18 90c2-22 15-34 32-34s30 12 32 34z" fill="#1859b8" />
      <ellipse cx="84" cy="42" rx="10" ry="12" fill="#13233a" opacity=".85" />
      <rect x="80" y="52" width="5" height="16" rx="2.5" fill="#13233a" opacity=".85" />
    </svg>
  );
}

export function CardFace({ c, photoId }: { c: CardDef; photoId?: number }) {
  return (
    <>
      <div className="in">
        <div className="top"><span>{c.tour}</span><span aria-label={c.country}>{c.flag}</span></div>
        <div className={`pic${photoId ? " photo" : ""}`}>{photoId ? <img src={`/img/${photoId}`} alt="" draggable={false} /> : <Figure tour={c.tour} />}</div>
        <div className="bot"><div className="name">{c.name}</div><div className="meta">{c.country}</div></div>
      </div>
      <span className="foil" aria-hidden="true" />
      <span className="gem">{RARITY_LABEL[c.rarity]}</span>
    </>
  );
}

export function Card({ c, count, small, photoId }: { c: CardDef; count?: number; small?: boolean; photoId?: number }) {
  return (
    <div className={`tc ${c.rarity}${small ? " sm" : ""}`}>
      {count && count > 1 ? <span className="dup" aria-label={`${count} exemplaires`}>×{count}</span> : null}
      <CardFace c={c} photoId={photoId} />
    </div>
  );
}
