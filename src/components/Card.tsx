import { Player } from "./Player";
import { RARITY_LABEL, type CardDef } from "@/lib/cards";


export function CardFace({ c, photoId }: { c: CardDef; photoId?: number }) {
  return (
    <>
      <div className="in">
        <div className="top"><span>{c.tour}</span><span aria-label={c.country}>{c.flag}</span></div>
        <div className={`pic${photoId ? " photo" : ""}`}>{photoId ? <img src={`/img/${photoId}`} alt="" draggable={false} /> : <Player c={c} />}</div>
        <div className="bot"><div className="name">{c.name}</div><div className="meta">{c.rank ? `N°${c.rank} du circuit · ` : ""}{c.country}</div></div>
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
