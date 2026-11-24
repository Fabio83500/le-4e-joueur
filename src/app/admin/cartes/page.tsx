import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { CARDS, PAGES, RARITY_LABEL } from "@/lib/cards";
import { cardPhotos } from "@/lib/cardPhotos";
import { removeCardPhoto, setCardPhoto } from "../actions";
import { Card } from "@/components/Card";
import { Submit } from "@/components/Submit";
import { PhotoInput } from "@/components/PhotoInput";

export const metadata = { title: "Photos des cartes · Le 4e Joueur" };

export default async function Page({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  await requireAdmin();
  const { e } = await searchParams;
  const photos = await cardPhotos();
  return (
    <>
      <Link href="/admin">‹ Espace admin</Link>
      <h1>Photos des cartes</h1>
      <p className="sub">{Object.keys(photos).length} cartes sur {CARDS.length} ont une photo. Format portrait conseillé, visage en haut de l'image.</p>
      <div className="notice warn">N'utilise que des photos dont tu as les droits : prises par toi, fournies par le joueur ou son agent, ou achetées sous licence. Une photo trouvée sur Google ou Instagram n'est pas libre de droits.</div>
      {e && <div className="notice bad" role="alert">{e}</div>}
      {PAGES.map((p) => (
        <section key={p} className="stack">
          <h2>{p}</h2>
          {CARDS.filter((c) => c.page === p).map((c) => (
            <div key={c.id} className="card" style={{ gridTemplateColumns: "auto 1fr", alignItems: "center", gap: 16 }}>
              <Card c={c} small photoId={photos[c.id]} />
              <div className="stack" style={{ minWidth: 0 }}>
                <div><b>{c.name}</b><div className="sub">{RARITY_LABEL[c.rarity]} · {c.country}</div></div>
                <form action={setCardPhoto} className="stack" style={{ gap: 8 }}>
                  <input type="hidden" name="card" value={c.id} />
                  <PhotoInput name="photo" required aria-label={`Photo de ${c.name}`} />
                  <Submit className="btn small">{photos[c.id] ? "Remplacer la photo" : "Ajouter la photo"}</Submit>
                </form>
                {photos[c.id] && (
                  <form action={removeCardPhoto}><input type="hidden" name="card" value={c.id} /><Submit className="btn danger small">Retirer la photo</Submit></form>
                )}
              </div>
            </div>
          ))}
        </section>
      ))}
    </>
  );
}
