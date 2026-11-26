import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { q, one } from "@/db";

const COOKIE = "q4_session";
const DAYS = 60;

export type User = {
  id: number;
  email: string;
  name: string;
  city: string;
  sector: string;
  role: "player" | "admin";
  verif_status: "none" | "pending" | "verified" | "rejected";
  verif_method: string | null;
  licence: string | null;
  ranking: number | null;
  unranked: boolean;
  group_id: string | null;
  reject_reason: string | null;
  avatar_image_id: number | null;
};

export const hashPassword = (p: string) => bcrypt.hash(p, 10);
export const checkPassword = (p: string, h: string) => bcrypt.compare(p, h);

export async function startSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + DAYS * 864e5);
  await q("INSERT INTO sessions (token, user_id, expires_at) VALUES ($1,$2,$3)", [token, userId, expires]);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires,
  });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await q("DELETE FROM sessions WHERE token = $1", [token]);
  jar.delete(COOKIE);
}

export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  return one<User>(
    `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token = $1 AND s.expires_at > now()`,
    [token],
  );
}

export async function requireUser() {
  const u = await currentUser();
  if (!u) redirect("/connexion");
  return u;
}

export async function requireVerified() {
  const u = await requireUser();
  if (!u.group_id) redirect("/verification");
  return u;
}

export async function requireAdmin() {
  const u = await requireUser();
  if (u.role !== "admin") redirect("/");
  return u;
}
