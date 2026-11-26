import type { MatchRow } from "@/lib/queries";
import { formatDateTime } from "@/lib/format";
import { Avatar } from "./Avatar";
import { joinMatch, leaveMatch } from "@/app/groupes/actions";
import { Submit } from "./Submit";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function MatchCard({ m, userId, canJoin }: { m: MatchRow; userId: number; canJoin: boolean }) {
  const inMatch = m.players.some((p) => p.id === userId);
  const free = Math.max(0, m.seats - m.players.length);
  const friends = 4 - m.seats;
  return (
    <div className="card">
      <div className="row">
        <b>{cap(formatDateTime(m.starts_at))}</b>
        <span className={`pill ${free ? "blue" : "ok"}`}>{free ? `${free} place${free > 1 ? "s" : ""}` : "Complet"}</span>
      </div>
      <div className="sub">{m.club_name ? `${m.club_name}, ${m.club_city}` : "Club à définir"}</div>
      {friends > 0 && <div className="sub">L'organisateur vient avec {friends === 1 ? "1 ami" : `${friends} amis`}</div>}
      {m.note && <p>{m.note}</p>}
      <div className="row">
        <div className="avatars" title={m.players.map((p) => p.name).join(", ")}>
          {m.players.map((p) => <Avatar key={p.id} name={p.name} image={p.avatar} />)}
          {Array.from({ length: free }, (_, i) => <span key={i} className="av empty" />)}
        </div>
        {canJoin && (inMatch ? (
          <form action={leaveMatch}><input type="hidden" name="match" value={m.id} /><Submit className="btn ghost small">Me retirer</Submit></form>
        ) : free > 0 ? (
          <form action={joinMatch}><input type="hidden" name="match" value={m.id} /><Submit className="btn small">Je viens !</Submit></form>
        ) : null)}
      </div>
      <div className="sub">{m.players.map((p) => p.name).join(", ")}</div>
    </div>
  );
}
