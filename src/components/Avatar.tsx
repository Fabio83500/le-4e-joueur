import { initials } from "@/lib/format";

// Avatar d'un joueur : son image s'il en a créé une, sinon ses initiales.
export function Avatar({ name, image, size, className = "" }: { name: string; image?: number | null; size?: "big" | "huge"; className?: string }) {
  const cls = `av${size ? ` ${size}` : ""}${className ? ` ${className}` : ""}`;
  if (image) return <img className={`${cls} pic`} src={`/img/${image}`} alt="" loading="lazy" />;
  return <span className={cls} aria-hidden="true">{initials(name)}</span>;
}
