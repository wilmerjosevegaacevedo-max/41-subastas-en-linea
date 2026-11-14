"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { type CreateAuctionInput, CreateAuctionInputSchema, CreateAuctionResponseSchema } from "../schema";
import { ErrorResponseSchema } from "@/shared/schema";
import { calculateMinimumIncrementCentavos, formatPesos } from "./auction-pricing";
import { DurationSelector } from "./auction-form-subcomponents";
import { BasicInfoSection, PhotoInputSection, PricingSection } from "./publish-auction-sections";

interface PostAuctionSuccess {
  kind: "success";
  id: string;
}

interface PostAuctionError {
  kind: "error";
  message: string;
}

type PostAuctionResult = PostAuctionSuccess | PostAuctionError;

async function postAuction(data: CreateAuctionInput): Promise<PostAuctionResult> {
  try {
    const response = await fetch("/api/subastas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const parsed = ErrorResponseSchema.safeParse(await response.json());
      let msg = "No se pudo crear la subasta";
      if (parsed.success) {
        msg = parsed.data.error.message;
      }
      return { kind: "error", message: msg };
    }

    const result = CreateAuctionResponseSchema.parse(await response.json());
    return { kind: "success", id: result.subasta.id };
  } catch {
    return { kind: "error", message: "Error al contactar al servidor. Inténtalo de nuevo." };
  }
}

export function PublishAuctionForm() {
  const router = useRouter();
  const tituloId = useId();
  const descripcionId = useId();
  const fotoId = useId();
  const precioId = useId();

  const [titulo, setTitulo] = useState<string>("");
  const [descripcion, setDescripcion] = useState<string>("");
  const [fotoUrl, setFotoUrl] = useState<string>("");
  const [precioPesos, setPrecioPesos] = useState<number | "">(50000);
  const [duracionDias, setDuracionDias] = useState<number>(3);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  let numericPrice = 0;
  if (typeof precioPesos === "number") {
    numericPrice = precioPesos;
  }
  const incrementCentavos = calculateMinimumIncrementCentavos(numericPrice);
  const formattedIncrement = formatPesos(incrementCentavos);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    const rawPayload = {
      titulo,
      descripcion,
      foto_url: fotoUrl,
      precio_inicial_pesos: Number(precioPesos),
      duracion_dias: duracionDias,
    };

    const validation = CreateAuctionInputSchema.safeParse(rawPayload);
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        const fieldName = issue.path[0];
        if (typeof fieldName === "string" && newErrors[fieldName] === undefined) {
          newErrors[fieldName] = issue.message;
        }
      }
      setFieldErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    const result = await postAuction(validation.data);
    if (result.kind === "error") {
      setGeneralError(result.message);
      setIsSubmitting(false);
      return;
    }

    router.push(`/subastas/${result.id}`);
  }

  let errorAlert = null;
  if (generalError !== null) {
    errorAlert = (
      <div role="alert" className="rounded-xl border border-danger/40 bg-red-50 p-4 text-danger">
        <p className="text-sm font-semibold">{generalError}</p>
      </div>
    );
  }

  let submitButtonText = "Publicar subasta ahora";
  if (isSubmitting) {
    submitButtonText = "Publicando subasta...";
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {errorAlert}

      <BasicInfoSection
        tituloId={tituloId}
        descripcionId={descripcionId}
        titulo={titulo}
        descripcion={descripcion}
        tituloError={fieldErrors.titulo}
        descError={fieldErrors.descripcion}
        onTituloChange={setTitulo}
        onDescChange={setDescripcion}
      />

      <PhotoInputSection fotoId={fotoId} fotoUrl={fotoUrl} fotoError={fieldErrors.foto_url} onFotoChange={setFotoUrl} />

      <PricingSection
        precioId={precioId}
        precioPesos={precioPesos}
        precioError={fieldErrors.precio_inicial_pesos}
        formattedIncrement={formattedIncrement}
        onPrecioChange={setPrecioPesos}
      />

      <div className="space-y-2">
        <p className="text-sm font-bold text-ink">Duración de la subasta</p>
        <DurationSelector value={duracionDias} onChange={setDuracionDias} />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex min-h-[44px] w-full items-center justify-center rounded-xl bg-primary px-6 py-3 text-base font-bold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {submitButtonText}
      </button>
    </form>
  );
}
