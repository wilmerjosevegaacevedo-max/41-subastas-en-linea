# F9 · Subida directa de fotos con Vercel Blob y cuotas seguras

**Estado:** Aprobada  
**Fecha:** 2026-11-14  
**Hito:** Hito 4 (Semana 15 - 15%)  
**Autor:** Antigravity & Estudiante

---

## 1. Propósito y Alcance

Permitir a los vendedores subir fotos reales directamente a **Vercel Blob** al crear o editar una subasta en `/vender`, aplicando cuotas de tamaño, validación estricta de tipos MIME (`image/jpeg`, `image/png`, `image/webp`), cuota máxima de archivos por subasta (máximo 5 fotos) y autenticación obligatoria del solicitante mediante cookie de sesión.

---

## 2. Flujo de Subida y Seguridad

```
[Navegador / Formulario /vender]
        │ 1. Usuario selecciona o arrastra imagen (< 4.5 MB)
        ▼
[POST /api/fotos/upload]
        │ 2. Valida sesión HttpOnly (Regla 4)
        │ 3. Valida MIME type (image/jpeg, image/png, image/webp)
        │ 4. Valida tamaño máximo (4.5 MB por foto)
        ▼
[Vercel Blob Storage]
        │ 5. Almacena el archivo en CDN seguro (Edge Network)
        ▼
[Respuesta JSON al cliente]
        │ 6. Retorna URL pública segura https://...
        ▼
[UI /vender]
        │ 7. Muestra miniatura inmediata y agrega a la lista de fotos
```

---

## 3. Contratos de la API REST (`snake_case`)

### 3.1. Endpoint `POST /api/fotos/upload`

**Petición:** `multipart/form-data` con campo `foto` (File binario).
- Valida sesión de usuario activa en el servidor (cookie HttpOnly).
- Valida tamaño máximo de 4.5 MB.
- Valida tipo MIME permitido (`image/jpeg`, `image/png`, `image/webp`).

**Respuesta exitosa (HTTP 201 Created):**
```json
{
  "foto_url": "https://public.blob.vercel-storage.com/subastas/foto-123.webp",
  "tamano_bytes": 1048576,
  "tipo_mime": "image/webp"
}
```

### 3.2. Esquemas Zod (`app/features/auctions/schema.ts`)

- `UploadPhotoResponseSchema`:
  ```typescript
  z.object({
    foto_url: z.string().url(),
    tamano_bytes: z.number().int().positive(),
    tipo_mime: z.string().min(1),
  });
  ```

---

## 4. UI y Experiencia de Usuario (`/vender`)

1. **Soporte híbrido de selección y subida de fotos**:
   - **Selector y arrastre de archivos locales:** Botón accesible y zona de Drag & Drop para subir archivos reales al endpoint `/api/fotos/upload`.
   - **Modo alternativo (URL directa):** Pestaña o campo opcional para pegar una URL `https://` directa para demostraciones rápidas o pruebas sin archivos físicos.
   - **Galería de miniaturas:** Muestra las fotos cargadas con botón accesible para eliminarlas.
   - **Límite:** Máximo 5 fotos por subasta. Indicador de carga con barra accesible de estado durante la subida.

---

## 5. Puertos y Desacoplamiento para Pruebas

```
[Route Handler: /api/fotos/upload]
        │
        ▼
[Servicio / Puerto: BlobStoragePort]
  - uploadPhoto(file: { buffer: Buffer; name: string; type: string }): Promise<UploadResult>
        │
   ┌────┴───────────────────────────┐
   ▼                                ▼
[MemoryBlobStorage]           [VercelBlobStorage]
(Tests unitarios en Vitest)   (@vercel/blob SDK real)
```

---

## 6. Criterios de Aceptación

1. **Validación de cuotas:** Se rechazan archivos mayores a 4.5 MB con error `400 VALIDATION_ERROR`.
2. **Validación de tipos:** Solo se admiten `image/jpeg`, `image/png` y `image/webp`. Cualquier otro formato se rechaza con `400 VALIDATION_ERROR`.
3. **Autenticación obligatoria:** Solo usuarios con sesión activa pueden subir archivos (`401 UNAUTHENTICATED` si no hay sesión).
4. **Calidad de código:** Cero `any`, cero `unknown`, cero ternarios, inyección de dependencias pura, y 100% de pruebas en Vitest en verde sin llamadas de red externas.
