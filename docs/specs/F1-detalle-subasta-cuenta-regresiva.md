# F1 · Detalle de subasta y cuenta regresiva sincronizada

- **Estado:** Aprobada
- **Rol(es):** Público (cualquier visitante o usuario autenticado)
- **Contrato afectado:** `app/features/auctions/schema.ts`

## Objetivo
Un visitante o comprador puede consultar la ficha completa de una subasta activa (título, descripción, fotos, precio actual, incremento mínimo y vendedor) y ver una cuenta regresiva accesible y exacta, calculada contra el tiempo del servidor para evitar discrepancias por relojes locales desfasados.

## Reglas de negocio
1. **Sincronización de reloj:** La cuenta regresiva se calcula como:
   $$\text{tiempoRestante} = \text{cierraEn} - (\text{tiempoCliente} + \text{desfaseServidor})$$
   donde $\text{desfaseServidor} = \text{tiempoServidor} - \text{tiempoClienteEnRespuesta}$.
2. **Exactitud ante reloj desfasado:** Si el reloj del dispositivo del usuario está adelantado o atrasado (por ejemplo 5 minutos), la cuenta regresiva debe reflejar el tiempo real restante del servidor con un margen de error menor a 1 segundo.
3. **Frecuencia y formato del contador:**
   - Descuenta segundo a segundo (`1000 ms`).
   - Cuando falten más de 60 segundos: formato estándar `DDd HHh MMm SSs`.
   - **Regla decidida por la persona:** Cuando falten menos de 60 segundos, se destaca visualmente mostrando únicamente los segundos en grande: `XX segundos restantes`.
   - **Regla decidida por la persona:** Cuando el tiempo restante sea $\le 0$, el contador se detiene inmediatamente, se fija en `00:00:00` y muestra una insignia en gris oscuro con el texto `Subasta finalizada`.
4. **Datos de ejemplo del Hito 1 (Fixture base):**
   - Título: `Cámara Vintage Leica M3 1954`.
   - Descripción: `Cámara telemétrica clásica de 35 mm en impecable estado de conservación mecánica y estética. Número de serie original de 1954, incluye lente Summicron 50mm f/2 y funda de cuero original.`.
   - Precio inicial: `15000000` centavos ($150.000).
   - Incremento mínimo: `1000000` centavos ($10.000).
   - Puja actual: `15000000` centavos ($150.000).
   - Cierre inicial: 3 días a partir del momento de carga.
5. **Estados visuales obligatorios:**
   - **Carga:** Esqueleto visual que reserva el espacio del título, fotos y contador para evitar saltos de diseño (CLS $\le 0.1$).
   - **No encontrado (404):** Mensaje claro si el id de la subasta no existe.
   - **Error con reintento:** Si la consulta falla, muestra botón accesible «Reintentar».
6. **Accesibilidad (WCAG 2.2 AA):**
   - El contenedor del contador incluye `role="timer"` con `aria-label="Tiempo restante de la subasta"` y `aria-live="polite"`.
   - Diseño probado en 360 px, 768 px y 1024 px sin desplazamiento horizontal.

## Entradas y salidas
| Entrada | Tipo / restricción |
| --- | --- |
| `id` de subasta | Texto alfanumérico en URL (`/subastas/[id]`) |
| Datos de la subasta | Esquema Zod `AuctionDetailSchema` |

Salida exitosa:
- Interfaz renderizada con la ficha del producto y la cuenta regresiva viva y sincronizada.

Errores esperados:
- `NOT_FOUND` (404) → Si no existe la subasta con ese `id`.
- `INTERNAL_ERROR` (500) → Si falla la obtención de datos.

## Autorización
- Lectura pública: No requiere inicio de sesión para ver el detalle ni la cuenta regresiva.

## Criterios de aceptación
- **Dado** un reloj del usuario adelantado 5 minutos respecto a la hora real, **cuando** carga la página de la subasta, **entonces** la cuenta regresiva muestra el tiempo exacto restante calculado con el desfase del servidor.
- **Dado** una subasta activa con cierre en 10 minutos, **cuando** transcurren 5 segundos en pantalla, **entonces** el contador descuenta de forma continua segundo a segundo.
- **Dado** una subasta a la que le quedan menos de 60 segundos, **cuando** se actualiza el contador, **entonces** muestra el texto grande `XX segundos restantes`.
- **Dado** una subasta cuyo tiempo llega a 0, **cuando** el contador finaliza, **entonces** se fija en `00:00:00` y muestra la insignia `Subasta finalizada`.
- **Dado** un id de subasta inexistente, **cuando** el usuario entra a la ruta, **entonces** se muestra la vista 404 accesible.

## Bordes
- Tiempo restante = 0 (subasta cerrada).
- Tiempo restante = 59 segundos (transición a formato de segundos en grande).
- Tiempo restante > 24 horas (mostrar días y horas).
- Desfase del reloj del cliente positivo (+5 min) y negativo (-5 min).

## Fuera de alcance
- Formulario de puja y envío de ofertas (corresponde a F2).
- Cierre en base de datos real Firestore (corresponde a F7 en Hito 3).

## Preguntas abiertas
1. **¿Cómo debe formatearse visualmente el tiempo cuando falten menos de 60 segundos?**
   - *Respuesta de la persona:* Solo los segundos en grande: `XX segundos restantes`.
2. **¿Qué texto o insignia visual debe mostrar el contador en el momento exacto en que llega a cero?**
   - *Respuesta de la persona:* Insignia «Subasta finalizada» en gris oscuro y contador fijado en `00:00:00`.
3. **Para este Hito 1 (datos de ejemplo), ¿qué subasta de muestra utilizaremos como fixture base?**
   - *Respuesta de la persona:* Una subasta de colección: «Cámara Vintage Leica M3 1954», precio inicial $150.000, incremento $10.000, cierre en 3 días.
