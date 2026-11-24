"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { q, one } from "@/db";
import { requireVerified } from "@/lib/auth";
import { ImageError, realFiles, saveImage } from "@/lib/images";
import { ALL_CITIES, CATEGORIES, CONDITIONS } from "@/lib/var";

const enc = encodeURIComponent;

export async function createListing(fd: FormData) {
  const u = await requireVerified();
  const title = String(fd.get("title") ?? "").trim().slice(0, 80);
  const category = String(fd.get("category") ?? "");
  const condition = String(fd.get("condition") ?? "");
  const city = String(fd.get("city") ?? "");
  const price = Math.round(Number(String(fd.get("price") ?? "").replace(",", ".")));
  const description = String(fd.get("description") ?? "").trim().slice(0, 2000);
  const files = realFiles(fd.getAll("photos")).slice(0, 5);
  const fail = (m: string) => redirect(`/annonces/nouvelle?e=${enc(m)}`);
  if (title.length < 3) fail("Donne un titre à ton annonce.");
  if (!CATEGORIES.includes(category)) fail("Choisis une catégorie.");
  if (!CONDITIONS.includes(condition)) fail("Indique l'état de l'article.");
  if (!ALL_CITIES.includes(city)) fail("Choisis une ville.");
  if (!Number.isFinite(price) || price < 0 || price > 5000) fail("Indique un prix entre 0 et 5 000 €.");
  const ids: number[] = [];
  try {
    for (const f of files) ids.push(await saveImage(f, u.id));
  } catch (err) {
    if (err instanceof ImageError) fail(err.message);
    throw err;
  }
  const l = await one<{ id: number }>(
    "INSERT INTO listings (user_id, title, category, price, condition, city, description) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id",
    [u.id, title, category, price, condition, city, description],
  );
  for (const [i, id] of ids.entries()) await q("INSERT INTO listing_images (listing_id, image_id, pos) VALUES ($1,$2,$3)", [l!.id, id, i]);
  redirect(`/annonces/${l!.id}?ok=${enc("Annonce publiée.")}`);
}

export async function setListingStatus(fd: FormData) {
  const u = await requireVerified();
  const id = Number(fd.get("id"));
  const status = String(fd.get("status"));
  if (!["active", "sold", "deleted"].includes(status)) return;
  await q(`UPDATE listings SET status = $3 WHERE id = $1 AND (user_id = $2 OR $4)`, [id, u.id, status, u.role === "admin"]);
  if (status === "deleted") redirect("/annonces/mes-annonces");
  revalidatePath(`/annonces/${id}`);
}

export async function contactSeller(fd: FormData) {
  const u = await requireVerified();
  const id = Number(fd.get("id"));
  const body = String(fd.get("body") ?? "").trim().slice(0, 2000);
  const l = await one<{ user_id: number }>("SELECT user_id FROM listings WHERE id = $1 AND status = 'active'", [id]);
  if (!l || l.user_id === u.id || !body) redirect(`/annonces/${id}`);
  const c = await one<{ id: number }>(
    `INSERT INTO conversations (listing_id, buyer_id) VALUES ($1,$2)
     ON CONFLICT (listing_id, buyer_id) DO UPDATE SET listing_id = EXCLUDED.listing_id RETURNING id`, [id, u.id]);
  await q("INSERT INTO conversation_messages (conversation_id, sender_id, body) VALUES ($1,$2,$3)", [c!.id, u.id, body]);
  redirect(`/messages/${c!.id}`);
}

export async function reply(fd: FormData) {
  const u = await requireVerified();
  const id = Number(fd.get("conversation"));
  const body = String(fd.get("body") ?? "").trim().slice(0, 2000);
  const c = await one(
    `SELECT 1 FROM conversations c JOIN listings l ON l.id = c.listing_id WHERE c.id = $1 AND (c.buyer_id = $2 OR l.user_id = $2)`, [id, u.id]);
  if (c && body) await q("INSERT INTO conversation_messages (conversation_id, sender_id, body) VALUES ($1,$2,$3)", [id, u.id, body]);
  revalidatePath(`/messages/${id}`);
}
