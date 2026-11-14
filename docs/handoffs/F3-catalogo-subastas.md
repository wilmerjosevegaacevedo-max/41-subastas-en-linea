# Handoff · F3 · Catálogo de subastas activas

- **Fecha:** 2026-11-14
- **Estado:** Terminada y verificada
- **Feature:** F3 de `docs/features.md`

## Qué se construyó
1. **Contrato Zod:** `AuctionSortCriteriaSchema` en `app/features/auctions/schema.ts` (`cierre_proximo`, `menor_precio`, `mayor_precio`), auditado por `tests/project/contracts-style.test.ts`.
2. **Fixtures enriquecidos en memoria:** En `app/features/auctions/server/repository.memory.ts`, se incorporaron las 3 subastas de prueba acordadas con inyección temporal (`now: Date`):
   - `leica-m3-1954`: Cámara Vintage Leica M3 1954 ($150.000 COP, cierra en 3 días).
   - `omega-speedmaster-1969`: Reloj Omega Speedmaster Professional 1969 ($280.000 COP, cierra en 36 horas).
   - `macbook-pro-m3-max`: MacBook Pro 16" M3 Max ($125.000 COP, cierra en 4 días y 6 horas).
3. **Lógica pura de filtrado y ordenamiento:** `app/features/auctions/ui/catalog-filters.ts` con funciones puras `filterAuctions` (búsqueda insensible a mayúsculas y acentos diacríticos) y `sortAuctions` (orden por urgencia de cierre, menor y mayor precio).
4. **Pruebas unitarias de catálogo:** 8 pruebas en `app/features/auctions/tests/catalog-filters.test.ts` evaluando todos los criterios de búsqueda, acentos, resultados vacíos y ordenamientos.
5. **Componentes visuales y accesibles (WCAG AA):**
   - `AuctionCard`: Tarjeta responsiva con foto optimizada (`next/image`), temporizador compacto en vivo, detalles y enlace con objetivo táctil $\ge 44 \times 44$ px.
   - `CompactCountdown`: Variante ligera de cuenta regresiva sincronizada con el servidor (`role="timer"`).
   - `AuctionCardSkeleton`: Esqueleto visual animado con `animate-pulse` para estados de carga.
   - `AuctionCatalog`: Componente interactivo con barra de búsqueda por texto, selector de ordenamiento, contador en vivo con `aria-live="polite"` y estado vacío accesible con botón de reinicio.
6. **Página principal (`app/page.tsx`):** Ensambla el catálogo envolviéndolo en `<Suspense>` con `CatalogLoadingFallback` para streaming y renderizado estático/PPR sin fallos de hidratación.

## Verificación
- `npm run check:full`:
  - Biome: 47 archivos formateados con cero errores.
  - ESLint: 0 errores y 0 advertencias (cero `any`, cero `unknown`, cero ternarios, funciones ≤ 100 líneas, importaciones respetadas).
  - TypeScript: 0 errores (`next typegen && tsc --noEmit`).
  - Vitest: 7 suites de pruebas, **50 pruebas unitarias pasando al 100%**.
  - Next.js Build: compilación estática y PPR completada con 5/5 páginas generadas.
