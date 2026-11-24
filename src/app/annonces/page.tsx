import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { CATEGORIES } from "@/lib/var";
import { featuredPartner, listingCards } from "@/lib/queries";
import { Items } from "@/components/Items";
import { PartnerBanner } from "@/components/Partner";

export const metadata = { title: "Annonces · Le 4e Joueur" };

export default async function Page({ searchParams }: { searchParams: Promise<{ c?: string; q?: string }> }) {
  const u = await currentUser();
  const { c, q: search } = await searchParams;
  const cat = c && CATEGORIES.includes(c) ? c : null;
  const where: string[] = ["TRUE"]; const params: unknown[] = [];
  if (cat) { params.push(cat); where.push(`l.category = $${params.length}`); }
  if (search?.trim()) { params.push(`%${search.trim()}%`); where.push(`(l.title ILIKE $${params.length} OR l.description ILIKE $${params.length})`); }
  const [items, partner] = await Promise.all([listingCards(where.join(" AND "), params), featuredPartner()]);
  const href = (x: string | null) => {
    const sp = new URLSearchParams(); if (x) sp.set("c", x); if (search) sp.set("q", search);
    const s = sp.toString(); return s ? `/annonces?${s}` : "/annonces";
  };
  return (
    <>
      <div className="row"><h1>Annonces</h1>{u && <Link href="/annonces/mes-annonces">Mes annonces</Link>}</div>
      {u?.group_id
        ? <Link className="btn" href="/annonces/nouvelle">+ Vendre un article</Link>
        : u ? <div className="notice warn">Une fois ton niveau vérifié, tu pourras vendre et contacter les vendeurs.</div>
        : <Link className="btn" href="/inscription">Créer mon compte pour vendre</Link>}
      <form className="row" style={{ flexWrap: "nowrap" }}>
        {cat && <input type="hidden" name="c" value={cat} />}
        <input name="q" defaultValue={search} placeholder="Rechercher (ex. Bullpadel)" aria-label="Rechercher une annonce" />
        <button className="btn small ghost" type="submit">Chercher</button>
      </form>
      <nav className="filters" aria-label="Catégories">
        <a href={href(null)} aria-current={!cat ? "true" : undefined}>Tout</a>
        {CATEGORIES.map((x) => <a key={x} href={href(x)} aria-current={cat === x ? "true" : undefined}>{x}</a>)}
      </nav>
      {items.length === 0 ? <div className="empty">Aucune annonce pour l'instant{cat ? " dans cette catégorie" : ""}.</div> : <Items items={items} />}
      <PartnerBanner partner={partner} />
    </>
  );
}
