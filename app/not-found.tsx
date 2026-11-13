import Link from "next/link";

export default function NotFoundPage() {
  return (
    <article className="space-y-4 py-16 text-center">
      <h1 className="text-4xl font-extrabold text-ink">404 · No encontrado</h1>
      <p className="text-lg text-ink-muted">La subasta que buscas no existe o ha sido dada de baja.</p>
      <div>
        <Link
          href="/"
          className="inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          Volver al inicio
        </Link>
      </div>
    </article>
  );
}
