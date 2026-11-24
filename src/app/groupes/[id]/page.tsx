import { notFound } from "next/navigation";
import { q } from "@/db";
import { requireVerified } from "@/lib/auth";
import { getGroup } from "@/lib/var";
import { upcomingMatches } from "@/lib/queries";
import { formatShort } from "@/lib/format";
import { postMessage, proposeMatch } from "../actions";
import { MatchCard } from "@/components/Match";
import { Submit } from "@/components/Submit";

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ e?: string; ok?: string }> }) {
  const u = await requireVerified();
  const { id } = await params;
  const { e, ok } = await searchParams;
  const g = getGroup(id);
  if (!g) notFound();
  const member = u.group_id === g.id;
  const [matches, messages, clubs, members] = await Promise.all([
    upcomingMatches(g.id),
    q<{ id: number; body: string; created_at: string; user_id: number; name: string }>(
      `SELECT * FROM (SELECT m.id, m.body, m.created_at, m.user_id, u.name FROM group_messages m JOIN users u ON u.id = m.user_id
       WHERE m.group_id = $1 ORDER BY m.created_at DESC LIMIT 50) t ORDER BY created_at`, [g.id]),
    q<{ id: number; name: string; city: string; sector: string }>("SELECT id, name, city, sector FROM clubs ORDER BY name"),
    q<{ n: number }>("SELECT count(*)::int AS n FROM users WHERE group_id = $1", [g.id]),
  ]);
  const nearClubs = g.sector === "var" ? clubs : [...clubs.filter((c) => c.sector === g.sector), ...clubs.filter((c) => c.sector !== g.sector)];
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <div className="stack" style={{ gap: 4 }}>
        <h1>{g.name}</h1>
        <p className="sub">{g.range} · {g.zone} · {members[0]?.n ?? 0} membres</p>
      </div>
      {!member && <div className="notice warn">Ce n'est pas ton groupe : tu peux le consulter, mais pas y écrire ni rejoindre ses parties.</div>}
      {ok && <div className="notice ok">{ok}</div>}

      <section className="stack">
        <h2>Parties à venir</h2>
        {matches.length === 0 && <div className="empty">Aucune partie prévue pour l'instant.</div>}
        {matches.map((m) => <MatchCard key={m.id} m={m} userId={u.id} canJoin={member} />)}
      </section>

      {member && (
        <section className="stack" id="proposer">
          <h2>Il te manque des joueurs ?</h2>
          {e && <div className="notice bad" role="alert">{e}</div>}
          <form action={proposeMatch} className="stack card">
            <input type="hidden" name="group" value={g.id} />
            <div className="grid2">
              <div className="field"><label htmlFor="date">Jour</label><input id="date" name="date" type="date" min={today} required /></div>
              <div className="field"><label htmlFor="time">Heure</label><input id="time" name="time" type="time" step={900} required /></div>
            </div>
            <div className="field">
              <label htmlFor="club">Club</label>
              <select id="club" name="club" defaultValue="">
                <option value="">Pas encore réservé</option>
                {nearClubs.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.city})</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="players">Vous êtes déjà combien ?</label>
              <select id="players" name="players" defaultValue="3">
                <option value="1">Juste moi, il manque 3 joueurs</option>
                <option value="2">2, il manque 2 joueurs</option>
                <option value="3">3, il manque le 4e</option>
              </select>
            </div>
            <div className="field"><label htmlFor="note">Précision (facultatif)</label><input id="note" name="note" maxLength={300} placeholder="Ex. terrain couvert, 10 € par personne" /></div>
            <Submit>Publier la partie</Submit>
          </form>
        </section>
      )}

      <section className="stack">
        <h2>Discussion</h2>
        {messages.length === 0 && <div className="empty">Pas encore de message. Lance la conversation !</div>}
        <div className="msgs">
          {messages.map((m) => (
            <div key={m.id} className={`msg${m.user_id === u.id ? " me" : ""}`}>
              <b>{m.user_id === u.id ? "Moi" : m.name}</b>
              <span className="body">{m.body}</span>
              <time>{formatShort(m.created_at)}</time>
            </div>
          ))}
        </div>
        {member && (
          <form action={postMessage} className="stack">
            <input type="hidden" name="group" value={g.id} />
            <div className="field"><label htmlFor="body">Écrire au groupe</label><textarea id="body" name="body" rows={2} maxLength={1000} required /></div>
            <Submit className="btn ghost">Envoyer</Submit>
          </form>
        )}
      </section>
    </>
  );
}
