import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Subastas en línea con pujas y cuenta regresiva",
  description: "Subastas con pujas en tiempo casi real, cuenta regresiva y cierre automático.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col bg-surface text-ink">
        <a href="#contenido" className="skip-link">
          Saltar al contenido
        </a>
        <header className="border-b border-line bg-surface-alt px-4 py-3">
          <nav aria-label="Navegación principal" className="mx-auto flex max-w-5xl items-center justify-between">
            <Link href="/" className="text-xl font-extrabold tracking-tight text-primary-strong hover:opacity-90">
              Subastas en Línea
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/mis-pujas"
                className="flex min-h-[44px] items-center rounded-lg border border-line bg-surface px-3.5 py-2 text-sm font-semibold text-ink transition hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Mis pujas
              </Link>
              <Link
                href="/vender"
                className="flex min-h-[44px] items-center rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                + Publicar subasta
              </Link>
            </div>
          </nav>
        </header>
        <main id="contenido" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-line bg-surface-alt px-4 py-6 text-center">
          <p className="text-sm text-ink-muted">Proyecto 41 · Subastas en línea con pujas y cuenta regresiva</p>
        </footer>
      </body>
    </html>
  );
}
