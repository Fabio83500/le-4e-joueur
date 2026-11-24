import Link from "next/link";
import { q, one } from "@/db";
import { requireUser } from "@/lib/auth";
import { CARDS, getCard, PAGES, STREAK_BONUS_DAYS } from "@/lib/cards";
import { parisToday } from "@/lib/format";
import { openPack } from "./actions";
import { Card } from "@/components/Card";
import { Logo } from "@/components/Logo";
import { Submit } from "@/components/Submit";

export const metadata = { title: "Cartes · Le 4e Joueur" };

export default async function Page({ searchParams }: { searchParams: Promise<{ ouvert?: string; page?: string }> }) {
  const u = await requireUser();
  const { ouvert, page } = await searchParams;
  const today = parisToday();
  const [todayPack, last, owned] = await Promise.all([
    one<{ cards: string; streak: number }>("SELECT cards, streak FROM pack_openings WHERE user_id = $1 AND day = $2", [u.id, today]),
    one<{ streak: number; day: string }>(
      "SELECT streak, to_char(day, 'YYYY-MM-DD') AS day FROM pack_openings WHERE user_id = $1 ORDER BY day DESC LIMIT 1", [u.id]),
    q<{ card_id: string; count: number }>("SELECT card_id, count FROM user_cards WHERE user_id = $1", [u.id]),
  ]);
  const have = new Map(owned.map((o) => [o.card_id, o.count]));
  const yesterday = new Date(Date.parse(today) - 864e5).toISOString().slice(0, 10);
  const streak = todayPack ? todayPack.streak : last && last.day === yesterday ? last.streak : 0;
  const lit = todayPack ? ((streak - 1) % STREAK_BONUS_DAYS) + 1 : streak % STREAK_BONUS_DAYS;
  const nextIsBonus = !todayPack && (streak + 1) % STREAK_BONUS_DAYS === 0;
  const current = PAGES.includes(page ?? "") ? page! : PAGES[0]!;
  const pageCards = CARDS.filter((c) => c.page === current);
  const total = CARDS.filter((c) => have.has(c.id)).length;

  return (
    <>
      <div className="stack" style={{ gap: 4 }}>
        <h1>Mes cartes</h1>
        <p className="sub">Un pack gratuit chaque jour. Ouvre-le {STREAK_BONUS_DAYS} jours de suite pour gagner un pack bonus avec une carte épique ou mieux.</p>
      </div>

      <section className="card" style={{ justifyItems: "center", textAlign: "center" }}>
        <div className="streak" aria-label={`Série de ${streak} jour${streak > 1 ? "s" : ""}`}>
          <span>Série :</span>
          {Array.from({ length: STREAK_BONUS_DAYS }, (_, i) => (
            <i key={i} className={i < lit ? "on" : ""}>{i === STREAK_BONUS_DAYS - 1 ? "🎁" : i + 1}</i>
          ))}
        </div>
        {todayPack ? (
          <>
            <h2>{ouvert ? "Ton pack du jour" : "Pack du jour ouvert"}</h2>
            <div className="reveal">
              {todayPack.cards.split(",").map((id, i) => {
                const c = getCard(id);
                return c ? <Card key={i} c={c} delay={ouvert ? i * 0.25 : undefined} /> : null;
              })}
            </div>
            <p className="sub">Reviens demain pour ton prochain pack.</p>
          </>
        ) : (
          <form action={openPack} className="stack" style={{ justifyItems: "center" }}>
            <button type="submit" className="pack" aria-label="Ouvrir le pack du jour">
              <Logo /><b>{nextIsBonus ? "Pack bonus" : "Pack du jour"}</b><small>{nextIsBonus ? "4 cartes dont 1 épique" : "3 cartes"}</small>
            </button>
            <Submit className="btn small" pendingText="Ouverture…">Ouvrir mon pack</Submit>
          </form>
        )}
      </section>

      <section className="stack">
        <div className="row"><h2>Mon album</h2><span className="sub">{total} / {CARDS.length} cartes</span></div>
        <div className="bar" aria-hidden="true"><span style={{ width: `${(total / CARDS.length) * 100}%` }} /></div>
        <nav className="filters" aria-label="Pages de l'album">
          {PAGES.map((p) => {
            const n = CARDS.filter((c) => c.page === p);
            return <Link key={p} href={`/cartes?page=${encodeURIComponent(p)}`} aria-current={p === current ? "true" : undefined}>{p} {n.filter((c) => have.has(c.id)).length}/{n.length}</Link>;
          })}
        </nav>
        <div className="cards-grid">
          {pageCards.map((c, i) => have.has(c.id)
            ? <Card key={c.id} c={c} small count={have.get(c.id)} />
            : <div key={c.id} className="slot">{i + 1}</div>)}
        </div>
        <p className="sub">Le badge rouge indique un double. Les échanges entre membres arrivent bientôt.</p>
      </section>
    </>
  );
}
