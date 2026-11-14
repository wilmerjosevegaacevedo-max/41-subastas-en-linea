import { useState } from "react";
import { UploadPhotoResponseSchema } from "../schema";
import { PhotoPreview, SamplePhotosPicker } from "./auction-form-subcomponents";

export interface BasicInfoSectionProps {
  tituloId: string;
  descripcionId: string;
  titulo: string;
  descripcion: string;
  tituloError?: string;
  descError?: string;
  onTituloChange: (value: string) => void;
  onDescChange: (value: string) => void;
}

export function BasicInfoSection(props: BasicInfoSectionProps) {
  let tituloDescribedBy = undefined;
  let tituloInvalid = false;
  let tituloNotice = null;
  if (props.tituloError !== undefined) {
    tituloDescribedBy = `${props.tituloId}-error`;
    tituloInvalid = true;
    tituloNotice = (
      <p id={`${props.tituloId}-error`} className="text-xs font-semibold text-danger">
        {props.tituloError}
      </p>
    );
  }

  let descDescribedBy = undefined;
  let descInvalid = false;
  let descNotice = null;
  if (props.descError !== undefined) {
    descDescribedBy = `${props.descripcionId}-error`;
    descInvalid = true;
    descNotice = (
      <p id={`${props.descripcionId}-error`} className="text-xs font-semibold text-danger">
        {props.descError}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor={props.tituloId} className="text-sm font-bold text-ink">
          Título del artículo
        </label>
        <input
          id={props.tituloId}
          type="text"
          value={props.titulo}
          onChange={(e) => props.onTituloChange(e.target.value)}
          placeholder="Ej: Cámara Clásica Vintage 1954..."
          aria-invalid={tituloInvalid}
          aria-describedby={tituloDescribedBy}
          className="min-h-[44px] w-full rounded-lg border border-line bg-surface px-4 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
        {tituloNotice}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={props.descripcionId} className="text-sm font-bold text-ink">
          Descripción detallada
        </label>
        <textarea
          id={props.descripcionId}
          rows={4}
          value={props.descripcion}
          onChange={(e) => props.onDescChange(e.target.value)}
          placeholder="Describe el estado estético, accesorios incluidos y detalles relevantes..."
          aria-invalid={descInvalid}
          aria-describedby={descDescribedBy}
          className="w-full rounded-lg border border-line bg-surface p-4 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
        {descNotice}
      </div>
    </div>
  );
}

export interface PhotoInputSectionProps {
  fotoId: string;
  fotoUrl: string;
  fotoError?: string;
  onFotoChange: (url: string) => void;
}

export function PhotoInputSection(props: PhotoInputSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("foto", file);
      const res = await fetch("/api/fotos/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        setUploadError("Error al subir la imagen. Revisa el formato y tamaño.");
        setIsUploading(false);
        return;
      }

      const json = UploadPhotoResponseSchema.parse(await res.json());
      props.onFotoChange(json.foto_url);
    } catch {
      setUploadError("Error de conexión durante la subida");
    } finally {
      setIsUploading(false);
    }
  };

  let fotoDescribedBy = undefined;
  let fotoInvalid = false;
  let fotoNotice = null;
  if (props.fotoError !== undefined) {
    fotoDescribedBy = `${props.fotoId}-error`;
    fotoInvalid = true;
    fotoNotice = (
      <p id={`${props.fotoId}-error`} className="text-xs font-semibold text-danger">
        {props.fotoError}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl border border-line bg-surface-alt space-y-2">
        <label htmlFor={`${props.fotoId}-file`} className="block text-sm font-bold text-ink">
          Subir archivo directo a Vercel Blob
        </label>
        <p className="text-xs text-ink-muted">Formatos aceptados: JPEG, PNG o WebP (máx. 4.5 MB)</p>
        <input
          id={`${props.fotoId}-file`}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={isUploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file !== undefined) {
              void handleFileUpload(file);
            }
          }}
          className="text-xs text-ink file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover file:cursor-pointer cursor-pointer"
        />
        {isUploading && (
          <p className="text-xs font-medium text-amber-500 animate-pulse">Subiendo foto a Vercel Blob...</p>
        )}
        {uploadError !== null && <p className="text-xs font-semibold text-danger">{uploadError}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor={props.fotoId} className="text-sm font-bold text-ink">
          O ingresa una URL de fotografía directa (https)
        </label>
        <input
          id={props.fotoId}
          type="url"
          value={props.fotoUrl}
          onChange={(e) => props.onFotoChange(e.target.value)}
          placeholder="https://images.unsplash.com/..."
          aria-invalid={fotoInvalid}
          aria-describedby={fotoDescribedBy}
          className="min-h-[44px] w-full rounded-lg border border-line bg-surface px-4 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
        {fotoNotice}
      </div>

      <SamplePhotosPicker onSelect={props.onFotoChange} />
      <PhotoPreview url={props.fotoUrl} />
    </div>
  );
}

export interface PricingSectionProps {
  precioId: string;
  precioPesos: number | "";
  precioError?: string;
  formattedIncrement: string;
  onPrecioChange: (value: number | "") => void;
}

export function PricingSection(props: PricingSectionProps) {
  let precioDescribedBy = undefined;
  let precioInvalid = false;
  let precioNotice = null;
  if (props.precioError !== undefined) {
    precioDescribedBy = `${props.precioId}-error`;
    precioInvalid = true;
    precioNotice = (
      <p id={`${props.precioId}-error`} className="text-xs font-semibold text-danger">
        {props.precioError}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div className="space-y-1.5">
        <label htmlFor={props.precioId} className="text-sm font-bold text-ink">
          Precio inicial (COP)
        </label>
        <input
          id={props.precioId}
          type="number"
          min={10000}
          step={1000}
          value={props.precioPesos}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "") {
              props.onPrecioChange("");
            } else {
              props.onPrecioChange(Number(val));
            }
          }}
          aria-invalid={precioInvalid}
          aria-describedby={precioDescribedBy}
          className="min-h-[44px] w-full rounded-lg border border-line bg-surface px-4 py-2 text-sm font-bold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
        {precioNotice}
      </div>

      <div className="flex flex-col justify-end rounded-lg border border-line bg-surface-alt p-3.5">
        <p className="text-xs font-semibold text-ink-muted">Incremento mínimo automático (5%):</p>
        <p className="mt-1 text-lg font-black text-primary">+{props.formattedIncrement}</p>
      </div>
    </div>
  );
}
