# F5 · Historial de mis pujas y subastas ganadas

- **Estado:** Aprobada (aprobada por el usuario en chat)
- **Rol(es):** Comprador (cualquier usuario que participe realizando ofertas en subastas)
- **Contratos afectados:** `app/features/bids/schema.ts`, `app/features/auctions/schema.ts`

## Objetivo
Un usuario comprador puede ingresar a `/mis-pujas` para consultar de forma organizada todas las subastas en las que ha participado, navegando entre pestañas interactivas accesibles («Todas», «En curso / Activas» y «Subastas ganadas») y reconociendo al instante si va ganando, si fue superado (con acceso directo para contraofertar) o si resultó ganador de la subasta.

## Reglas de negocio
1. **Identidad del comprador:**
   - Obtenida desde la sesión autenticada (`usuario_uid`), nunca desde el cliente.
   - En este hito previo a Firebase Auth (F8), se inyecta la sesión de comprador de prueba (`comprador-demo-01`).
2. **Pestañas de navegación accesibles (WCAG AA):**
   - **Todas (`todas`):** Muestra el historial completo en orden cronológico descendente.
   - **En curso / Activas (`activas`):** Solo subastas con estado `activa` donde el usuario tiene pujas.
   - **Subastas ganadas (`ganadas`):** Solo subastas cerradas donde el usuario fue el ganador adjudicado (`ganador_uid === comprador_uid`).
3. **Clasificación y estados visuales de las pujas:**
   - **Ganando (`ganando`):** Subasta activa y la puja del usuario es la más alta actual (`puja_actual_centavos === mi_puja_centavos`). Distintivo verde con icono accesible.
   - **Superada (`superada`):** Subasta activa pero otro usuario ofreció más (`puja_actual_centavos > mi_puja_centavos`). Distintivo en ámbar con botón de acción rápida «Pujar de nuevo» hacia `/subastas/[id]`.
   - **Subasta ganada (`ganada`):** Subasta cerrada y adjudicada al usuario. Distintivo en azul/dorado de felicitación.
   - **Finalizada sin ganar (`perdida`):** Subasta cerrada ganada por otro comprador. Distintivo en gris neutro.
4. **Artículos de muestra (fixtures de prueba del comprador):**
   - `leica-m3-1954`: Estado **Ganando** (puja del usuario: $150.000 COP, activa con cuenta regresiva viva).
   - `macbook-pro-m3-max`: Estado **Superada** (puja del usuario: $120.000 COP, puja actual: $125.000 COP, activa con botón «Pujar de nuevo»).
   - `reloj-vintage-oro`: Estado **Ganada** (subasta cerrada, adjudicada al usuario por $95.000 COP).
5. **Diseño y accesibilidad (WCAG AA):**
   - 360 px: Tarjetas verticales con espaciado cómodo y botones táctiles $\ge 44 \times 44$ px.
   - Roles ARIA para pestañas (`role="tablist"`, `role="tab"`, `role="tabpanel"`).
   - Estado vacío accesible: Si no hay pujas en la pestaña seleccionada, mensaje descriptivo con botón directo «Explorar catálogo» hacia `/`.

## Entradas y salidas
| Entrada | Tipo / restricción |
| --- | --- |
| Pestaña seleccionada | `todas` \| `activas` \| `ganadas` |

Salida exitosa:
- Lista tipada de participaciones en subasta con montos, fechas, estados y cuenta regresiva.

Errores esperados:
- `UNAUTHENTICATED` (401) → Si el usuario no tiene sesión válida.

## Criterios de aceptación
- **Dado** el comprador demo en `/mis-pujas`, **cuando** carga la página en la pestaña «Todas», **entonces** ve las 3 subastas con sus insignias respectivas («Ganando», «Superada» y «Subasta ganada»).
- **Dado** la subasta con puja superada (`macbook-pro-m3-max`), **cuando** se renderiza su tarjeta, **entonces** muestra el botón «Pujar de nuevo» con enlace directo a su detalle.
- **Dado** la pestaña «Subastas ganadas», **cuando** el usuario hace clic, **entonces** solo se muestra la subasta adjudicada (`reloj-vintage-oro`).
- **Dado** un filtro sin resultados o usuario sin pujas, **cuando** se consulta, **entonces** se muestra el estado vacío accesible con enlace al catálogo principal.
