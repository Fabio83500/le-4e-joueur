"use server";
import { redirect } from "next/navigation";
import { q } from "@/db";
import { requireUser } from "@/lib/auth";
import { ImageError, saveImage } from "@/lib/images";

const enc = encodeURIComponent;

export async function submitVerification(fd: FormData) {
  const u = await requireUser();
  const method = String(fd.get("method") ?? "");
  if (method === "licence") {
    const licence = String(fd.get("licence") ?? "").trim().toUpperCase();
    if (!/^[0-9]{5,9}\s?[A-Z]?$/.test(licence))
      redirect(`/verification?e=${enc("Le numéro de licence ressemble à 1234567 A. Vérifie-le sur ta carte ou dans TenUp.")}`);
    await q("UPDATE users SET verif_status='pending', verif_method='licence', licence=$2, reject_reason=NULL WHERE id=$1", [u.id, licence]);
  } else if (method === "capture") {
    const file = fd.get("capture");
    if (!(file instanceof File) || file.size === 0) redirect(`/verification?e=${enc("Ajoute la capture d'écran de ton profil TenUp.")}`);
    let id: number;
    try {
      id = await saveImage(file, u.id, true);
    } catch (err) {
      if (err instanceof ImageError) redirect(`/verification?e=${enc(err.message)}`);
      throw err;
    }
    await q("UPDATE users SET verif_status='pending', verif_method='capture', capture_image_id=$2, reject_reason=NULL WHERE id=$1", [u.id, id]);
  } else if (method === "none") {
    await q("UPDATE users SET verif_status='pending', verif_method='none', reject_reason=NULL WHERE id=$1", [u.id]);
  } else {
    redirect(`/verification?e=${enc("Choisis comment vérifier ton niveau.")}`);
  }
  redirect("/verification");
}
