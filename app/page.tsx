import Link from "next/link";
import { container } from "@/features/container";

export default async function HomePage() {
  const auctions = await container.auctionService.getActiveAuctions();

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">Subastas en Línea</h1>
        <p className="text-lg text-ink-muted">
          Subastas con pujas en tiempo casi real, cuenta regresiva y cierre automático.
        </p>
      </header>

      <section aria-label="Subastas destacadas" className="space-y-4">
        <h2 className="text-xl font-bold text-ink">Subastas Activas</h2>
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {auctions.map((auction) => {
            const formattedPrice = new Intl.NumberFormat("es-CO", {
              style: "currency",
              currency: "COP",
              maximumFractionDigits: 0,
            }).format(Math.floor(auction.puja_actual_centavos / 100));

            return (
              <li key={auction.id} className="overflow-hidden rounded-xl border border-line bg-surface">
                <article className="flex h-full flex-col justify-between p-6">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold tracking-wide uppercase text-primary">Activa</p>
                    <h3 className="text-xl font-bold text-ink">{auction.titulo}</h3>
                    <p className="line-clamp-2 text-sm text-ink-muted">{auction.descripcion}</p>
                    <p className="text-lg font-extrabold text-ink">{formattedPrice}</p>
                  </div>
                  <div className="mt-6">
                    <Link
                      href={`/subastas/${auction.id}`}
                      className="inline-block w-full rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-primary-hover"
                    >
                      Ver subasta y cuenta regresiva
                    </Link>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </section>
    </article>
  );
}
