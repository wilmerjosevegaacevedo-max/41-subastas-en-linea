import type { Metadata } from "next";
import { PublishAuctionForm } from "@/features/auctions/ui/publish-auction-form";

export const metadata: Metadata = {
  title: "Publicar Subasta | Subastas en Línea",
  description: "Publica un artículo para subasta con cuenta regresiva viva y reglas de puja transparentes.",
};

export default function VenderPage() {
  return (
    <article className="mx-auto max-w-2xl space-y-8">
      <header className="space-y-2 text-center sm:text-left">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Venta de artículos</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">Publicar una nueva subasta</h1>
        <p className="text-sm text-ink-muted">
          Completa los datos del artículo. El incremento de puja se calculará de manera automática y tu subasta estará
          disponible en el catálogo de inmediato.
        </p>
      </header>

      <section
        aria-label="Formulario de creación de subasta"
        className="rounded-2xl border border-line bg-surface p-6 sm:p-8 shadow-xs"
      >
        <PublishAuctionForm />
      </section>
    </article>
  );
}
