import Link from "next/link";
import { notFound } from "next/navigation";
import { q, one } from "@/db";
import { currentUser } from "@/lib/auth";
import { formatPrice, formatShort } from "@/lib/format";
import { contactSeller, setListingStatus } from "../actions";
import { GearIcon } from "@/components/Logo";
import { Submit } from "@/components/Submit";

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> }) {
  const { id } = await params;
  const { ok } = await searchParams;
  const u = await currentUser();
  const a = await one<{ id: number; user_id: number; title: string; category: string; price: number; condition: string; city: string; description: string; status: string; created_at: string; seller: string; seller_verified: boolean }>(
    `SELECT l.*, u.name AS seller, (u.group_id IS NOT NULL) AS seller_verified FROM listings l JOIN users u ON u.id = l.user_id WHERE l.id = $1 AND l.status <> 'deleted'`,
    [Number(id) || 0]);
  if (!a) notFound();
  const imgs = await q<{ image_id: number }>("SELECT image_id FROM listing_images WHERE listing_id = $1 ORDER BY pos", [a.id]);
  const mine = u?.id === a.user_id;
  const existing = u && !mine ? await one<{ id: number }>("SELECT id FROM conversations WHERE listing_id = $1 AND buyer_id = $2", [a.id, u.id]) : null;

  return (
    <>
      {ok && <div className="notice ok">{ok}</div>}
      {imgs.length ? (
        <div className="gallery">{imgs.map((i) => <img key={i.image_id} src={`/img/${i.image_id}`} alt={a.title} />)}</div>
      ) : (
        <div className="item" style={{ cursor: "default" }}><div className="ph" style={{ aspectRatio: "16/9" }}><GearIcon category={a.category} /></div></div>
      )}
      {imgs.length > 1 && <p className="sub">Fais glisser pour voir les {imgs.length} photos.</p>}
      <div className="stack" style={{ gap: 4 }}>
        <div className="row"><h1>{a.title}</h1>{a.status === "sold" && <span className="pill blue">Vendu</span>}</div>
        <span className="price" style={{ fontSize: 24 }}>{formatPrice(a.price)}</span>
      </div>
      <dl className="kv card">
        <dt>État</dt><dd>{a.condition}</dd>
        <dt>Catégorie</dt><dd>{a.category}</dd>
        <dt>Ville</dt><dd>{a.city}</dd>
        <dt>Vendeur</dt><dd>{a.seller} {a.seller_verified && <span className="pill ok">Joueur vérifié</span>}</dd>
        <dt>Publiée</dt><dd>{formatShort(a.created_at)}</dd>
      </dl>
      {a.description && <p style={{ whiteSpace: "pre-wrap" }}>{a.description}</p>}

      {mine || u?.role === "admin" ? (
        <div className="stack">
          {mine && a.status === "active" && (
            <form action={setListingStatus}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="status" value="sold" /><Submit className="btn ghost">Marquer comme vendu</Submit></form>
          )}
          {mine && a.status === "sold" && (
            <form action={setListingStatus}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="status" value="active" /><Submit className="btn ghost">Remettre en ligne</Submit></form>
          )}
          <form action={setListingStatus}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="status" value="deleted" /><Submit className="btn danger">Supprimer l'annonce</Submit></form>
          {mine && <Link href="/messages" className="btn ghost">Voir les messages reçus</Link>}
        </div>
      ) : a.status !== "active" ? null : !u ? (
        <Link className="btn" href="/connexion">Me connecter pour contacter le vendeur</Link>
      ) : !u.group_id ? (
        <div className="notice warn">Tu pourras contacter le vendeur une fois ton niveau vérifié.</div>
      ) : existing ? (
        <Link className="btn" href={`/messages/${existing.id}`}>Voir ma conversation avec le vendeur</Link>
      ) : (
        <form action={contactSeller} className="stack card">
          <input type="hidden" name="id" value={a.id} />
          <div className="field"><label htmlFor="body">Message à {a.seller}</label>
            <textarea id="body" name="body" rows={3} required defaultValue="Bonjour, l'article est toujours disponible ?" /></div>
          <Submit>Contacter le vendeur</Submit>
        </form>
      )}
    </>
  );
}
