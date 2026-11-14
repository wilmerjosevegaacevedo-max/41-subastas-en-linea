# F6 · API REST de subastas y persistencia en Firestore (CRUD por capas)

**Estado:** Aprobada  
**Fecha:** 2026-11-14  
**Hito:** Hito 3 (Semana 12 - 15%)  
**Autor:** Antigravity & Estudiante

---

## 1. Propósito y Alcance

Proveer una API REST estructurada por capas (`ruta -> servicio -> repositorio`) para el recurso de subastas, junto con la implementación de persistencia real en Google Cloud Firestore mediante Firebase Admin SDK (`app/features/auctions/server/repository.firestore.ts`).

Esta feature permite que las subastas creadas desde `/vender` o consultadas en el catálogo y detalle persistan de forma duradera en la colección `auctions` de Firestore, asegurando un desacoplamiento limpio que permite alternar entre `AuctionMemoryRepository` (para pruebas sin red) y `AuctionFirestoreRepository` (para producción y emulador).

---

## 2. Contratos y Endpoints REST (`snake_case`)

Todos los endpoints validan entradas y salidas con esquemas Zod en `app/features/auctions/schema.ts`.

### 2.1. Endpoints

| Método | Ruta | Descripción | Autenticación |
|---|---|---|---|
| `GET` | `/api/subastas` | Lista subastas activas/cerradas con filtros (`estado`, `q`, `limite`) | Pública |
| `POST` | `/api/subastas` | Crea una nueva subasta (validada con 5% de incremento mínimo) | Requerida (Vendedor) |
| `GET` | `/api/subastas/[id]` | Retorna el detalle completo de una subasta por ID o slug | Pública |
| `PATCH` | `/api/subastas/[id]` | Actualiza campos permitidos (título, descripción) solo si no tiene pujas | Requerida (Creador) |
| `DELETE` | `/api/subastas/[id]` | Cancela lógicamente la subasta (estado `CANCELADA`) si no ha recibido ninguna puja | Requerida (Creador/Admin) |

### 2.2. Modelo de Documento en Firestore (`auctions/{id}`)

Campos almacenados en Firestore:
```typescript
interface AuctionDocument {
  id: string;
  slug: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  fotos: string[];
  precio_base_centavos: number;
  precio_actual_centavos: number;
  incremento_minimo_centavos: number;
  estado: "ACTIVA" | "CERRADA" | "CANCELADA";
  vendedor_id: string;
  vendedor_nombre: string;
  total_pujas: number;
  ganador_id?: string;
  ganador_nombre?: string;
  cierra_en: FirebaseFirestore.Timestamp;
  creada_en: FirebaseFirestore.Timestamp;
  actualizada_en: FirebaseFirestore.Timestamp;
}
```

---

## 3. Arquitectura y Separación de Capas

```
[Cliente HTTP / Fetch]
        │
        ▼
[Route Handler: app/api/subastas/...]
  - Valida Zod request / query params
  - Extrae identidad de sesión inyectada
  - Traduce DomainErrors a HTTP (400, 401, 403, 404, 409, 500)
        │
        ▼
[Servicio: AuctionService]
  - Reglas de negocio puras
  - Cálculo de incremento mínimo (5% redondeado a $500 COP)
  - Validación de estado para modificación/cancelación
  - Inyección de tiempo (now: Date)
        │
        ▼
[Puerto: AuctionRepository]
  - findById(id: string): Promise<Auction | null>
  - findBySlug(slug: string): Promise<Auction | null>
  - findActive(options: CatalogFilterOptions): Promise<Auction[]>
  - save(auction: Auction): Promise<void>
  - update(id: string, partial: Partial<Auction>): Promise<void>
  - delete(id: string): Promise<void>
        │
   ┌────┴───────────────────────────┐
   ▼                                ▼
[AuctionMemoryRepository]     [AuctionFirestoreRepository]
(Tests unitarios, fixture)     (Firebase Admin SDK Firestore)
```

---

## 4. Inyección de Dependencias y Fábrica de Repositorios

En `app/features/container.ts`:
- Si la variable de entorno `USE_FIRESTORE === "true"` o están presentes las credenciales de Firebase Admin, se inyecta `AuctionFirestoreRepository`.
- Si no están presentes o se corre en Vitest, se inyecta `AuctionMemoryRepository`.
- El cliente de Firestore se inicializa de forma singleton y perezosa (lazy) en `app/shared/server/firebase-admin.ts` para evitar fallos si no hay conexión en tiempo de compilación.

---

## 5. Criterios de Aceptación

1. **Persistencia Firestore:**
   - La colección `auctions` almacena correctamente las subastas creadas.
   - Se convierte adecuadamente entre `Timestamp` de Firestore y fechas ISO strings / `Date` en el dominio.
2. **Endpoints REST:**
   - `GET /api/subastas`: Retorna lista en formato `{ subastas: [...] }` con consulta indexada por `estado` y `cierra_en`, aplicando filtrado de texto `q` insensible a mayúsculas sobre los resultados.
   - `GET /api/subastas/[id]`: Retorna 200 con la subasta si existe (buscando por id o slug); 404 `SUBASTA_NO_ENCONTRADA` si no existe.
   - `POST /api/subastas`: Valida entrada Zod, calcula incremento, almacena en repositorio y retorna 201 `{ subasta: ... }`.
   - `PATCH /api/subastas/[id]`: Permite editar título/descripción si `total_pujas === 0`; si tiene pujas, responde 409 `SUBASTA_CON_PUJAS`.
   - `DELETE /api/subastas/[id]`: Realiza borrado lógico cambiando el estado a `CANCELADA` si `total_pujas === 0`; responde 409 si ya tiene pujas para preservar trazabilidad.
3. **Calidad y Reglas:**
   - Cero `any` y cero `unknown`.
   - Cero operadores ternarios.
   - Funciones <= 100 líneas, clases <= 10 métodos.
   - Peticiones y respuestas en `snake_case`.
   - 100% de pruebas en Vitest pasando sin tocar servicios de red externos (usando mocks del Admin SDK y el MemoryRepository).
   - `npm run check:full` en verde.
