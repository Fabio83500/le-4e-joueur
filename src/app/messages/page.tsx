import Link from "next/link";
import { q } from "@/db";
import { requireUser } from "@/lib/auth";
import { formatShort } from "@/lib/format";

export const metadata = { title: "Messages · Le 4e Joueur" };

export default async function Page() {
  const u = await requireUser();
  const rows = await q<{ id: number; title: string; other: string; last: string; at: string; unread: number; selling: boolean }>(
    `SELECT c.id, l.title, (l.user_id = $1) AS selling,
       CASE WHEN l.user_id = $1 THEN b.name ELSE s.name END AS other,
       lm.body AS last, lm.created_at AS at,
       (SELECT count(*)::int FROM conversation_messages x WHERE x.conversation_id = c.id AND x.sender_id <> $1 AND x.read_at IS NULL) AS unread
     FROM conversations c JOIN listings l ON l.id = c.listing_id
     JOIN users b ON b.id = c.buyer_id JOIN users s ON s.id = l.user_id
     JOIN LATERAL (SELECT body, created_at FROM conversation_messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) lm ON TRUE
     WHERE c.buyer_id = $1 OR l.user_id = $1
     ORDER BY lm.created_at DESC`, [u.id]);
  return (
    <>
      <h1>Messages</h1>
      {rows.length === 0 && <div className="empty">Aucune conversation. Les messages avec les vendeurs et les acheteurs apparaîtront ici.</div>}
      {rows.map((r) => (
        <Link key={r.id} href={`/messages/${r.id}`} className="card">
          <div className="row"><b>{r.other}</b>{r.unread > 0 ? <span className="pill bad">{r.unread} nouveau{r.unread > 1 ? "x" : ""}</span> : <span className="sub">{formatShort(r.at)}</span>}</div>
          <div className="sub">{r.selling ? "Ton annonce" : "Annonce"} : {r.title}</div>
          <p style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.last}</p>
        </Link>
      ))}
    </>
  );
}
