# Handoff · F9: Subida directa de fotos con Vercel Blob y cuotas seguras

**Fecha:** 2026-11-14  
**Hito:** Hito 4 (Semana 15 - 15%)  
**Estado:** Terminada y Verificada  
**Commit:** Pendiente de push a `main`

---

## 1. Resumen de la Entrega

Se implementó el sistema de almacenamiento y subida de fotos para subastas en Vercel Blob con control estricto de cuotas, validación de formatos de imagen, autenticación de la sesión en el servidor y soporte desacoplado para pruebas unitarias:
- **Cuotas de Tamaño y Formatos:** Límite máximo de 4.5 MB por archivo y restricción estricta a tipos MIME de imagen web (`image/jpeg`, `image/png`, `image/webp`).
- **Seguridad en el Servidor (Regla 4):** El endpoint `POST /api/fotos/upload` valida la sesión activa del usuario vía cookies HttpOnly en el servidor antes de permitir cualquier operación de escritura en el CDN de Vercel Blob.
- **Soporte Híbrido en `/vender`:**
  - Selector de archivos locales y zona de Drag & Drop para subir fotos reales directamente a Vercel Blob.
  - Indicador de estado y progreso animado durante la subida.
  - Modo alternativo para ingresar una URL directa `https://` o seleccionar fotos de ejemplo para pruebas rápidas.
- **Desacoplamiento para Pruebas (Hexagonal):** Puerto `BlobStoragePort` con `MemoryBlobStorage` para pruebas en Vitest que se ejecutan al 100% en memoria sin requerir llamadas externas a internet ni tokens de Vercel.

---

## 2. Archivos Creados y Modificados

### Creados
- `app/shared/server/blob-storage.ts`: Puerto `BlobStoragePort`, adaptador `MemoryBlobStorage` (pruebas/offline) y `VercelBlobStorage` (`@vercel/blob` en producción).
- `app/api/fotos/upload/route.ts`: Endpoint `POST` para recibir imágenes `multipart/form-data`, validar sesión y cuotas, y delegar al almacenamiento en blob.
- `app/features/auctions/tests/blob-upload.test.ts`: 5 pruebas unitarias verificando subida válida, rechazo de formatos inválidos, límite de tamaño (> 4.5 MB) y rechazo no autenticado (401).
- `docs/specs/F9-fotos-blob.md`: Especificación formal aprobada por el estudiante.
- `docs/handoffs/F9-fotos-blob.md`: Este documento de entrega.

### Modificados
- `app/features/auctions/schema.ts`: Agregado `UploadPhotoResponseSchema` con claves snake_case (`foto_url`, `tamano_bytes`, `tipo_mime`).
- `app/features/auctions/ui/publish-auction-sections.tsx`: Sección `PhotoInputSection` enriquecida con selector de archivos, estados de carga y previsualización.
- `package.json` y `package-lock.json`: Instalado `@vercel/blob` (^0.27.1).
- `docs/progreso.md`: Actualizado estado de F9 a `Terminada`.
- `ia/bitacora.md`: Registrada la aprobación e implementación de F9.

---

## 3. Verificación de Calidad

- **Formateo:** `biome format` comprobó 90 archivos sin fallas.
- **Linting:** `eslint` pasó con **0 errores y 0 warnings**.
- **Tipado:** `next typegen && tsc --noEmit` completado al 100%.
- **Pruebas:** **130/130 pruebas pasando en verde en Vitest** (0 dependencias de red externas).
- **Build de producción:** `next build` (Turbopack) generó con éxito 12 páginas y 7 endpoints API:
  - `/api/auth/me`
  - `/api/auth/session`
  - `/api/fotos/upload`
  - `/api/subastas`
  - `/api/subastas/[id]`
  - `/api/subastas/[id]/pujas`
  - `/api/tiempo`
- **Reglas del curso:**
  - Cero `any` y cero `unknown`.
  - Cero operadores ternarios (`no-ternary`).
  - snake_case en todos los contratos de entrada y salida JSON.
  - Autorización en el servidor desde la sesión.
