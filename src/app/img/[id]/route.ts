import { one } from "@/db";
import { currentUser } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const img = await one<{ mime: string; data: Uint8Array; private: boolean; owner_id: number }>(
    "SELECT mime, data, private, owner_id FROM images WHERE id = $1", [Number(id) || 0]);
  if (!img) return new Response("Introuvable", { status: 404 });
  if (img.private) {
    const u = await currentUser();
    if (!u || (u.role !== "admin" && u.id !== img.owner_id)) return new Response("Accès refusé", { status: 403 });
  }
  return new Response(Buffer.from(img.data), {
    headers: {
      "Content-Type": img.mime,
      "Cache-Control": img.private ? "private, no-store" : "public, max-age=31536000, immutable",
    },
  });
}
