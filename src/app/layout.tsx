import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { currentUser } from "@/lib/auth";
import { unreadCount } from "@/lib/queries";
import { Logo } from "@/components/Logo";
import { Tabs } from "@/components/Tabs";

export const metadata: Metadata = {
  title: "Le 4e Joueur",
  description: "Les joueurs de padel du Var : trouve des partenaires de ton niveau et revends ton matériel.",
};
export const viewport: Viewport = { themeColor: "#1859b8", viewportFit: "cover" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  const unread = user ? await unreadCount(user.id) : 0;
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito+Sans:opsz,wght@6..12,400;6..12,700;6..12,800&display=swap" />
      </head>
      <body>
        <header className="topbar">
          <div className="topbar-in">
            <Link href="/"><Logo />Le 4e Joueur</Link>
            {!user && <div className="right"><Link href="/connexion">Connexion</Link></div>}
          </div>
        </header>
        <main>{children}</main>
        {user && <Tabs unread={unread} />}
      </body>
    </html>
  );
}
