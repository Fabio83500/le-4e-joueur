import { requireVerified } from "@/lib/auth";
import { CATEGORIES, CONDITIONS, SECTORS } from "@/lib/var";
import { createListing } from "../actions";
import { Submit } from "@/components/Submit";

export const metadata = { title: "Vendre un article · Le 4e Joueur" };

export default async function Page({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const u = await requireVerified();
  const { e } = await searchParams;
  return (
    <>
      <h1>Vendre un article</h1>
      {e && <div className="notice bad" role="alert">{e}</div>}
      <form action={createListing} className="stack card">
        <div className="field">
          <label htmlFor="photos">Photos</label>
          <input id="photos" name="photos" type="file" accept="image/*" multiple />
          <span className="hint">Jusqu'à 5 photos, 5 Mo maximum chacune</span>
        </div>
        <div className="field"><label htmlFor="title">Titre</label><input id="title" name="title" maxLength={80} placeholder="Ex. Raquette Babolat Viper" required /></div>
        <div className="grid2">
          <div className="field"><label htmlFor="category">Catégorie</label>
            <select id="category" name="category" required>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div className="field"><label htmlFor="price">Prix (€)</label><input id="price" name="price" inputMode="numeric" pattern="[0-9]+" placeholder="50" required /></div>
        </div>
        <div className="grid2">
          <div className="field"><label htmlFor="condition">État</label>
            <select id="condition" name="condition" defaultValue="Bon état">{CONDITIONS.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div className="field"><label htmlFor="city">Ville</label>
            <select id="city" name="city" defaultValue={u.city}>
              {SECTORS.map((s) => <optgroup key={s.id} label={s.name}>{[...s.cities].sort((a, b) => a.localeCompare(b, "fr")).map((c) => <option key={c}>{c}</option>)}</optgroup>)}
            </select></div>
        </div>
        <div className="field"><label htmlFor="description">Description</label><textarea id="description" name="description" rows={4} maxLength={2000} placeholder="Utilisation, défauts éventuels, possibilité d'essayer…" /></div>
        <Submit pendingText="Publication…">Publier l'annonce</Submit>
      </form>
    </>
  );
}
