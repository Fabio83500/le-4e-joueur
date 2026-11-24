import Link from "next/link";
import { notFound } from "next/navigation";
import { q, one } from "@/db";
import { requireUser } from "@/lib/auth";
import { formatPrice, formatShort } from "@/lib/format";
import { reply } from "@/app/annonces/actions";
import { Submit } from "@/components/Submit";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const u = await requireUser();
  const { id } = await params;
  const c = await one<{ id: number; listing_id: number; title: string; price: number; other: string }>(
    `SELECT c.id, c.listing_id, l.title, l.price, CASE WHEN l.user_id = $2 THEN b.name ELSE s.name END AS other
     FROM conversations c JOIN listings l ON l.id = c.listing_id JOIN users b ON b.id = c.buyer_id JOIN users s ON s.id = l.user_id
     WHERE c.id = $1 AND (c.buyer_id = $2 OR l.user_id = $2)`, [Number(id) || 0, u.id]);
  if (!c) notFound();
  await q("UPDATE conversation_messages SET read_at = now() WHERE conversation_id = $1 AND sender_id <> $2 AND read_at IS NULL", [c.id, u.id]);
  const msgs = await q<{ id: number; sender_id: number; body: string; created_at: string }>(
    "SELECT id, sender_id, body, created_at FROM conversation_messages WHERE conversation_id = $1 ORDER BY created_at", [c.id]);
  return (
    <>
      <div className="stack" style={{ gap: 4 }}>
        <h1>{c.other}</h1>
        <Link href={`/annonces/${c.listing_id}`} className="sub">{c.title} · {formatPrice(c.price)}</Link>
      </div>
      <div className="msgs">
        {msgs.map((m) => (
          <div key={m.id} className={`msg${m.sender_id === u.id ? " me" : ""}`}>
            <span className="body">{m.body}</span><time>{formatShort(m.created_at)}</time>
          </div>
        ))}
      </div>
      <form action={reply} className="stack">
        <input type="hidden" name="conversation" value={c.id} />
        <div className="field"><label htmlFor="body">Répondre</label><textarea id="body" name="body" rows={2} required maxLength={2000} /></div>
        <Submit>Envoyer</Submit>
      </form>
      <p className="sub">Conseil : pour une remise en main propre, donnez-vous rendez-vous dans un club ou un lieu public.</p>
    </>
  );
}
