import type { Metadata } from "next";
import { container } from "@/features/container";
import { MyBidsView } from "@/features/bids/ui/my-bids-view";

export const metadata: Metadata = {
  title: "Mis Pujas | Subastas en Línea",
  description: "Consulta el estado de tus ofertas, subastas ganadas y participa en subastas activas.",
};

export default async function MisPujasPage() {
  const buyerUid = "comprador-demo-01";
  const userBids = await container.bidService.getBidsForUser(buyerUid);

  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Panel del comprador</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">Historial de mis pujas</h1>
        <p className="text-sm text-ink-muted">
          Monitorea tus ofertas en tiempo real, entérate si alguien superó tu puja y revisa tus artículos ganados.
        </p>
      </header>

      <section aria-label="Listado de mis pujas">
        <MyBidsView initialBids={userBids} />
      </section>
    </article>
  );
}
