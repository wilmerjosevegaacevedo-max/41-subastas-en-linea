# F3 · Catálogo de subastas activas

- **Estado:** Aprobada (aprobada por el usuario en chat)
- **Rol(es):** Público (cualquier visitante o comprador)
- **Contrato afectado:** `app/features/auctions/schema.ts`

## Objetivo
Un visitante o comprador puede explorar todas las subastas activas desde la página principal (`/`), visualizar tarjetas responsivas con su foto principal, título, puja actual y cuenta regresiva viva, y filtrar por texto o cambiar el ordenamiento para encontrar artículos de su interés.

## Reglas de negocio
1. **Listado de subastas:**
   - Muestra únicamente subastas con estado `activa` y cuyo tiempo de cierre sea futuro (`cierraEn > tiempoActual`).
   - Si una subasta vence mientras el usuario está en el catálogo, su tarjeta se actualiza mostrando «Finalizada» y deshabilitando la interacción.
2. **Artículos de muestra (fixtures en memoria):**
   - `leica-m3-1954`: Cámara Leica M3 Rangefinder (1954).
   - `omega-speedmaster-1969`: Reloj Omega Speedmaster Professional «Moonwatch» (1969).
   - `macbook-pro-m3-max`: Computador portátil MacBook Pro 16" M3 Max (2023).
3. **Contenido de cada tarjeta de subasta:**
   - Fotografía principal del artículo (mediante `next/image` y dimensiones responsivas optimizadas).
   - Título del artículo y descripción resumida (máximo 2 líneas, `line-clamp-2`).
   - Puja actual (o precio base si no tiene pujas) formateada en pesos colombianos (COP).
   - Componente compacto de cuenta regresiva sincronizada con el servidor (`CountdownTimer`).
   - Enlace accesible «Ver subasta» hacia `/subastas/[id]`.
4. **Búsqueda y Ordenamiento en cliente:**
   - **Búsqueda por texto:** Filtra en tiempo real comparando contra el título y descripción (sin distinción de mayúsculas/minúsculas ni tildes).
   - **Opciones de ordenamiento:**
     - `cierre_proximo`: Subastas que cierran más pronto primero (por defecto).
     - `menor_precio`: Menor monto de puja actual primero.
     - `mayor_precio`: Mayor monto de puja actual primero.
5. **Diseño Responsivo Mobile-First (WCAG AA):**
   - **360 px:** 1 columna vertical con espaciados cómodos y objetivos táctiles $\ge 44 \times 44$ px.
   - **768 px:** 2 columnas en rejilla (`md:grid-cols-2`).
   - **1024 px:** 3 columnas en rejilla (`lg:grid-cols-3`).
   - Sin desplazamiento horizontal en ninguna resolución.
6. **Estados visuales obligatorios:**
   - **Carga:** Esqueletos visuales (`AuctionCardSkeleton`) que reservan el espacio visual de la rejilla.
   - **Vacío:** Si no hay subastas activas o ningún resultado coincide con el filtro de búsqueda, muestra un mensaje accesible: «No se encontraron subastas activas» junto con la sugerencia de limpiar la búsqueda.
   - **Error:** Si la carga falla, mensaje claro con botón «Reintentar».

## Entradas y salidas
| Entrada | Tipo / restricción |
| --- | --- |
| Parámetros de búsqueda | Texto opcional (`q`) |
| Parámetros de ordenamiento | Criterio (`cierre_proximo` \| `menor_precio` \| `mayor_precio`) |

Salida exitosa:
- Cuadrícula responsiva de subastas activas con cuenta regresiva en cada tarjeta.

Errores esperados:
- `INTERNAL_ERROR` (500) → Si falla la recuperación de datos del repositorio.

## Autorización
- Acceso público: Cualquiera puede ver el catálogo sin iniciar sesión.

## Criterios de aceptación
- **Dado** un catálogo con 3 subastas activas (Leica M3, Omega Speedmaster, MacBook Pro M3), **cuando** el usuario entra a `/`, **entonces** ve las 3 tarjetas en la rejilla adaptativa.
- **Dado** el término de búsqueda «Omega», **cuando** se escribe en el buscador, **entonces** solo la tarjeta del reloj se mantiene visible.
- **Dado** el ordenamiento «menor_precio», **cuando** se selecciona, **entonces** las tarjetas se ordenan de menor a mayor valor.
- **Dado** una resolución móvil de 360 px, **cuando** se renderiza la página, **entonces** se apilan en 1 sola columna sin scroll horizontal y con botones $\ge 44 \times 44$ px.
- **Dado** un término de búsqueda inexistente (ej: «SubastaInexistente123»), **cuando** se filtra, **entonces** se muestra el estado vacío accesible con opción de limpiar el filtro.
