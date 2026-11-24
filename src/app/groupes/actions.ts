"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { q, one } from "@/db";
import { requireVerified } from "@/lib/auth";
import { parisDate } from "@/lib/format";

const enc = encodeURIComponent;

async function memberOf(groupId: string) {
  const u = await requireVerified();
  if (u.group_id !== groupId) redirect(`/groupes/${groupId}`);
  return u;
}

export async function postMessage(fd: FormData) {
  const groupId = String(fd.get("group"));
  const u = await memberOf(groupId);
  const body = String(fd.get("body") ?? "").trim().slice(0, 1000);
  if (body) await q("INSERT INTO group_messages (group_id, user_id, body) VALUES ($1,$2,$3)", [groupId, u.id, body]);
  revalidatePath(`/groupes/${groupId}`);
}

export async function proposeMatch(fd: FormData) {
  const groupId = String(fd.get("group"));
  const u = await memberOf(groupId);
  const when = parisDate(String(fd.get("date") ?? ""), String(fd.get("time") ?? ""));
  if (!when || when.getTime() < Date.now()) redirect(`/groupes/${groupId}?e=${enc("Choisis une date et une heure à venir.")}#proposer`);
  const club = Number(fd.get("club")) || null;
  const note = String(fd.get("note") ?? "").trim().slice(0, 300) || null;
  // Nombre de joueurs déjà prévus avec l'organisateur (lui compris) : 1, 2 ou 3.
  const already = Math.min(3, Math.max(1, Number(fd.get("players")) || 1));
  const seats = 4 - (already - 1);
  const m = await one<{ id: number }>(
    "INSERT INTO matches (group_id, club_id, starts_at, note, seats, created_by) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id",
    [groupId, club, when, note, seats, u.id],
  );
  await q("INSERT INTO match_players (match_id, user_id) VALUES ($1,$2)", [m!.id, u.id]);
  redirect(`/groupes/${groupId}?ok=${enc("Partie publiée. Les membres du groupe la voient sur leur accueil.")}`);
}

export async function joinMatch(fd: FormData) {
  const u = await requireVerified();
  const id = Number(fd.get("match"));
  const m = await one<{ group_id: string; n: number; seats: number }>(
    "SELECT m.group_id, m.seats, (SELECT count(*)::int FROM match_players WHERE match_id = m.id) AS n FROM matches m WHERE id = $1", [id]);
  if (m && m.group_id === u.group_id && m.n < m.seats) {
    await q("INSERT INTO match_players (match_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", [id, u.id]);
  }
  revalidatePath("/", "layout");
}

export async function leaveMatch(fd: FormData) {
  const u = await requireVerified();
  const id = Number(fd.get("match"));
  await q("DELETE FROM match_players WHERE match_id = $1 AND user_id = $2", [id, u.id]);
  await q("DELETE FROM matches WHERE id = $1 AND NOT EXISTS (SELECT 1 FROM match_players WHERE match_id = $1)", [id]);
  revalidatePath("/", "layout");
}
