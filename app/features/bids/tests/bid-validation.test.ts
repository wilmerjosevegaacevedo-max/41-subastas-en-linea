import { describe, expect, it } from "vitest";
import { validateProposedBid } from "../server/bid-validator";

describe("F2 · validación pura de puja e incremento (6 casos obligatorios)", () => {
  const currentBid = 15000000; // $150.000 en centavos
  const minIncrement = 1000000; // $10.000 en centavos
  const minExpected = currentBid + minIncrement; // $160.000 (16000000 centavos)

  it("caso 1: acepta una puja exactamente igual a la puja actual más el incremento mínimo", () => {
    const outcome = validateProposedBid(minExpected, currentBid, minIncrement, false);
    expect(outcome.valid).toBe(true);
    if (outcome.valid) {
      expect(outcome.minimum_required_cents).toBe(minExpected);
    }
  });

  it("caso 2: acepta una puja ampliamente superior al incremento mínimo", () => {
    const proposed = currentBid + minIncrement * 3; // $180.000
    const outcome = validateProposedBid(proposed, currentBid, minIncrement, false);
    expect(outcome.valid).toBe(true);
  });

  it("caso 3: rechaza una puja un solo centavo por debajo del mínimo requerido con el mensaje exacto", () => {
    const proposed = minExpected - 1; // 15999999 centavos ($159.999,99)
    const outcome = validateProposedBid(proposed, currentBid, minIncrement, false);
    expect(outcome.valid).toBe(false);
    if (!outcome.valid) {
      expect(outcome.code).toBe("VALIDATION_ERROR");
      expect(outcome.message).toContain("Tu puja debe ser de al menos");
    }
  });

  it("caso 4: rechaza una puja igual a la puja actual sin incremento", () => {
    const outcome = validateProposedBid(currentBid, currentBid, minIncrement, false);
    expect(outcome.valid).toBe(false);
    if (!outcome.valid) {
      expect(outcome.code).toBe("VALIDATION_ERROR");
    }
  });

  it("caso 5: rechaza montos cero o negativos", () => {
    const zeroOutcome = validateProposedBid(0, currentBid, minIncrement, false);
    expect(zeroOutcome.valid).toBe(false);

    const negativeOutcome = validateProposedBid(-5000, currentBid, minIncrement, false);
    expect(negativeOutcome.valid).toBe(false);
  });

  it("caso 6: rechaza cualquier puja si la subasta ya está cerrada o finalizada", () => {
    const outcome = validateProposedBid(minExpected + 5000000, currentBid, minIncrement, true);
    expect(outcome.valid).toBe(false);
    if (!outcome.valid) {
      expect(outcome.code).toBe("EXPIRED");
      expect(outcome.message).toBe("La subasta ya ha finalizado");
    }
  });
});
