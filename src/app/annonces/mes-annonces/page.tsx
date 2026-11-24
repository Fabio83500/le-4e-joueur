import Link from "next/link";
import { q } from "@/db";
import { requireUser } from "@/lib/auth";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Mes annonces · Le 4e Joueur" };

const LABEL: Record<string, [string, string]> = { active: ["En ligne", "ok"], sold: ["Vendu", "blue"] };

export default async function Page() {
  const u = await requireUser();
  const rows = await q<{ id: number; title: string; price: number; status: string }>(
    "SELECT id, title, price, status FROM listings WHERE user_id = $1 AND status <> 'deleted' ORDER BY created_at DESC", [u.id]);
  return (
    <>
      <h1>Mes annonces</h1>
      {rows.length === 0 && <div className="empty">Tu n'as pas encore d'annonce.</div>}
      {rows.map((r) => (
        <Link key={r.id} href={`/annonces/${r.id}`} className="card">
          <div className="row"><b>{r.title}</b><span className={`pill ${LABEL[r.status]?.[1]}`}>{LABEL[r.status]?.[0]}</span></div>
          <span className="price">{formatPrice(r.price)}</span>
        </Link>
      ))}
      {u.group_id && <Link className="btn" href="/annonces/nouvelle">+ Vendre un article</Link>}
    </>
  );
}
