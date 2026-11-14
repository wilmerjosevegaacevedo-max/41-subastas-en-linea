# Handoff · F2 · Formulario de puja y validación

- **Fecha:** 2026-11-13
- **Estado:** Terminada y verificada
- **Feature:** F2 de `docs/features.md`

## Qué se construyó
1. Contrato Zod de pujas en `app/features/bids/schema.ts` (`CreateBidInputSchema`, `BidValidationContextSchema`, `BidResultSchema`) con claves 100% en `snake_case`.
2. Lógica pura de validación de puja e incremento en `app/features/bids/server/bid-validator.ts` y validador de cliente en `app/features/bids/ui/bid-client-validator.ts` (sin violar fronteras de importación).
3. 6 casos de prueba unitaria de la lógica de incremento en `app/features/bids/tests/bid-validation.test.ts` (igual al incremento, mayor, un centavo por debajo, puja igual a la actual, ceros o negativos, y subasta cerrada).
4. Prueba de gobernanza de contratos en `tests/project/contracts-style.test.ts` que audita automáticamente que todos los esquemas usen `snake_case`.
5. Componente accesible de formulario `BidForm` en `app/features/bids/ui/bid-form.tsx` con estados de reposo, carga («Enviando puja...»), éxito reactivo («¡Tu puja ha sido registrada con éxito!»), error accesible (`aria-describedby`, `role="alert"`) y bloqueo automático si la subasta cierra.
6. Integración reactiva en `AuctionDetailView`: al enviar una puja válida, la puja actual se actualiza de inmediato en pantalla y recalcula la siguiente puja mínima.

## Verificación
- `npm run check:full`:
  - Biome: 41 archivos formateados sin errores.
  - ESLint: 0 errores y 0 advertencias (cero `any`, cero `unknown`, cero ternarios, funciones ≤ 100 líneas).
  - TypeScript: 0 errores.
  - Vitest: 6 suites de pruebas, **41 pruebas unitarias pasando al 100%**.
  - Next.js Build: compilación estática y PPR completada con éxito.
