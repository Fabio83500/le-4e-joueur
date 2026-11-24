import "server-only";
import { one } from "@/db";

const MAX = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export class ImageError extends Error {}

export async function saveImage(file: File, ownerId: number, isPrivate = false): Promise<number> {
  if (!TYPES.includes(file.type)) throw new ImageError("Format d'image non accepté. Utilise une photo JPG, PNG ou WebP.");
  if (file.size > MAX) throw new ImageError("Image trop lourde : 5 Mo maximum par photo.");
  const data = Buffer.from(await file.arrayBuffer());
  const row = await one<{ id: number }>(
    "INSERT INTO images (owner_id, mime, data, private) VALUES ($1,$2,$3,$4) RETURNING id",
    [ownerId, file.type, data, isPrivate],
  );
  return row!.id;
}

export function realFiles(list: FormDataEntryValue[]): File[] {
  return list.filter((f): f is File => typeof f !== "string" && f.size > 0);
}
