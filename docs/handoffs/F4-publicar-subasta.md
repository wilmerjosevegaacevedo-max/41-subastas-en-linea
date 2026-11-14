# Handoff · F4 · Publicar una nueva subasta

- **Fecha:** 2026-11-14
- **Estado:** Terminada y verificada
- **Feature:** F4 de `docs/features.md`

## Qué se construyó
1. **Contratos Zod en `app/features/auctions/schema.ts`:**
   - `CreateAuctionInputSchema`: Validación con mensajes amigables para título (5-100 car.), descripción (20-2000 car.), foto URL https, precio mínimo de $10.000 COP y duración (1, 3, 5 o 7 días).
   - `CreateAuctionResponseSchema`: Retorna `{ subasta: AuctionDetail }` en estricto `snake_case`.
2. **Lógica de negocio y cálculo de incremento en `app/features/auctions/server/auction-service.ts`:**
   - Inyección estricta de tiempo (`now: Date`).
   - Cálculo automático del 5% del precio inicial redondeado a múltiplos de $500 COP con piso mínimo de $1.000 COP (100.000 centavos).
   - Generación de slug sanitizado para URL amigable.
   - Guardado en `AuctionRepository` con estado `activa`, `puja_actual_centavos = precio_inicial_centavos` y `ganador_uid = null`.
3. **API Route `POST /api/subastas` en `app/api/subastas/route.ts`:**
   - Valida el payload de entrada con Zod en el punto de entrada sin `any` ni `unknown`.
   - Inyecta la sesión del usuario (`vendedor_uid`) y tiempo actual.
   - Responde 201 Created con el detalle de la subasta.
4. **Componentes visuales y accesibles (WCAG AA):**
   - `PublishAuctionForm` en `app/features/auctions/ui/publish-auction-form.tsx`: Manejo de estados de carga («Publicando subasta...»), feedback de error accesible (`aria-describedby`, `aria-invalid`), y redirección automática tras publicar.
   - `BasicInfoSection`, `PhotoInputSection`, `PricingSection` en `publish-auction-sections.tsx`: Entradas con `<label htmlFor="...">`, vista previa en tiempo real de la imagen con Next.js Image y selector de fotos de muestra.
   - `DurationSelector` en `auction-form-subcomponents.tsx`: Selector táctil de 1, 3, 5 y 7 días ($\ge 44 \times 44$ px).
5. **Página de publicación (`/vender`):**
   - `app/vender/page.tsx`: Vista con metadata SEO y diseño responsive mobile-first.
   - Enlace directo «+ Publicar subasta» en la barra de navegación superior de `app/layout.tsx`.
6. **Pruebas unitarias:**
   - 8 pruebas en `app/features/auctions/tests/create-auction.test.ts` evaluando cálculos de incremento, generación de slug, validación de longitudes y precios mínimos, y persistencia en el repositorio.

## Verificación
- `npm run check:full`:
  - Biome: 54 archivos formateados sin errores.
  - ESLint: 0 errores y 0 advertencias (cero `any`, cero `unknown`, cero ternarios, funciones $\le 100$ líneas, fronteras arquitectónicas intactas).
  - TypeScript: 0 errores (`tsc --noEmit`).
  - Vitest: 8 suites de pruebas, **60 pruebas unitarias pasando al 100%**.
  - Next.js Build: compilación exitosa con 7/7 rutas generadas.
