import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getGroup } from "@/lib/var";
import { formatRank, initials } from "@/lib/format";
import { unreadCount } from "@/lib/queries";
import { signOut } from "../auth-actions";
import { Submit } from "@/components/Submit";

export const metadata = { title: "Mon profil · Le 4e Joueur" };

const STATUS: Record<string, [string, string]> = {
  none: ["Niveau non vérifié", "warn"], pending: ["Vérification en cours", "warn"],
  verified: ["Niveau vérifié", "ok"], rejected: ["Vérification refusée", "bad"],
};

export default async function Page() {
  const u = await requireUser();
  const g = u.group_id ? getGroup(u.group_id) : null;
  const unread = await unreadCount(u.id);
  const [label, tone] = STATUS[u.verif_status]!;
  return (
    <>
      <div className="row" style={{ justifyContent: "flex-start" }}>
        <span className="av big">{initials(u.name)}</span>
        <div><h1>{u.name}</h1><div className="sub">{u.city}</div></div>
      </div>
      <dl className="kv card">
        <dt>Niveau</dt><dd>{u.verif_status === "verified" ? formatRank(u.ranking, u.unranked) : "-"} <span className={`pill ${tone}`}>{label}</span></dd>
        <dt>Groupe</dt><dd>{g ? <Link href={`/groupes/${g.id}`}>{g.name}, {g.zone}</Link> : "Pas encore de groupe"}</dd>
        <dt>E-mail</dt><dd style={{ overflowWrap: "anywhere" }}>{u.email}</dd>
      </dl>
      <Link className="btn ghost" href="/messages">Mes messages{unread > 0 ? ` (${unread} nouveau${unread > 1 ? "x" : ""})` : ""}</Link>
      <Link className="btn ghost" href="/annonces/mes-annonces">Mes annonces</Link>
      <Link className="btn ghost" href={u.verif_status === "verified" ? "/verification?maj=1" : "/verification"}>
        {u.verif_status === "verified" ? "Mettre à jour mon classement" : "Vérifier mon niveau"}
      </Link>
      {u.role === "admin" && <Link className="btn" href="/admin">Espace admin</Link>}
      <form action={signOut}><Submit className="btn danger">Me déconnecter</Submit></form>
    </>
  );
}
