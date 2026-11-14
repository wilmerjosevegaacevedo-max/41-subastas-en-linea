# F4 · Publicar una nueva subasta

- **Estado:** Aprobada (aprobada por el usuario en chat)
- **Rol(es):** Vendedor (cualquier usuario que publique un artículo para subasta)
- **Contrato afectado:** `app/features/auctions/schema.ts`

## Objetivo
Un usuario puede ingresar a `/vender` para publicar un nuevo artículo en subasta completando un formulario accesible (WCAG AA) con título, descripción, fotografía (con vista previa instantánea), precio base y duración en días. El incremento mínimo de puja se calcula automáticamente según el precio inicial. Al publicarla, la subasta se incorpora al catálogo activo en memoria y redirige a la vista de detalle de la subasta (`/subastas/[id]`).

## Reglas de negocio
1. **Campos del formulario:**
   - **Título:** Entre 5 y 100 caracteres.
   - **Descripción:** Entre 20 y 2000 caracteres.
   - **Fotografía principal:** Campo de URL https con vista previa inmediata y botones de fotos de muestra predeterminadas (Vintage, Relojería, Computación) para facilitar pruebas y uso rápido.
   - **Precio inicial (COP):** Monto positivo en pesos (mínimo $10.000 COP = 1.000.000 centavos).
   - **Incremento mínimo automático:** Se calcula automáticamente como el 5% del precio inicial (mínimo $1.000 COP = 100.000 centavos), redondeado a millares para cifras claras en pesos colombianos. El usuario ve el incremento resultante en pantalla de forma clara sin tener que calcularlo.
   - **Duración en días:** Selector visual accesible con opciones de 1 día, 3 días, 5 días o 7 días. El tiempo de cierre (`cierra_en`) se calcula sumando la duración en milisegundos al tiempo actual inyectado (`now: Date`).
2. **Identidad del vendedor:**
   - Asignada desde la sesión del usuario (`vendedor_uid`), nunca desde datos arbitrarios del cuerpo de la petición.
   - En este hito previo a Firebase Auth (F8), se inyecta la sesión de prueba activa (`vendedor-demo-01`).
3. **Validación y Accesibilidad (WCAG AA):**
   - Validación inmediata en cliente y validación estricta en el servidor mediante Zod.
   - Cada campo cuenta con etiqueta `<label htmlFor="...">`.
   - Mensajes de error asociados mediante `aria-describedby` y `aria-invalid="true"`.
   - Objetivos táctiles $\ge 44 \times 44$ px en móviles (360 px).
   - Prevención de doble envío: botón deshabilitado con estado visual «Publicando subasta...».
4. **Flujo de éxito:**
   - La nueva subasta se registra en estado `activa` con `puja_actual_centavos = precio_inicial_centavos` y `ganador_uid = null`.
   - Se agrega al repositorio en memoria y redirige a `/subastas/[id]`.

## Entradas y salidas
| Entrada | Tipo / restricción |
| --- | --- |
| `titulo` | Texto (5 a 100 caracteres) |
| `descripcion` | Texto (20 a 2000 caracteres) |
| `foto_url` | URL https válida |
| `precio_inicial_pesos` | Entero positivo $\ge 10.000$ |
| `duracion_dias` | Entero (1, 3, 5, 7) |

Salida exitosa:
- `AuctionDetail` con ID generado a partir del título (slug amigable) o id alfanumérico, estado `activa`.
- Redirección a `/subastas/[id]`.

Errores esperados:
- `VALIDATION_ERROR` (400) → Si los datos no cumplen con las reglas Zod.

## Criterios de aceptación
- **Dado** un formulario con título, descripción, foto, precio de $50.000 COP y duración de 3 días, **cuando** el usuario publica, **entonces** el incremento mínimo se calcula automáticamente en $2.500 COP (5%), la subasta se crea y redirige a `/subastas/[slug]`.
- **Dado** un precio menor a $10.000 COP, **cuando** el usuario intenta enviar, **entonces** el campo muestra el error accesible «El precio inicial debe ser de al menos $10.000 COP».
- **Dado** una URL de imagen ingresada, **cuando** el usuario escribe o hace clic en una foto de muestra, **entonces** se actualiza la vista previa de la imagen en tiempo real.
