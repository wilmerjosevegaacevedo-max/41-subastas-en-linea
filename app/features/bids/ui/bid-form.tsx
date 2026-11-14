"use client";

import { type FormEvent, useState } from "react";
import { validateClientBid } from "./bid-client-validator";

export interface BidFormProps {
  subastaId: string;
  pujaActualCentavos: number;
  incrementoCentavos: number;
  isClosed: boolean;
  onBidAccepted: (newAmountCentavos: number) => void;
}

function formatPesos(cents: number): string {
  const pesos = Math.floor(cents / 100);
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(pesos);
}

function ClosedNotice() {
  return (
    <section aria-label="Formulario de puja" className="rounded-xl border border-line bg-surface-alt p-6 text-center">
      <p className="text-base font-bold text-ink-muted">Subasta finalizada</p>
      <p className="mt-1 text-sm text-ink-muted">Esta subasta ha concluido y no se reciben más ofertas.</p>
    </section>
  );
}

function BidFeedback({ errorMessage, successMessage }: { errorMessage: string | null; successMessage: string | null }) {
  if (errorMessage !== null) {
    return (
      <p id="error-puja" role="alert" className="text-sm font-semibold text-danger">
        {errorMessage}
      </p>
    );
  }

  if (successMessage !== null) {
    return (
      <p role="status" aria-live="polite" className="rounded-lg bg-green-50 p-3 text-sm font-bold text-success">
        {successMessage}
      </p>
    );
  }

  return null;
}

export function BidForm(props: BidFormProps) {
  const minimumRequiredCentavos = props.pujaActualCentavos + props.incrementoCentavos;
  const suggestedPesos = Math.floor(minimumRequiredCentavos / 100);

  const [inputPesos, setInputPesos] = useState<string>(String(suggestedPesos));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (props.isClosed) {
    return <ClosedNotice />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const proposedCents = Math.round(Number(inputPesos) * 100);
    const validation = validateClientBid(
      proposedCents,
      props.pujaActualCentavos,
      props.incrementoCentavos,
      props.isClosed,
    );

    if (!validation.valid) {
      setErrorMessage(validation.message);
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setIsSubmitting(false);

    const formattedSuccess = formatPesos(proposedCents);
    setSuccessMessage(`¡Tu puja de ${formattedSuccess} ha sido registrada con éxito!`);
    props.onBidAccepted(proposedCents);

    const nextMinimum = proposedCents + props.incrementoCentavos;
    setInputPesos(String(Math.floor(nextMinimum / 100)));
  }

  let buttonText = "Pujar ahora";
  if (isSubmitting) {
    buttonText = "Enviando puja...";
  }

  const minFormatted = formatPesos(minimumRequiredCentavos);

  return (
    <section aria-labelledby="titulo-puja" className="rounded-xl border border-line bg-surface p-6 shadow-sm">
      <header className="space-y-1">
        <h2 id="titulo-puja" className="text-xl font-bold text-ink">
          Realizar una puja
        </h2>
        <p className="text-sm text-ink-muted">
          La siguiente puja mínima aceptada es de: <strong className="text-primary-strong">{minFormatted}</strong>
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input type="hidden" name="subasta_id" value={props.subastaId} />
        <div>
          <label htmlFor="monto_puja" className="block text-sm font-medium text-ink">
            Tu oferta en pesos colombianos (COP)
          </label>
          <div className="mt-1 flex rounded-lg shadow-sm">
            <span
              aria-hidden="true"
              className="inline-flex items-center rounded-l-lg border border-r-0 border-control-border bg-surface-alt px-3"
            >
              <strong className="text-sm font-bold text-ink-muted">$</strong>
            </span>
            <input
              type="number"
              id="monto_puja"
              name="monto_puja"
              min={suggestedPesos}
              step="1000"
              required
              disabled={isSubmitting}
              value={inputPesos}
              onChange={(e) => setInputPesos(e.target.value)}
              className="block w-full min-w-0 flex-1 rounded-r-lg border border-control-border px-3 py-2.5 text-base text-ink focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <BidFeedback errorMessage={errorMessage} successMessage={successMessage} />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-primary py-3 px-4 text-base font-bold text-white transition hover:bg-primary-hover focus:outline-none disabled:opacity-50"
        >
          <strong className="font-bold">{buttonText}</strong>
        </button>
      </form>
    </section>
  );
}
