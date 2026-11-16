// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { AuctionDetail } from "../schema";
import { AuctionCard } from "../ui/auction-card";

afterEach(() => {
  cleanup();
});

const sampleAuction: AuctionDetail = {
  id: "subasta-reloj-01",
  titulo: "Reloj Omega Speedmaster 1969",
  descripcion: "Cronógrafo clásico de cuerda manual en excelente estado.",
  fotos: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9"],
  precio_inicial_centavos: 28000000,
  incremento_centavos: 1000000,
  puja_actual_centavos: 31000000,
  vendedor_uid: "vendedor-demo-01",
  ganador_uid: "comprador-demo-01",
  cierra_en: new Date(Date.now() + 86400000).toISOString(),
  estado: "activa",
};

describe("AuctionCard Component (React Testing Library)", () => {
  it("renderiza como article accesible con título, descripción y precio formateado", () => {
    render(<AuctionCard auction={sampleAuction} />);

    const article = screen.getByRole("article");
    expect(article).toBeInTheDocument();

    const heading = screen.getByRole("heading", { level: 3, name: /reloj omega speedmaster 1969/i });
    expect(heading).toBeInTheDocument();

    expect(screen.getByText(/310.000/)).toBeInTheDocument();
  });

  it("ofrece un enlace accesible a la ficha de la subasta con texto 'Ver subasta'", () => {
    render(<AuctionCard auction={sampleAuction} />);

    const link = screen.getByRole("link", { name: /ver subasta/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/subastas/subasta-reloj-01");
  });
});
