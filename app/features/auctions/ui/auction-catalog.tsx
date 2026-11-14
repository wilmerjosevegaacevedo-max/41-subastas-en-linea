"use client";

import { useId, useState } from "react";
import type { AuctionDetail, AuctionSortCriteria } from "../schema";
import { AuctionCard } from "./auction-card";
import { filterAuctions, sortAuctions } from "./catalog-filters";

export interface AuctionCatalogProps {
  initialAuctions: AuctionDetail[];
}

interface CatalogToolbarProps {
  searchId: string;
  sortId: string;
  searchQuery: string;
  sortCriteria: AuctionSortCriteria;
  onSearchChange: (value: string) => void;
  onSortChange: (value: AuctionSortCriteria) => void;
  onClearSearch: () => void;
}

function CatalogToolbar(props: CatalogToolbarProps) {
  let clearButton = null;
  if (props.searchQuery.length > 0) {
    clearButton = (
      <button
        type="button"
        onClick={props.onClearSearch}
        className="flex min-h-[44px] items-center rounded-lg border border-line bg-surface-alt px-3 py-2 text-xs font-semibold text-ink transition hover:bg-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        Limpiar
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-1 flex-col gap-1.5 sm:max-w-md">
        <label htmlFor={props.searchId} className="text-xs font-bold uppercase tracking-wider text-ink-muted">
          Buscar en el catálogo
        </label>
        <div className="flex items-center gap-2">
          <input
            id={props.searchId}
            type="search"
            value={props.searchQuery}
            onChange={(event) => {
              props.onSearchChange(event.target.value);
            }}
            placeholder="Buscar por artículo, modelo o detalle..."
            className="min-h-[44px] w-full rounded-lg border border-line bg-surface-alt px-3.5 py-2 text-sm text-ink placeholder:text-ink-muted/70 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          />
          {clearButton}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 sm:w-56">
        <label htmlFor={props.sortId} className="text-xs font-bold uppercase tracking-wider text-ink-muted">
          Ordenar por
        </label>
        <select
          id={props.sortId}
          value={props.sortCriteria}
          onChange={(event) => {
            const val = event.target.value as AuctionSortCriteria;
            props.onSortChange(val);
          }}
          className="min-h-[44px] rounded-lg border border-line bg-surface-alt px-3.5 py-2 text-sm font-medium text-ink focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
        >
          <option value="cierre_proximo">Cierre más próximo</option>
          <option value="menor_precio">Menor precio</option>
          <option value="mayor_precio">Mayor precio</option>
        </select>
      </div>
    </div>
  );
}

function CatalogEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <section
      aria-label="Sin resultados de búsqueda"
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface p-12 text-center"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-alt text-2xl text-ink-muted">
        <p aria-hidden="true">🔍</p>
      </div>
      <h3 className="text-lg font-bold text-ink">No se encontraron subastas</h3>
      <p className="mt-1.5 max-w-sm text-sm text-ink-muted">
        No hay subastas activas que coincidan con los criterios de búsqueda. Intenta con otro término.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 flex min-h-[44px] items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        Limpiar búsqueda
      </button>
    </section>
  );
}

export function AuctionCatalog({ initialAuctions }: AuctionCatalogProps) {
  const searchId = useId();
  const sortId = useId();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortCriteria, setSortCriteria] = useState<AuctionSortCriteria>("cierre_proximo");

  const filtered = filterAuctions(initialAuctions, searchQuery);
  const sorted = sortAuctions(filtered, sortCriteria);

  let content = null;
  if (sorted.length === 0) {
    content = (
      <CatalogEmptyState
        onReset={() => {
          setSearchQuery("");
        }}
      />
    );
  } else {
    content = (
      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sorted.map((auction) => {
          return (
            <li key={auction.id}>
              <AuctionCard auction={auction} />
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="space-y-6">
      <CatalogToolbar
        searchId={searchId}
        sortId={sortId}
        searchQuery={searchQuery}
        sortCriteria={sortCriteria}
        onSearchChange={setSearchQuery}
        onSortChange={setSortCriteria}
        onClearSearch={() => {
          setSearchQuery("");
        }}
      />

      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted" aria-live="polite">
          Subastas disponibles: <strong className="text-ink">{sorted.length}</strong>
        </p>
      </div>

      {content}
    </div>
  );
}
