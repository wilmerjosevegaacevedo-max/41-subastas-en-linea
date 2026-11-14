# Handoff · F7: Transacciones concurrentes en Firestore y regla anti-francotirador (+1 min)

**Fecha:** 2026-11-14  
**Hito:** Hito 3 (Semana 12 - 15%)  
**Estado:** Terminada y Verificada  
**Commit:** Pendiente de push a `main`

---

## 1. Resumen de la Entrega

Se implementó el sistema de procesamiento transaccional atómico de pujas y la regla anti-francotirador (anti-sniping) tanto en memoria para pruebas concurrentes en Vitest como en Firestore mediante `db.runTransaction(...)`:
- **Regla Anti-Francotirador (+1 min):** Si entra una puja válida a menos de 60 segundos del cierre (`cierra_en - now < 60_000 ms`), el reloj de la subasta se extiende automáticamente en +60 segundos de forma acumulable (`nuevo_cierra_en = cierra_en + 60s`).
- **Aislamiento y Concurrencia ACID:** Dos pujas concurrentes que compiten por el mismo valor o entran en paralelo son serializadas; una triunfa actualizando el precio y la segunda se rechaza con `409 CONFLICT` al no cumplir con el nuevo incremento requerido.
- **Validaciones de Seguridad:**
  - El vendedor no puede autopujar en sus subastas (`403 FORBIDDEN`).
  - No se aceptan pujas en subastas finalizadas (`410 EXPIRED`) o no activas (`409 CONFLICT`).
  - El postor líder puede aumentar voluntariamente su propia oferta para consolidar ventaja.
- **Endpoint REST:**
  - `POST /api/subastas/[id]/pujas`: Valida la entrada con Zod, ejecuta la transacción atómica y retorna `201 Created` con el detalle de la puja y la subasta actualizada.

---

## 2. Archivos Creados y Modificados

### Creados
- `app/api/subastas/[id]/pujas/route.ts`: Handler HTTP `POST` para registrar pujas de forma atómica.
- `app/features/bids/server/repository.firestore.ts`: Repositorio `FirestoreBidRepository` con soporte para `db.runTransaction` y adaptador desacoplado.
- `app/features/bids/tests/anti-sniper.test.ts`: 5 pruebas unitarias verificando la extensión del reloj anti-sniper y reglas de participantes.
- `app/features/bids/tests/concurrent-bids.test.ts`: 4 pruebas de concurrencia simulada y endpoint HTTP `POST /api/subastas/[id]/pujas`.
- `app/features/bids/tests/firestore-bid-repository.test.ts`: 2 pruebas de repositorio Firestore y adaptador transaccional.
- `docs/specs/F7-transacciones-anti-sniper.md`: Especificación formal aprobada por el estudiante.
- `docs/handoffs/F7-transacciones-anti-sniper.md`: Este documento de entrega.

### Modificados
- `app/features/bids/schema.ts`: Agregados esquemas Zod (`PlaceBidInputSchema`, `BidItemSchema`, `AuctionUpdatedSnapshotSchema`, `PlaceBidResponseSchema`).
- `app/features/bids/server/repository.ts`: Declarado el puerto `AuctionBiddingPort`, `PlaceBidTransactionParams`, `PlaceBidTransactionResult` y `BidRepository.placeBid`.
- `app/features/bids/server/repository.memory.ts`: Implementación de cola atómica (mutex) y validación transaccional completa con regla anti-sniper.
- `app/features/bids/server/bid-service.ts`: Método `placeBid` inyectando `now: Date` y validando inputs con Zod.
- `app/features/container.ts`: Conexión de puertos entre `auctionRepository` y `bidRepository` mediante `auctionBiddingPort`.
- `docs/progreso.md`: Actualizado estado de F7 a `Terminada`.
- `ia/bitacora.md`: Registrada la aprobación e implementación de F7.

---

## 3. Verificación de Calidad

- **Formateo:** `biome format` comprobó 75 archivos sin fallas.
- **Linting:** `eslint` pasó con **0 errores y 0 warnings**.
- **Tipado:** `next typegen && tsc --noEmit` completado al 100%.
- **Pruebas:** **99/99 pruebas pasando en verde en Vitest** (0 dependencias de red externas).
- **Build de producción:** `next build` (Turbopack) generó con éxito todas las 8 rutas y 4 endpoints REST:
  - `/api/subastas`
  - `/api/subastas/[id]`
  - `/api/subastas/[id]/pujas`
  - `/api/tiempo`
- **Reglas del curso:**
  - Cero `any` y cero `unknown`.
  - Cero operadores ternarios (`no-ternary`).
  - Nombres snake_case en todos los contratos JSON.
  - Inyección de tiempo en la lógica de negocio.
