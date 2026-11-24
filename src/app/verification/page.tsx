import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getGroup } from "@/lib/var";
import { formatRank } from "@/lib/format";
import { submitVerification } from "./actions";
import { Submit } from "@/components/Submit";
import { VerifForm } from "./VerifForm";

export const metadata = { title: "Vérifier mon niveau · Le 4e Joueur" };

export default async function Page({ searchParams }: { searchParams: Promise<{ e?: string; maj?: string }> }) {
  const u = await requireUser();
  const { e, maj } = await searchParams;
  const group = u.group_id ? getGroup(u.group_id) : null;

  if (u.verif_status === "pending") {
    return (
      <>
        <div className="notice ok">C'est envoyé !</div>
        <h1>On vérifie ton niveau</h1>
        <p>En général sous 24 heures. Dès que c'est validé, tu rejoins automatiquement le groupe qui correspond à ton classement.</p>
        <span className="pill warn" style={{ justifySelf: "start" }}>En attente de validation</span>
        {group
          ? <Link className="btn" href={`/groupes/${group.id}`}>Retour à mon groupe</Link>
          : <Link className="btn" href="/annonces">En attendant, voir les annonces</Link>}
      </>
    );
  }

  if (u.verif_status === "verified" && !maj) {
    return (
      <>
        <h1>Ton niveau est vérifié</h1>
        <div className="card">
          <dl className="kv">
            <dt>Niveau</dt><dd>{formatRank(u.ranking, u.unranked)} <span className="pill ok">Vérifié</span></dd>
            <dt>Groupe</dt><dd>{group ? `${group.name}, ${group.zone}` : "-"}</dd>
          </dl>
        </div>
        <Link className="btn ghost" href="/verification?maj=1">Mettre à jour mon classement</Link>
      </>
    );
  }

  return (
    <>
      <h1>{maj ? "Mettre à jour mon classement" : "Vérifier mon niveau"}</h1>
      <p className="sub">Pour que les groupes soient équilibrés, chaque niveau est vérifié à la main à partir de TenUp. On n'utilise ces informations que pour lire ton classement.</p>
      {u.verif_status === "rejected" && (
        <div className="notice warn">La vérification n'a pas pu aboutir{u.reject_reason ? ` : ${u.reject_reason}` : "."} Tu peux réessayer ci-dessous.</div>
      )}
      {e && <div className="notice bad" role="alert">{e}</div>}
      <form action={submitVerification} className="stack card">
        <VerifForm />
        <Submit pendingText="Envoi…">Envoyer pour vérification</Submit>
      </form>
    </>
  );
}
