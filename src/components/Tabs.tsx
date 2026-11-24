"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Accueil", icon: <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /> },
  { href: "/groupes", label: "Groupes", icon: <><circle cx="8" cy="8" r="3" /><circle cx="16" cy="8" r="3" /><path d="M2 20c0-3.5 2.7-6 6-6s6 2.5 6 6M12 20c0-3.5 2.2-6 4-6 3.3 0 6 2.5 6 6" /></> },
  { href: "/cartes", label: "Cartes", icon: <><rect x="3" y="6" width="11" height="15" rx="2" /><path d="M9 3h10a2 2 0 0 1 2 2v13" /></> },
  { href: "/annonces", label: "Annonces", icon: <path d="M3 9l2-5h14l2 5M3 9h18v11H3zM9 13h6" /> },
  { href: "/profil", label: "Profil", icon: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></> },
];

export function Tabs({ unread }: { unread: number }) {
  const path = usePathname();
  return (
    <nav className="tabs" aria-label="Navigation principale">
      <div className="tabs-in">
        {TABS.map((t) => {
          const active = t.href === "/" ? path === "/" : path.startsWith(t.href) || (t.href === "/profil" && (path.startsWith("/messages") || path.startsWith("/admin")));
          return (
            <Link key={t.href} href={t.href} aria-current={active ? "page" : undefined}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{t.icon}</svg>
              {t.label}
              {t.href === "/profil" && unread > 0 && <span className="dot">{unread}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
