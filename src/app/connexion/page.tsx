import Link from "next/link";
import { redirect } from "next/navigation";
import { signIn } from "../auth-actions";
import { currentUser } from "@/lib/auth";
import { Submit } from "@/components/Submit";

export const metadata = { title: "Connexion · Le 4e Joueur" };

export default async function Page({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  if (await currentUser()) redirect("/");
  const { e } = await searchParams;
  return (
    <>
      <h1>Me connecter</h1>
      {e && <div className="notice bad" role="alert">{e}</div>}
      <form action={signIn} className="stack card">
        <div className="field"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="email" required /></div>
        <div className="field"><label htmlFor="password">Mot de passe</label><input id="password" name="password" type="password" autoComplete="current-password" required /></div>
        <Submit>Me connecter</Submit>
      </form>
      <p className="sub">Pas encore de compte ? <Link href="/inscription">Créer mon compte</Link></p>
    </>
  );
}
