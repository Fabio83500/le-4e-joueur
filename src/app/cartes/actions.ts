"use server";
import { q, one } from "@/db";
import { requireUser } from "@/lib/auth";
import { drawCard, PACK_SIZE, STREAK_BONUS_DAYS } from "@/lib/cards";
import { parisToday } from "@/lib/format";

export type PulledCard = { id: string; isNew: boolean; count: number };
export type PackResult = { ok: true; cards: PulledCard[]; bonus: boolean; streak: number } | { ok: false; error: string };

export async function openPack(): Promise<PackResult> {
  const u = await requireUser();
  const today = parisToday();
  if (await one("SELECT 1 FROM pack_openings WHERE user_id = $1 AND day = $2", [u.id, today]))
    return { ok: false, error: "Tu as déjà ouvert ton pack aujourd'hui. Reviens demain !" };
  const prev = await one<{ streak: number }>("SELECT streak FROM pack_openings WHERE user_id = $1 AND day = ($2::date - 1)", [u.id, today]);
  const streak = (prev?.streak ?? 0) + 1;
  const bonus = streak % STREAK_BONUS_DAYS === 0;
  const drawn = Array.from({ length: PACK_SIZE }, () => drawCard());
  if (bonus) drawn.push(drawCard(Math.random, "epic"));
  const ins = await q(
    "INSERT INTO pack_openings (user_id, day, streak, cards) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING RETURNING 1",
    [u.id, today, streak, drawn.map((c) => c.id).join(",")]);
  if (!ins.length) return { ok: false, error: "Tu as déjà ouvert ton pack aujourd'hui. Reviens demain !" };
  const out: PulledCard[] = [];
  for (const c of drawn) {
    const r = await one<{ count: number }>(
      `INSERT INTO user_cards (user_id, card_id) VALUES ($1,$2)
       ON CONFLICT (user_id, card_id) DO UPDATE SET count = user_cards.count + 1 RETURNING count`, [u.id, c.id]);
    out.push({ id: c.id, isNew: r!.count === 1, count: r!.count });
  }
  // Les cartes les plus rares sont révélées en dernier, pour le suspense.
  const order = { common: 0, rare: 1, epic: 2, legend: 3 } as const;
  out.sort((a, b) => order[drawn.find((d) => d.id === a.id)!.rarity] - order[drawn.find((d) => d.id === b.id)!.rarity]);
  return { ok: true, cards: out, bonus, streak };
}

// Pack de démonstration pour l'admin : une carte de chaque rareté, rien n'est enregistré.
export async function openDemoPack(): Promise<PackResult> {
  const u = await requireUser();
  if (u.role !== "admin") return { ok: false, error: "Réservé à l'admin." };
  const { CARDS } = await import("@/lib/cards");
  const pick = (r: string) => { const pool = CARDS.filter((c) => c.rarity === r); return pool[Math.floor(Math.random() * pool.length)]!; };
  const cards = ["common", "rare", "epic", "legend"].map((r) => ({ id: pick(r).id, isNew: true, count: 1 }));
  return { ok: true, cards, bonus: true, streak: 7 };
}
