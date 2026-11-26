import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { Avatar } from "@/components/Avatar";
import { Submit } from "@/components/Submit";
import { AvatarMaker } from "./AvatarMaker";
import { deleteAvatar } from "./actions";

export const metadata = { title: "Mon avatar · Le 4e Joueur" };

export default async function Page({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const u = await requireUser();
  const { e } = await searchParams;
  return (
    <>
      <div className="stack" style={{ gap: 4 }}>
        <Link href="/profil" className="sub">← Mon profil</Link>
        <h1>Mon avatar</h1>
        <p className="sub">Crée un avatar à ton image à partir d'une photo de toi. Il apparaît sur ton profil, dans ton groupe, sur les parties et dans tes messages.</p>
      </div>
      {e && <div className="notice bad" role="alert">{e}</div>}

      {u.avatar_image_id && (
        <section className="card stack">
          <div className="row" style={{ justifyContent: "flex-start", gap: 14 }}>
            <Avatar name={u.name} image={u.avatar_image_id} size="huge" />
            <div className="stack" style={{ gap: 4 }}>
              <b>Ton avatar actuel</b>
              <span className="sub">Tu peux le remplacer ci-dessous, ou le supprimer.</span>
            </div>
          </div>
          <form action={deleteAvatar}>
            <Submit className="btn danger">Supprimer mon avatar</Submit>
          </form>
          <span className="hint">Il est effacé tout de suite et définitivement. Tes initiales reprennent sa place.</span>
        </section>
      )}

      <section className="stack">
        <h2>{u.avatar_image_id ? "Créer un nouvel avatar" : "Créer mon avatar"}</h2>
        <AvatarMaker />
      </section>

      <p className="sub">Utilise uniquement une photo de toi. Ton avatar n'est visible que par les joueurs connectés, jamais sur internet en dehors de l'appli.</p>
    </>
  );
}
