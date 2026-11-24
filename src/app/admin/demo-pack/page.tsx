import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { cardPhotos } from "@/lib/cardPhotos";
import { PackOpener } from "@/app/cartes/PackOpener";

export const metadata = { title: "Pack de démonstration · Le 4e Joueur" };

export default async function Page() {
  await requireAdmin();
  return (
    <>
      <Link href="/admin">‹ Espace admin</Link>
      <h1>Pack de démonstration</h1>
      <p className="sub">Une carte de chaque rareté, de la commune à la légendaire, pour voir toutes les animations ou les montrer à un partenaire. Rien n'est ajouté à ton album.</p>
      <section className="card packcard"><PackOpener bonus photos={await cardPhotos()} demo /></section>
    </>
  );
}
