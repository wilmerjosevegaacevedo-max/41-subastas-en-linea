# Handoff · F1 · Detalle de subasta y cuenta regresiva

- **Fecha:** 2026-11-13
- **Estado:** Terminada y verificada
- **Feature:** F1 de `docs/features.md`

## Qué se construyó
1. Contrato Zod de subastas en `app/features/auctions/schema.ts` (`AuctionDetailSchema`, `ServerTimeResponseSchema`).
2. Repositorio en memoria y servicio en `app/features/auctions/server/` con la subasta de colección fixture (`leica-m3-1954`).
3. Endpoint de sincronización de hora del servidor en `app/api/tiempo/route.ts`.
4. Lógica pura de cuenta regresiva en `app/features/auctions/ui/time-calculation.ts` con tolerancia a reloj de cliente desfasado y reglas de negocio acordadas con el usuario (menos de 60s en segundos grandes, 00:00:00 con insignia «Subasta finalizada»).
5. Hook cliente sincronizado en `app/features/auctions/ui/use-countdown.ts` con Page Visibility API (`document.visibilitychange`).
6. Componentes visuales accesibles: `CountdownTimer`, `AuctionDetailView`, esqueleto de carga `loading.tsx` y página `/subastas/[id]`.
7. Catálogo en página de inicio `/` con enlace directo a la subasta activa.

## Verificación
- `npm run check:full`:
  - Biome: formato verificado en 35 archivos.
  - ESLint: 0 errores y 0 advertencias.
  - TypeScript: 0 errores.
  - Vitest: 4 suites de pruebas, 22 pruebas unitarias pasando al 100%.
  - Next.js Build: compilación estática y PPR completada con éxito.
