import { one } from "@/db";
import { currentUser } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const img = await one<{ mime: string; data: Uint8Array; private: boolean; owner_id: number; kind: string | null }>(
    "SELECT mime, data, private, owner_id, kind FROM images WHERE id = $1", [Number(id) || 0]);
  if (!img) return new Response("Introuvable", { status: 404 });
  const avatar = img.kind === "avatar";
  if (img.private || avatar) {
    const u = await currentUser();
    // Avatars : visibles seulement par les joueurs connectés, jamais par le public.
    if (!u) return new Response("Accès refusé", { status: 403 });
    if (img.private && u.role !== "admin" && u.id !== img.owner_id) return new Response("Accès refusé", { status: 403 });
  }
  return new Response(Buffer.from(img.data), {
    headers: {
      "Content-Type": img.mime,
      "Cache-Control": img.private ? "private, no-store" : avatar ? "private, max-age=3600" : "public, max-age=31536000, immutable",
    },
  });
}
