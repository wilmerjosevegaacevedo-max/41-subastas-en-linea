# Handoff F11: Subsanación Integral de Observaciones de la 1ª Revisión

## Estado de la Entrega
- **Feature:** F11 · Subsanación de Observaciones del Profesor (Frentes 1 al 5)
- **Estado:** Terminada
- **Fecha:** 2026-11-16
- **Estudiante:** Wilmer José Vega Acevedo
- **Especificación de Referencia:** `docs/specs/F11-revision-profesor-mejoras.md` (Aprobada)

---

## 1. Resumen de Cambios por Frente

### Frente 1: Funcionalidad Crítica
1. **Endpoint `GET /api/subastas/:id/estado`:**
   - Creado en `app/api/subastas/[id]/estado/route.ts`.
   - Devuelve `{ subasta_id, puja_actual_centavos, incremento_centavos, cierra_en, estado, ganador_uid, tiempo_servidor }`.
   - Incorpora cabecera `Cache-Control: no-store` y `x-request-id`.
2. **Cierre Automático y Tarea de Respaldo (RF-04):**
   - Transición perezosa integrada en `AuctionService.getAuctionById(id, now)` y `closeExpiredAuctions(now)`.
   - Endpoint de cron de respaldo creado en `app/api/cron/cerrar-subastas/route.ts` con protección de token de autorización.
3. **Sondeo con Page Visibility API:**
   - Creado hook `useAuctionPolling` en `app/features/auctions/ui/use-auction-polling.ts`.
   - Pausa sondeo automático cuando la pestaña pasa a segundo plano (`document.hidden === true`) y reactiva de inmediato al volver (`visibilitychange`).
4. **Notificaciones Accesibles (RF-06):**
   - Integrado banner de alerta en `AuctionDetailView` con `role="status"` y `aria-live="polite"`.
   - Notifica superación de puja y cierre de subasta sin recargar la página; botón de respaldo "Actualizar".
5. **Pujas Optimistas con `useOptimistic` (Sección 6):**
   - Implementado en `app/features/bids/ui/bid-form.tsx` con React 19 `useOptimistic` y `useTransition`.
   - Muestra la puja inmediatamente en la interfaz y revierte el estado ante error 409 o 400.

### Frente 2: API, Seguridad y Convenciones
1. **`proxy.ts` (Next.js 16):**
   - Creado en la raíz del proyecto redirigiendo rutas privadas (`/vender`, `/mis-pujas`) a `/login?redirect=...`.
2. **Custom Claims `rol` y `auth_time`:**
   - `AccountService.handleFirebaseIdToken` y `verify` decodifican `rol` y comprueban autenticación reciente (`auth_time`).
3. **Límite de Frecuencia (Rate Limiter HTTP 429):**
   - Creado en `app/shared/server/rate-limiter.ts`.
   - Integrado en `POST /api/subastas/:id/pujas` retornando 429 cuando un cliente excede 30 pujas por minuto.
4. **Paginación por Cursor:**
   - `GET /api/subastas` admite query param `cursor` y devuelve `siguiente_cursor`.
5. **Nomenclatura Firestore (Sección 9.4):**
   - Repositorios `app/features/auctions/server/repository.firestore.ts` y `app/features/bids/server/repository.firestore.ts` refactorizados a colección `subastas`, subcolección `pujas`, `usuarios`, y campos de documento en `camelCase` (`vendedorUid`, `precioInicialCentavos`, `pujaActualCentavos`, `cierraEn`, `ganadorUid`, `creadaEn`), manteniendo `snake_case` exclusivamente en la API HTTP pública.

### Frente 3: Pruebas de Componentes con React Testing Library y JSDOM
- Instalados `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`.
- Suites creadas:
  - `app/features/bids/tests/bid-form.component.test.tsx` (3 tests)
  - `app/features/auctions/tests/auction-card.component.test.tsx` (2 tests)
  - `app/features/auctions/tests/countdown-timer.component.test.tsx` (3 tests)
  - `app/features/auctions/tests/auction-state-api.test.ts` (4 tests)

### Frente 4: Calidad y SEO
- Creados `app/robots.ts` y `app/sitemap.ts`.
- Content-Security-Policy (CSP) estricta configurada en `next.config.ts` y `vercel.json`.
- Integración de `axe-core` en `tests/project/quality-audit.test.ts` garantizando 0 violaciones críticas/serias.
- Generados informes reales en `calidad/`:
  - `calidad/axe-audit.json`
  - `calidad/html-validator.json`
  - `calidad/lighthouse/lighthouse-mobile.json`
  - `calidad/lighthouse/lighthouse-desktop.json`
  - `calidad/screenshots/*.png` (360px, 768px, 1024px, login, vender).

### Frente 5: Gobernanza de IA, Husky y CI
- Creado `ia/PRUEBAS-CONTENCION.md` con las 10 pruebas de contención documentadas con comandos, entradas y resultados.
- Actualizada `ia/bitacora.md` documentando los 3 casos reales donde el estudiante rechazó o corrigió a la IA.
- Creado `.github/workflows/ci.yml` con pipeline automático de GitHub Actions.
- Configurado Husky con pre-commit hook ejecutando `npm run check`.

---

## 2. Verificación Estricta
- **Total de pruebas:** 149 pruebas pasando (22 suites en verde).
- **ESLint & Biome:** 0 errores, 0 advertencias.
- **TypeScript:** 0 errores de tipado.
- **Next.js Build:** Compilación limpia y exitosa de todas las rutas y páginas.
