"use server";
import { redirect } from "next/navigation";
import { q, one } from "@/db";
import { checkPassword, endSession, hashPassword, startSession } from "@/lib/auth";
import { sectorOfCity } from "@/lib/var";

const enc = encodeURIComponent;

export async function signUp(fd: FormData) {
  const name = String(fd.get("name") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const city = String(fd.get("city") ?? "");
  const sector = sectorOfCity(city);
  if (name.length < 2) redirect(`/inscription?e=${enc("Indique ton prénom et ton nom.")}`);
  if (!/^\S+@\S+\.\S+$/.test(email)) redirect(`/inscription?e=${enc("Cette adresse e-mail n'est pas valide.")}`);
  if (password.length < 8) redirect(`/inscription?e=${enc("Le mot de passe doit faire au moins 8 caractères.")}`);
  if (!sector) redirect(`/inscription?e=${enc("Choisis ta ville dans la liste.")}`);
  if (await one("SELECT 1 FROM users WHERE email = $1", [email]))
    redirect(`/inscription?e=${enc("Un compte existe déjà avec cet e-mail. Connecte-toi plutôt.")}`);
  const admin = process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL.toLowerCase();
  const u = await one<{ id: number }>(
    "INSERT INTO users (name, email, password_hash, city, sector, role) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id",
    [name, email, await hashPassword(password), city, sector, admin ? "admin" : "player"],
  );
  await startSession(u!.id);
  redirect("/verification");
}

export async function signIn(fd: FormData) {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const u = await one<{ id: number; password_hash: string }>("SELECT id, password_hash FROM users WHERE email = $1", [email]);
  if (!u || !(await checkPassword(password, u.password_hash)))
    redirect(`/connexion?e=${enc("E-mail ou mot de passe incorrect.")}`);
  await startSession(u.id);
  redirect("/");
}

export async function signOut() {
  await endSession();
  redirect("/connexion");
}

export async function deleteExpiredSessions() {
  await q("DELETE FROM sessions WHERE expires_at < now()");
}
