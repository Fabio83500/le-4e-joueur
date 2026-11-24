"use client";
import { useState } from "react";
import { CARDS, RARITY_LABEL } from "@/lib/cards";
import { Card, CardFace } from "@/components/Card";
import { Holo } from "@/components/Holo";

export function Album({ page, have, photos }: { page: string; have: Record<string, number>; photos: Record<string, number> }) {
  const [zoom, setZoom] = useState<string | null>(null);
  const cards = CARDS.filter((c) => c.page === page);
  const z = zoom ? CARDS.find((c) => c.id === zoom)! : null;
  return (
    <>
      <div className="cards-grid">
        {cards.map((c, i) => have[c.id]
          ? <button key={c.id} className="cardbtn" onClick={() => setZoom(c.id)} aria-label={`Voir ${c.name}`}><Card c={c} small count={have[c.id]} photoId={photos[c.id]} /></button>
          : <div key={c.id} className="slot"><span>{i + 1}</span><small>{RARITY_LABEL[c.rarity]}</small></div>)}
      </div>
      {z && (
        <div className="zoom" onClick={() => setZoom(null)} role="dialog" aria-modal="true" aria-label={z.name}>
          <div onClick={(e) => e.stopPropagation()} className="zoom-in">
            <Holo className={`tc big ${z.rarity}`}><CardFace c={z} photoId={photos[z.id]} /></Holo>
            <p className="sub" style={{ color: "#fff", textAlign: "center" }}>{have[z.id]! > 1 ? `Tu l'as en ${have[z.id]} exemplaires` : "Tu l'as en 1 exemplaire"}</p>
            <button className="btn ghost" onClick={() => setZoom(null)}>Fermer</button>
          </div>
        </div>
      )}
    </>
  );
}
