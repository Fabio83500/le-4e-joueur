"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { q, one } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { groupFor, type SectorId } from "@/lib/var";

const enc = encodeURIComponent;

export async function validateUser(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const unranked = fd.get("unranked") === "on";
  const raw = String(fd.get("ranking") ?? "").replace(/\s/g, "");
  const ranking = unranked ? null : Number(raw);
  if (!unranked && (!Number.isInteger(ranking) || ranking! < 1)) redirect(`/admin?e=${enc("Saisis le classement (un nombre) ou coche « Non classé ».")}`);
  const u = await one<{ sector: SectorId }>("SELECT sector FROM users WHERE id = $1", [id]);
  if (!u) return;
  await q(
    "UPDATE users SET verif_status='verified', ranking=$2, unranked=$3, group_id=$4, reject_reason=NULL WHERE id=$1",
    [id, ranking, unranked, groupFor(ranking, u.sector)],
  );
  revalidatePath("/admin");
}

export async function rejectUser(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const reason = String(fd.get("reason") ?? "").trim().slice(0, 200) || null;
  // Un joueur déjà dans un groupe qui demandait une mise à jour garde son ancien niveau.
  await q(
    `UPDATE users SET verif_status = CASE WHEN group_id IS NULL THEN 'rejected' ELSE 'verified' END, reject_reason=$2 WHERE id=$1`,
    [id, reason],
  );
  revalidatePath("/admin");
}

export async function addPartner(fd: FormData) {
  await requireAdmin();
  const name = String(fd.get("name") ?? "").trim();
  const tagline = String(fd.get("tagline") ?? "").trim();
  let url = String(fd.get("url") ?? "").trim() || null;
  if (url && !/^https?:\/\//.test(url)) url = `https://${url}`;
  if (name && tagline) await q("INSERT INTO partners (name, tagline, url) VALUES ($1,$2,$3)", [name, tagline, url]);
  revalidatePath("/admin");
}

export async function togglePartner(fd: FormData) {
  await requireAdmin();
  await q("UPDATE partners SET active = NOT active WHERE id = $1", [Number(fd.get("id"))]);
  revalidatePath("/admin");
}

export async function deletePartner(fd: FormData) {
  await requireAdmin();
  await q("DELETE FROM partners WHERE id = $1", [Number(fd.get("id"))]);
  revalidatePath("/admin");
}

export async function setCardPhoto(fd: FormData) {
  const admin = await requireAdmin();
  const cardId = String(fd.get("card"));
  const { getCard } = await import("@/lib/cards");
  const { saveImage, ImageError } = await import("@/lib/images");
  const file = fd.get("photo");
  if (!getCard(cardId) || !(file instanceof File) || file.size === 0) redirect(`/admin/cartes?e=${enc("Choisis une photo.")}`);
  let id: number;
  try { id = await saveImage(file, admin.id); }
  catch (err) { if (err instanceof ImageError) redirect(`/admin/cartes?e=${enc(err.message)}`); throw err; }
  await q(`INSERT INTO card_photos (card_id, image_id) VALUES ($1,$2)
           ON CONFLICT (card_id) DO UPDATE SET image_id = EXCLUDED.image_id`, [cardId, id]);
  revalidatePath("/admin/cartes");
}

export async function removeCardPhoto(fd: FormData) {
  await requireAdmin();
  await q("DELETE FROM card_photos WHERE card_id = $1", [String(fd.get("card"))]);
  revalidatePath("/admin/cartes");
}
