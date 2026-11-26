import "server-only";
import { q, one } from "@/db";

export async function unreadCount(userId: number) {
  const r = await one<{ n: number }>(
    `SELECT count(*)::int AS n FROM conversation_messages m
     JOIN conversations c ON c.id = m.conversation_id
     JOIN listings l ON l.id = c.listing_id
     WHERE m.read_at IS NULL AND m.sender_id <> $1 AND (c.buyer_id = $1 OR l.user_id = $1)`,
    [userId],
  );
  return r?.n ?? 0;
}

export type Partner = { id: number; name: string; tagline: string; url: string | null };

export async function featuredPartner(): Promise<Partner | null> {
  return one<Partner>("SELECT id, name, tagline, url FROM partners WHERE active ORDER BY random() LIMIT 1");
}

export type ListingCard = { id: number; title: string; price: number; city: string; category: string; image_id: number | null };

export async function listingCards(where = "TRUE", params: unknown[] = [], limit = 60): Promise<ListingCard[]> {
  return q<ListingCard>(
    `SELECT l.id, l.title, l.price, l.city, l.category,
       (SELECT image_id FROM listing_images li WHERE li.listing_id = l.id ORDER BY pos LIMIT 1) AS image_id
     FROM listings l WHERE l.status = 'active' AND ${where}
     ORDER BY l.created_at DESC LIMIT ${Number(limit)}`,
    params,
  );
}

export type MatchRow = {
  id: number; group_id: string; starts_at: string; note: string | null; seats: number; created_by: number;
  club_name: string | null; club_city: string | null; players: { id: number; name: string; avatar: number | null }[];
};

export async function upcomingMatches(groupId: string): Promise<MatchRow[]> {
  return q<MatchRow>(
    `SELECT m.id, m.group_id, m.starts_at, m.note, m.seats, m.created_by, c.name AS club_name, c.city AS club_city,
       COALESCE((SELECT json_agg(json_build_object('id', u.id, 'name', u.name, 'avatar', u.avatar_image_id) ORDER BY u.id)
                 FROM match_players mp JOIN users u ON u.id = mp.user_id WHERE mp.match_id = m.id), '[]'::json) AS players
     FROM matches m LEFT JOIN clubs c ON c.id = m.club_id
     WHERE m.group_id = $1 AND m.starts_at > now() - interval '2 hours'
     ORDER BY m.starts_at`,
    [groupId],
  );
}
