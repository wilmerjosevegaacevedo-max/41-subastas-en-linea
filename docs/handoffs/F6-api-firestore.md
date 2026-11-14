# Handoff · F6: API REST de subastas y persistencia en Firestore (CRUD por capas)

**Fecha:** 2026-11-14  
**Hito:** Hito 3 (Semana 12 - 15%)  
**Estado:** Terminada y Verificada  
**Commit:** Pendiente de push a `main`

---

## 1. Resumen de la Entrega

Se implementó la persistencia duradera en Google Cloud Firestore mediante Firebase Admin SDK (`app/features/auctions/server/repository.firestore.ts`) y la suite completa de endpoints REST por capas (`ruta -> servicio -> repositorio -> adaptador`) para el recurso de subastas:
- `GET /api/subastas`: Lista subastas con filtros (`estado`, `q`, `limite`).
- `POST /api/subastas`: Creación validada con incremento mínimo del 5%.
- `GET /api/subastas/[id]`: Detalle completo por ID o slug (404 si no existe).
- `PATCH /api/subastas/[id]`: Edición de título/descripción solo si `total_pujas === 0` y el solicitante es el creador (403 si ajeno, 409 si tiene pujas).
- `DELETE /api/subastas/[id]`: Borrado lógico cambiando estado a `cancelada` solo si `total_pujas === 0` (403 si ajeno, 409 si tiene pujas).

---

## 2. Archivos Creados y Modificados

### Creados
- `app/shared/server/firebase-admin.ts`: Singleton seguro para inicialización de Firebase Admin y Firestore con lazy connection y manejo de clave privada.
- `app/features/auctions/server/repository.firestore.ts`: Implementación de `AuctionRepository` basada en Firestore y puerto desacoplado `FirestoreAdapter`.
- `app/api/subastas/[id]/route.ts`: Handlers HTTP para `GET`, `PATCH` y `DELETE` de subastas individuales.
- `app/features/auctions/tests/auction-crud-api.test.ts`: 11 pruebas unitarias y de integración de API REST, autorizaciones y validación de reglas de negocio.
- `app/features/auctions/tests/firestore-repository.test.ts`: 6 pruebas del repositorio Firestore y del adaptador en memoria.
- `docs/specs/F6-api-firestore.md`: Especificación técnica formal aprobada por el estudiante.
- `docs/handoffs/F6-api-firestore.md`: Este documento de entrega.

### Modificados
- `app/features/auctions/schema.ts`: Agregados esquemas Zod con validación snake_case (`AuctionListQuerySchema`, `AuctionListResponseSchema`, `UpdateAuctionInputSchema`, `AuctionDetailResponseSchema`, `DeleteAuctionResponseSchema`).
- `app/features/auctions/server/repository.ts`: Interfaz `AuctionRepository` ampliada con `list`, `update` y `cancel`.
- `app/features/auctions/server/repository.memory.ts`: Implementación en memoria de los nuevos métodos para pruebas rápidas y desarrollo offline.
- `app/features/auctions/server/auction-service.ts`: Lógica de negocio para `listAuctions`, `updateAuction` (validación de propietario y 0 pujas) y `cancelAuction` (borrado lógico).
- `app/features/container.ts`: Fábrica de inyección de dependencias con conmutación dinámica (`USE_FIRESTORE`).
- `app/api/subastas/route.ts`: Handler `GET` integrado para listar subastas con query parameters validados.
- `docs/progreso.md`: Actualizado estado de F6 a `Terminada`.
- `ia/bitacora.md`: Registrada la interacción, validación y decisión del estudiante.

---

## 3. Verificación de Calidad y Reglas

- **Formato:** `biome format` comprobó 70 archivos sin discrepancias.
- **Linting:** `eslint` pasó con **0 errores**.
- **Tipado:** `next typegen && tsc --noEmit` sin errores de compilación.
- **Pruebas:** **88/88 pruebas pasando en verde en Vitest** (0 dependencias de red externas).
- **Build:** `next build` (Turbopack) generó con éxito todas las rutas y endpoints API (`/api/subastas`, `/api/subastas/[id]`, `/api/tiempo`).
- **Reglas del curso cumplidas:**
  - Cero `any` y cero `unknown`.
  - Cero operadores ternarios (`no-ternary`).
  - Funciones <= 100 líneas, clases <= 10 métodos.
  - snake_case en todos los contratos de entrada y salida JSON.
  - Inyección de tiempo en la lógica de negocio.
