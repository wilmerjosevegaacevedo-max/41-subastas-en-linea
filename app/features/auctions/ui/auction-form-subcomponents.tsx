import Image from "next/image";

export const SAMPLE_PHOTOS = [
  {
    label: "Cámara Vintage",
    url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Reloj Colección",
    url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Computador Portátil",
    url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Obra de Arte",
    url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80",
  },
];

export function SamplePhotosPicker({ onSelect }: { onSelect: (url: string) => void }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-ink-muted">O elige una foto de muestra rápida:</p>
      <div className="flex flex-wrap gap-2">
        {SAMPLE_PHOTOS.map((sample) => {
          return (
            <button
              key={sample.label}
              type="button"
              onClick={() => {
                onSelect(sample.url);
              }}
              className="min-h-[44px] rounded-lg border border-line bg-surface-alt px-3 py-2 text-xs font-semibold text-ink transition hover:bg-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {sample.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PhotoPreview({ url }: { url: string }) {
  if (url.trim().length === 0) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface-alt p-6 text-center">
        <p className="text-sm font-medium text-ink-muted">Sin vista previa de imagen</p>
        <p className="mt-1 text-xs text-ink-muted/80">Ingresa una URL https o elige una muestra</p>
      </div>
    );
  }

  return (
    <figure className="relative aspect-video w-full overflow-hidden rounded-xl border border-line bg-surface-alt">
      <Image
        src={url}
        alt="Vista previa de la subasta a publicar"
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
        unoptimized
      />
    </figure>
  );
}

export function DurationSelector({ value, onChange }: { value: number; onChange: (days: number) => void }) {
  const options = [
    { days: 1, label: "1 día" },
    { days: 3, label: "3 días" },
    { days: 5, label: "5 días" },
    { days: 7, label: "7 días" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {options.map((opt) => {
        let isSelected = false;
        if (value === opt.days) {
          isSelected = true;
        }

        let buttonStyle = "border-line bg-surface text-ink hover:bg-surface-alt";
        if (isSelected) {
          buttonStyle = "border-primary bg-primary/10 text-primary font-bold ring-2 ring-primary";
        }

        return (
          <button
            key={opt.days}
            type="button"
            onClick={() => {
              onChange(opt.days);
            }}
            className={`min-h-[44px] rounded-lg border p-3 text-center text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${buttonStyle}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
