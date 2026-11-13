import type { Metadata } from "next";
import type { ReactNode } from "react";
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
        <header className="border-b border-line bg-surface-alt px-4 py-4">
          <nav aria-label="Navegación principal" className="mx-auto flex max-w-5xl items-center justify-between">
            <p className="text-xl font-bold text-primary-strong">Subastas en Línea</p>
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
