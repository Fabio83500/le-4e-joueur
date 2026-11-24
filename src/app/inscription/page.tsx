import Link from "next/link";
import { redirect } from "next/navigation";
import { signUp } from "../auth-actions";
import { currentUser } from "@/lib/auth";
import { SECTORS } from "@/lib/var";
import { Submit } from "@/components/Submit";

export const metadata = { title: "Créer mon compte · Le 4e Joueur" };

export default async function Page({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  if (await currentUser()) redirect("/");
  const { e } = await searchParams;
  return (
    <>
      <h1>Créer mon compte</h1>
      <p className="sub">Trois infos, puis on vérifie ton niveau pour te placer dans le bon groupe.</p>
      {e && <div className="notice bad" role="alert">{e}</div>}
      <form action={signUp} className="stack card">
        <div className="field"><label htmlFor="name">Prénom et nom</label><input id="name" name="name" autoComplete="name" required /></div>
        <div className="field"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="email" required /></div>
        <div className="field">
          <label htmlFor="password">Mot de passe</label>
          <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
          <span className="hint">8 caractères minimum</span>
        </div>
        <div className="field">
          <label htmlFor="city">Ta ville</label>
          <select id="city" name="city" required defaultValue="">
            <option value="" disabled>Choisis ta ville</option>
            {SECTORS.map((s) => (
              <optgroup key={s.id} label={s.name}>
                {[...s.cities].sort((a, b) => a.localeCompare(b, "fr")).map((c) => <option key={c}>{c}</option>)}
              </optgroup>
            ))}
          </select>
          <span className="hint">Ta ville n'est pas dans la liste ? Choisis la plus proche.</span>
        </div>
        <Submit>Continuer</Submit>
      </form>
      <p className="sub">Déjà inscrit ? <Link href="/connexion">Me connecter</Link></p>
    </>
  );
}
