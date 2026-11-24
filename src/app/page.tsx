import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { getGroup } from "@/lib/var";
import { featuredPartner, listingCards, upcomingMatches } from "@/lib/queries";
import { PartnerBanner } from "@/components/Partner";
import { Items } from "@/components/Items";
import { MatchCard } from "@/components/Match";

export default async function Home() {
  const u = await currentUser();
  const partner = await featuredPartner();

  if (!u) {
    return (
      <>
        <section className="hero">
          <h1>Il vous manque un 4e ?</h1>
          <p>Le 4e Joueur réunit les joueurs de padel du Var par niveau réel, vérifié sur TenUp. Trouve des partenaires de ton niveau près de chez toi, et revends le matériel dont tu ne te sers plus.</p>
          <Link className="btn" href="/inscription">Créer mon compte gratuit</Link>
          <Link className="btn ghost" href="/connexion">J'ai déjà un compte</Link>
        </section>
        <div className="card">
          <h3>Comment ça marche</h3>
          <dl className="kv">
            <dt>1.</dt><dd>Tu t'inscris avec ta ville.</dd>
            <dt>2.</dt><dd>Tu donnes ton numéro de licence ou une capture TenUp.</dd>
            <dt>3.</dt><dd>On vérifie ton classement et tu rejoins le groupe de ton niveau.</dd>
          </dl>
        </div>
        <PartnerBanner partner={partner} />
      </>
    );
  }

  const group = u.group_id ? getGroup(u.group_id) : null;
  const matches = group ? (await upcomingMatches(group.id)).filter((m) => m.players.length < m.seats || m.players.some((p) => p.id === u.id)) : [];
  const latest = await listingCards("TRUE", [], 4);

  return (
    <>
      <div className="stack" style={{ gap: 4 }}>
        <h1>Bonjour {u.name.split(" ")[0]}</h1>
        {group
          ? <p className="sub">Ton groupe : <Link href={`/groupes/${group.id}`}>{group.name}, {group.zone}</Link></p>
          : null}
      </div>
      {!group && (
        u.verif_status === "pending"
          ? <div className="notice warn">Ton niveau est en cours de vérification. Tu rejoindras ton groupe dès que c'est validé.</div>
          : <Link href="/verification" className="card" style={{ borderColor: "var(--blue-ink)" }}>
              <h3>Vérifie ton niveau</h3>
              <p className="sub">C'est ce qui te permet de rejoindre le groupe de ton niveau et de jouer.</p>
            </Link>
      )}
      {group && (
        <section className="stack">
          <h2>Ils cherchent un 4e</h2>
          {matches.length === 0 && <div className="empty">Personne ne cherche de joueur pour l'instant dans ton groupe.</div>}
          {matches.slice(0, 5).map((m) => <MatchCard key={m.id} m={m} userId={u.id} canJoin />)}
          <Link className="btn ghost" href={`/groupes/${group.id}#proposer`}>+ Proposer une partie</Link>
        </section>
      )}
      <PartnerBanner partner={partner} />
      {latest.length > 0 && (
        <section className="stack">
          <div className="row"><h2>Nouvelles annonces</h2><Link href="/annonces">Tout voir</Link></div>
          <Items items={latest} />
        </section>
      )}
    </>
  );
}
