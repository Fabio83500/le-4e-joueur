const TZ = "Europe/Paris";

export function formatDateTime(d: Date | string) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: TZ,
  }).format(new Date(d));
}

export function formatShort(d: Date | string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: TZ }).format(new Date(d));
}

export function formatPrice(euros: number) {
  return `${euros.toLocaleString("fr-FR")} €`;
}

export function formatRank(rank: number | null, unranked: boolean) {
  if (unranked || rank === null) return "Non classé";
  return `Classement ${rank.toLocaleString("fr-FR")}`;
}

export function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("");
}

// Convertit "2026-11-28" + "18:30" (heure de Paris) en Date.
export function parisDate(date: string, time: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const guess = new Date(`${date}T${time}:00Z`);
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(guess);
  const h = Number(parts.find((p) => p.type === "hour")!.value);
  const m = Number(parts.find((p) => p.type === "minute")!.value);
  const offsetMin = (h * 60 + m) - (guess.getUTCHours() * 60 + guess.getUTCMinutes());
  const norm = ((offsetMin + 720) % 1440 + 1440) % 1440 - 720;
  return new Date(guess.getTime() - norm * 60000);
}
