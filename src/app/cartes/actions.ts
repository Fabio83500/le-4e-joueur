"use server";
import { redirect } from "next/navigation";
import { q, one } from "@/db";
import { requireUser } from "@/lib/auth";
import { drawCard, PACK_SIZE, STREAK_BONUS_DAYS } from "@/lib/cards";
import { parisToday } from "@/lib/format";

export async function openPack() {
  const u = await requireUser();
  const today = parisToday();
  if (await one("SELECT 1 FROM pack_openings WHERE user_id = $1 AND day = $2", [u.id, today])) redirect("/cartes");
  const prev = await one<{ streak: number }>("SELECT streak FROM pack_openings WHERE user_id = $1 AND day = ($2::date - 1)", [u.id, today]);
  const streak = (prev?.streak ?? 0) + 1;
  const bonus = streak % STREAK_BONUS_DAYS === 0;
  const drawn = Array.from({ length: PACK_SIZE }, () => drawCard());
  if (bonus) drawn.push(drawCard(Math.random, "epic"));
  const ins = await q(
    "INSERT INTO pack_openings (user_id, day, streak, cards) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING RETURNING 1",
    [u.id, today, streak, drawn.map((c) => c.id).join(",")]);
  if (ins.length) {
    for (const c of drawn) {
      await q(`INSERT INTO user_cards (user_id, card_id) VALUES ($1,$2)
               ON CONFLICT (user_id, card_id) DO UPDATE SET count = user_cards.count + 1`, [u.id, c.id]);
    }
  }
  redirect("/cartes?ouvert=1");
}
