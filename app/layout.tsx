import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: { default: "OGM · Online Gaming Madness", template: "%s · OGM" },
  description:
    "La liga de esports móvil de Puerto Rico: Free Fire, Clash Royale y Brawlhalla. Inscripción gratis, ranking por juego y salón de campeones desde 2010.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap"
        />
      </head>
      <body>
        <header className="topbar">
          <div className="wrap">
            <Link href="/" className="brand">
              <b>OGM</b>
              <span>Puerto Rico</span>
            </Link>
            <nav className="nav">
              <Link href="/juegos">Juegos</Link>
              <Link href="/torneos">Torneos</Link>
              <Link href="/campeones">Campeones</Link>
              <Link href="/marcas">Marcas</Link>
            </nav>
            <Link className="nav-cta" href="/cuenta">
              {session ? session.name : "Entrar con Discord"}
            </Link>
          </div>
        </header>

        <main>{children}</main>

        <footer className="site">
          <div className="wrap">
            <div className="stack-sm">
              <div className="brand">
                <b>OGM</b>
                <span>2026</span>
              </div>
              <p className="small">
                Online Gaming Madness. Los resultados de 2010 vienen del archivo público de
                ogmadness.net.
              </p>
            </div>
            <p className="small">
              Ranking con OpenSkill · Hecho en Puerto Rico · <Link href="/admin">Panel</Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
