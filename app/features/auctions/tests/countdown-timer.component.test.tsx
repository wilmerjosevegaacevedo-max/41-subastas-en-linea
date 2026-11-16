// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CountdownTimer } from "../ui/countdown-timer";

afterEach(() => {
  cleanup();
});

describe("CountdownTimer Component (React Testing Library)", () => {
  it("renderiza con role='timer' y región accesible aria-live='polite'", () => {
    const futureClosesAt = new Date(Date.now() + 3600000).toISOString(); // 1 hora
    render(<CountdownTimer closesAtIso={futureClosesAt} />);

    const timerRegion = screen.getByRole("timer", { name: /tiempo restante de la subasta/i });
    expect(timerRegion).toBeInTheDocument();
    expect(timerRegion).toHaveAttribute("aria-live", "polite");
  });

  it("muestra estado de 'Subasta finalizada' cuando la fecha de cierre ya ha pasado", async () => {
    const pastClosesAt = new Date(Date.now() - 60000).toISOString(); // 1 min atrás
    render(<CountdownTimer closesAtIso={pastClosesAt} />);

    await waitFor(() => {
      expect(screen.getByText(/subasta finalizada/i)).toBeInTheDocument();
    });
    expect(screen.getByText("00:00:00")).toBeInTheDocument();
  });

  it("muestra alerta de últimos segundos cuando queda menos de un minuto", async () => {
    const twentySecAhead = new Date(Date.now() + 20000).toISOString(); // 20s
    render(<CountdownTimer closesAtIso={twentySecAhead} />);

    await waitFor(() => {
      expect(screen.getByText(/¡últimos segundos!/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/pujas en el último minuto extenderán el tiempo/i)).toBeInTheDocument();
  });
});
