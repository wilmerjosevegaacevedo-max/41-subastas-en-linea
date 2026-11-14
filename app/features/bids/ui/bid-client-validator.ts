export interface ClientValidationSuccess {
  readonly valid: true;
  readonly minimum_required_cents: number;
}

export interface ClientValidationFailure {
  readonly valid: false;
  readonly code: "VALIDATION_ERROR" | "EXPIRED";
  readonly message: string;
}

export type ClientValidationOutcome = ClientValidationSuccess | ClientValidationFailure;

function formatPesos(cents: number): string {
  const pesos = Math.floor(cents / 100);
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(pesos);
}

export function validateClientBid(
  proposedCents: number,
  currentBidCents: number,
  minIncrementCents: number,
  isClosed: boolean,
): ClientValidationOutcome {
  if (isClosed) {
    return {
      valid: false,
      code: "EXPIRED",
      message: "La subasta ya ha finalizado",
    };
  }

  if (!Number.isInteger(proposedCents) || proposedCents <= 0) {
    return {
      valid: false,
      code: "VALIDATION_ERROR",
      message: "El monto debe ser un número entero positivo",
    };
  }

  const minimumRequired = currentBidCents + minIncrementCents;

  if (proposedCents < minimumRequired) {
    const formattedMin = formatPesos(minimumRequired);
    return {
      valid: false,
      code: "VALIDATION_ERROR",
      message: `Tu puja debe ser de al menos ${formattedMin}`,
    };
  }

  return {
    valid: true,
    minimum_required_cents: minimumRequired,
  };
}
