import Link from "next/link";
import { q } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { formatShort, formatRank } from "@/lib/format";
import { addPartner, deletePartner, rejectUser, togglePartner, validateUser } from "./actions";
import { Submit } from "@/components/Submit";

export const metadata = { title: "Admin · Le 4e Joueur" };

const METHOD: Record<string, string> = { licence: "Numéro de licence", capture: "Capture TenUp", none: "Débutant, sans licence" };

export default async function Page({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  await requireAdmin();
  const { e } = await searchParams;
  const [pending, partners, stats] = await Promise.all([
    q<{ id: number; name: string; email: string; city: string; verif_method: string; licence: string | null; capture_image_id: number | null; created_at: string; ranking: number | null; unranked: boolean; group_id: string | null }>(
      "SELECT id, name, email, city, verif_method, licence, capture_image_id, created_at, ranking, unranked, group_id FROM users WHERE verif_status = 'pending' ORDER BY created_at"),
    q<{ id: number; name: string; tagline: string; url: string | null; active: boolean }>("SELECT * FROM partners ORDER BY created_at DESC"),
    q<{ users: number; verified: number; listings: number; matches: number }>(
      `SELECT (SELECT count(*)::int FROM users) AS users, (SELECT count(*)::int FROM users WHERE group_id IS NOT NULL) AS verified,
       (SELECT count(*)::int FROM listings WHERE status = 'active') AS listings, (SELECT count(*)::int FROM matches WHERE starts_at > now()) AS matches`),
  ]);
  const s = stats[0]!;
  return (
    <>
      <h1>Espace admin</h1>
      <dl className="kv card">
        <dt>Inscrits</dt><dd>{s.users}</dd><dt>Niveaux vérifiés</dt><dd>{s.verified}</dd>
        <dt>Annonces en ligne</dt><dd>{s.listings}</dd><dt>Parties à venir</dt><dd>{s.matches}</dd>
      </dl>

      <section className="stack">
        <h2>Profils à valider ({pending.length})</h2>
        <p className="sub">Vérifie le classement padel sur <a href="https://tenup.fft.fr" target="_blank" rel="noopener">TenUp</a>, saisis-le, puis valide. Le joueur rejoint automatiquement le groupe de son niveau et de son secteur.</p>
        {e && <div className="notice bad" role="alert">{e}</div>}
        {pending.length === 0 && <div className="empty">Aucun profil en attente.</div>}
        {pending.map((p) => (
          <div key={p.id} className="card">
            <div className="row"><b>{p.name}</b><span className="sub">{p.city} · {formatShort(p.created_at)}</span></div>
            <div className="sub" style={{ overflowWrap: "anywhere" }}>{p.email}</div>
            <div><span className="pill blue">{METHOD[p.verif_method] ?? p.verif_method}</span>{p.licence && <b> {p.licence}</b>}</div>
            {p.group_id && <div className="sub">Mise à jour : actuellement {formatRank(p.ranking, p.unranked)}</div>}
            {p.capture_image_id && (
              <a href={`/img/${p.capture_image_id}`} target="_blank" rel="noopener"><img src={`/img/${p.capture_image_id}`} alt={`Capture TenUp de ${p.name}`} style={{ maxHeight: 320, borderRadius: 10, border: "1px solid var(--line)" }} /></a>
            )}
            <form action={validateUser} className="stack">
              <input type="hidden" name="id" value={p.id} />
              <div className="grid2" style={{ alignItems: "end" }}>
                <div className="field"><label htmlFor={`r${p.id}`}>Classement padel</label><input id={`r${p.id}`} name="ranking" inputMode="numeric" placeholder="Ex. 18450" /></div>
                <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 700, paddingBottom: 12 }}>
                  <input type="checkbox" name="unranked" style={{ width: "auto" }} defaultChecked={p.verif_method === "none"} />Non classé
                </label>
              </div>
              <Submit>Valider</Submit>
            </form>
            <form action={rejectUser} className="stack">
              <input type="hidden" name="id" value={p.id} />
              <input name="reason" placeholder="Motif du refus (le joueur le verra)" aria-label="Motif du refus" />
              <Submit className="btn danger">Refuser</Submit>
            </form>
          </div>
        ))}
      </section>

      <Link className="btn ghost" href="/admin/cartes">Photos des cartes à collectionner</Link>
      <Link className="btn ghost" href="/admin/demo-pack">Tester l'ouverture d'un pack</Link>

      <section className="stack">
        <h2>Partenaires</h2>
        <p className="sub">Les partenaires actifs s'affichent à tour de rôle sur l'accueil et les annonces.</p>
        {partners.map((p) => (
          <div key={p.id} className="card">
            <div className="row"><b>{p.name}</b><span className={`pill ${p.active ? "ok" : "warn"}`}>{p.active ? "Actif" : "En pause"}</span></div>
            <div className="sub">{p.tagline}{p.url ? ` · ${p.url}` : ""}</div>
            <div className="row" style={{ justifyContent: "flex-start" }}>
              <form action={togglePartner}><input type="hidden" name="id" value={p.id} /><Submit className="btn ghost small">{p.active ? "Mettre en pause" : "Activer"}</Submit></form>
              <form action={deletePartner}><input type="hidden" name="id" value={p.id} /><Submit className="btn danger small">Supprimer</Submit></form>
            </div>
          </div>
        ))}
        <form action={addPartner} className="stack card">
          <h3>Ajouter un partenaire</h3>
          <div className="field"><label htmlFor="pname">Nom</label><input id="pname" name="name" required placeholder="Ex. Padel Shop Toulon" /></div>
          <div className="field"><label htmlFor="ptag">Message affiché</label><input id="ptag" name="tagline" required placeholder="Ex. -10 % pour les membres du 4e Joueur" /></div>
          <div className="field"><label htmlFor="purl">Site web (facultatif)</label><input id="purl" name="url" placeholder="Ex. padelshop.fr" /></div>
          <Submit>Ajouter</Submit>
        </form>
      </section>
    </>
  );
}
