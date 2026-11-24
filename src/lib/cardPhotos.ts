import "server-only";
import { q } from "@/db";

export async function cardPhotos(): Promise<Record<string, number>> {
  const rows = await q<{ card_id: string; image_id: number }>("SELECT card_id, image_id FROM card_photos");
  return Object.fromEntries(rows.map((r) => [r.card_id, r.image_id]));
}
