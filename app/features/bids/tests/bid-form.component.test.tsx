// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BidForm } from "../ui/bid-form";

afterEach(() => {
  cleanup();
});

describe("BidForm Component (React Testing Library)", () => {
  it("renderiza el formulario con etiqueta accesible, valor sugerido y botón de acción", () => {
    const handleAccepted = vi.fn();
    render(
      <BidForm
        subastaId="subasta-leica-01"
        pujaActualCentavos={15000000}
        incrementoCentavos={1000000}
        isClosed={false}
        onBidAccepted={handleAccepted}
      />,
    );

    const input = screen.getByLabelText(/tu oferta en pesos colombianos/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(160000); // 150.000 + 10.000 COP

    const button = screen.getByRole("button", { name: /pujar ahora/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it("muestra error accesible con role alert si el monto propuesto no supera el incremento mínimo", () => {
    const handleAccepted = vi.fn();
    render(
      <BidForm
        subastaId="subasta-leica-01"
        pujaActualCentavos={15000000}
        incrementoCentavos={1000000}
        isClosed={false}
        onBidAccepted={handleAccepted}
      />,
    );

    const input = screen.getByLabelText(/tu oferta en pesos colombianos/i);
    fireEvent.change(input, { target: { value: "155000" } }); // menor que 160.000

    const button = screen.getByRole("button", { name: /pujar ahora/i });
    const form = button.closest("form")!;
    fireEvent.submit(form);

    const alertMessage = screen.getByRole("alert");
    expect(alertMessage).toBeInTheDocument();
    expect(alertMessage).toHaveTextContent(/tu puja debe ser de al menos/i);
    expect(handleAccepted).not.toHaveBeenCalled();
  });

  it("renderiza aviso accesible de subasta finalizada cuando isClosed es verdadero", () => {
    const handleAccepted = vi.fn();
    render(
      <BidForm
        subastaId="subasta-leica-01"
        pujaActualCentavos={20000000}
        incrementoCentavos={1000000}
        isClosed={true}
        onBidAccepted={handleAccepted}
      />,
    );

    const heading = screen.getByText(/subasta finalizada/i);
    expect(heading).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /pujar ahora/i })).not.toBeInTheDocument();
  });
});
