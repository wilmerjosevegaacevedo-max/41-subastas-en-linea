# F7 · Transacciones concurrentes en Firestore y regla anti-francotirador (+1 min)

**Estado:** Aprobada  
**Fecha:** 2026-11-14  
**Hito:** Hito 3 (Semana 12 - 15%)  
**Autor:** Antigravity & Estudiante

---

## 1. Propósito y Alcance

Garantizar la integridad, atomicidad y consistencia de las pujas en tiempo real bajo condiciones de alta concurrencia mediante transacciones ACID en Google Cloud Firestore (`db.runTransaction(...)`), e implementar la **regla anti-francotirador (anti-sniping)** que extiende automáticamente el tiempo de cierre de la subasta cuando entra una puja legítima en los últimos instantes.

---

## 2. Reglas de Negocio de la Transacción de Puja

Toda puja enviada a través de `POST /api/subastas/[id]/pujas` se ejecuta dentro de una transacción atómica:

1. **Lectura atómica:** Se lee el documento actual de la subasta (`auctions/{id}`).
2. **Validación de estado:**
   - La subasta debe tener `estado === "activa"`.
   - La fecha actual (`now`) debe ser estrictamente menor que `cierra_en`. Si ya venció, se rechaza con `DomainError("EXPIRED", "La subasta ya ha finalizado")`.
3. **Validación de participantes:**
   - El vendedor no puede pujar en su propia subasta (`vendedor_uid === postor_uid` -> `DomainError("FORBIDDEN", "No puedes pujar en tu propia subasta")`).
   - El postor líder actual sí puede aumentar voluntariamente su propia puja (cumpliendo el incremento mínimo) para consolidar su oferta.
4. **Validación del monto:**
   - El monto ofrecido debe cumplir:
     - Si es la primera puja: `monto >= precio_inicial_centavos`.
     - Si ya hay pujas: `monto >= puja_actual_centavos + incremento_centavos`.
   - Si no cumple, se rechaza con `DomainError("CONFLICT", "El monto debe ser al menos el valor mínimo requerido")`.
5. **Regla Anti-Francotirador (Anti-Sniping):**
   - Si el tiempo restante al recibir la puja es menor a **60 segundos** (`cierra_en - now < 60_000 ms`):
     - El cierre se extiende sumando 60 segundos al tiempo de cierre actual: `nuevo_cierra_en = cierra_en + 60s` (acumulable).
     - Se registra la bandera `extension_aplicada: true` en el resultado de la puja.
   - Si faltan 60 segundos o más, no se extiende (`extension_aplicada: false`).
6. **Escritura atómica dual:**
   - Se crea el registro de la puja en la subcolección `auctions/{id}/bids/{bidId}` con `monto_centavos`, `postor_uid`, `creada_en`.
   - Se actualiza el documento de la subasta:
     - `puja_actual_centavos = nuevo_monto`
     - `ganador_uid = postor_uid`
     - `cierra_en = nuevo_cierra_en`
     - `total_pujas = total_pujas + 1`

---

## 3. Contratos de la API REST (`snake_case`)

### 3.1. Endpoint `POST /api/subastas/[id]/pujas`

**Petición (JSON):**
```json
{
  "monto_centavos": 16000000
}
```

**Respuesta exitosa (HTTP 201 Created):**
```json
{
  "puja": {
    "id": "puja-abc123xyz",
    "subasta_id": "leica-m3-1954",
    "postor_uid": "comprador-01",
    "monto_centavos": 16000000,
    "creada_en": "2026-11-14T14:05:00.000Z"
  },
  "subasta_actualizada": {
    "id": "leica-m3-1954",
    "puja_actual_centavos": 16000000,
    "ganador_uid": "comprador-01",
    "cierra_en": "2026-11-14T14:06:00.000Z",
    "extension_aplicada": true
  }
}
```

**Códigos de Error:**
- `400 VALIDATION_ERROR`: Monto inválido o formato incorrecto.
- `401 UNAUTHENTICATED`: Usuario no autenticado.
- `403 FORBIDDEN`: Intento de autopuja por el vendedor.
- `404 NOT_FOUND`: Subasta no existe.
- `409 CONFLICT`: Monto inferior al incremento mínimo o usuario ya es el líder.
- `410 EXPIRED`: Subasta cerrada o tiempo expirado.

---

## 4. Arquitectura y Puertos

```
[Route Handler: POST /api/subastas/[id]/pujas]
        │
        ▼
[Servicio: BidService.placeBid(...)]
  - Valida reglas de negocio puras
  - Inyecta tiempo (now: Date)
  - Orquesta ejecución atómica en repositorio
        │
        ▼
[Puerto: BidTransactionRepository]
  - executeBidTransaction(params): Promise<BidTransactionResult>
        │
   ┌────┴───────────────────────────┐
   ▼                                ▼
[MemoryBidRepository]         [FirestoreBidRepository]
(Simulación de bloqueo/retry   (db.runTransaction real de
 para pruebas en Vitest)       Google Cloud Firestore)
```

---

## 5. Criterios de Aceptación

1. **Atomicidad:** Dos pujas concurrentes con el mismo monto nunca pueden ser aceptadas simultáneamente; una gana y la otra falla con `409 CONFLICT`.
2. **Regla Anti-Sniper:** Toda puja válida recibida a menos de 60 segundos del final extiende la subasta exactamente en +60 segundos.
3. **Validación de Reglas:** Rechazo con códigos específicos (vendedor no puede autopujar 403, monto bajo 409, tiempo expirado 410).
4. **Calidad:** Cero `any`, cero `unknown`, cero ternarios, inyección de tiempo pura, y 100% de pruebas en verde en Vitest sin servicios de red externos.
