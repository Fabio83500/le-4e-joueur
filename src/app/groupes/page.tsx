import Link from "next/link";
import { q } from "@/db";
import { requireVerified } from "@/lib/auth";
import { GROUPS, SECTORS } from "@/lib/var";

export const metadata = { title: "Groupes · Le 4e Joueur" };

export default async function Page() {
  const u = await requireVerified();
  const counts = new Map(
    (await q<{ group_id: string; n: number }>("SELECT group_id, count(*)::int AS n FROM users WHERE group_id IS NOT NULL GROUP BY group_id"))
      .map((r) => [r.group_id, r.n]),
  );
  const mine = GROUPS.find((g) => g.id === u.group_id)!;
  const zones: { title: string; ids: string[] }[] = [
    { title: "Tout le Var", ids: ["competiteur-var"] },
    ...SECTORS.map((s) => ({ title: s.name, ids: GROUPS.filter((g) => g.sector === s.id).map((g) => g.id) })),
  ];
  return (
    <>
      <h1>Groupes</h1>
      <Link href={`/groupes/${mine.id}`} className="card" style={{ borderColor: "var(--blue-ink)" }}>
        <div className="row"><h2>{mine.name}</h2><span className="pill ok">Ton groupe</span></div>
        <div className="sub">{mine.range} · {mine.zone} · {counts.get(mine.id) ?? 0} membres</div>
      </Link>
      <p className="sub">Tu peux voir les autres groupes, mais tu ne peux écrire et jouer que dans le tien.</p>
      {zones.map((z) => (
        <section key={z.title} className="stack">
          <h3>{z.title}</h3>
          {z.ids.filter((id) => id !== mine.id).map((id) => {
            const g = GROUPS.find((x) => x.id === id)!;
            return (
              <Link key={id} href={`/groupes/${id}`} className="card">
                <div className="row"><b>{g.name}</b><span className="sub">{counts.get(id) ?? 0} membres</span></div>
                <div className="sub">{g.range}</div>
              </Link>
            );
          })}
        </section>
      ))}
    </>
  );
}
