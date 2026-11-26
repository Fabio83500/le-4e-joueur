"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { q, one } from "@/db";
import { requireUser } from "@/lib/auth";

const enc = encodeURIComponent;
const MAX = 400 * 1024;

export async function saveAvatar(fd: FormData) {
  const u = await requireUser();
  if (fd.get("consent") !== "oui")
    redirect(`/profil/avatar?e=${enc("Coche la case pour accepter que ton avatar soit visible par les joueurs de l'appli.")}`);
  const file = fd.get("avatar");
  if (!(file instanceof File) || file.size === 0) redirect(`/profil/avatar?e=${enc("Choisis d'abord une photo.")}`);
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > MAX)
    redirect(`/profil/avatar?e=${enc("L'avatar n'a pas pu être enregistré. Réessaie avec une autre photo.")}`);
  const data = Buffer.from(await file.arrayBuffer());
  const row = await one<{ id: number }>(
    "INSERT INTO images (owner_id, mime, data, private, kind) VALUES ($1,$2,$3,FALSE,'avatar') RETURNING id",
    [u.id, file.type, data]);
  const old = u.avatar_image_id;
  await q("UPDATE users SET avatar_image_id = $2, avatar_consent_at = now() WHERE id = $1", [u.id, row!.id]);
  if (old) await q("DELETE FROM images WHERE id = $1 AND owner_id = $2", [old, u.id]);
  revalidatePath("/", "layout");
  redirect(`/profil?ok=${enc("Ton avatar est enregistré.")}`);
}

export async function deleteAvatar() {
  const u = await requireUser();
  await q("UPDATE users SET avatar_image_id = NULL, avatar_consent_at = NULL WHERE id = $1", [u.id]);
  // On efface aussi l'image elle-même (et toute ancienne version) : rien n'est gardé.
  await q("DELETE FROM images WHERE owner_id = $1 AND kind = 'avatar'", [u.id]);
  revalidatePath("/", "layout");
  redirect(`/profil?ok=${enc("Ton avatar a été supprimé.")}`);
}
