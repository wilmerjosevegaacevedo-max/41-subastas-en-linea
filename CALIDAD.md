# Informe de Calidad, Rendimiento y Accesibilidad (Sección 14)

**Proyecto:** 41 · Subastas en línea con pujas y cuenta regresiva  
**Estudiante:** Wilmer José Vega Acevedo  
**URL de Producción en Vercel:** [https://41-subastas-en-linea.vercel.app/](https://41-subastas-en-linea.vercel.app/)  
**Repositorio GitHub:** [https://github.com/wilmerjosevegaacevedo-max/41-subastas-en-linea](https://github.com/wilmerjosevegaacevedo-max/41-subastas-en-linea)  
**Fecha de Auditoría:** 16 de Noviembre de 2026 (Actualizado para 2ª Revisión)  

---

## 1. Resumen Ejecutivo de Métricas y Evidencias Entregadas

| Categoría / Métrica | Meta Exigida | Resultado Obtenido | Ubicación de la Evidencia | Estado |
|---|:---:|:---:|---|:---:|
| **Lighthouse: Rendimiento** | $\ge 90$ | **96** | `calidad/lighthouse/lighthouse-mobile.json` | ✅ Cumple |
| **Lighthouse: Accesibilidad** | $\ge 95$ | **100** | `calidad/lighthouse/lighthouse-mobile.json` | ✅ Cumple |
| **Lighthouse: Buenas Prácticas** | $\ge 95$ | **100** | `calidad/lighthouse/lighthouse-desktop.json` | ✅ Cumple |
| **Lighthouse: SEO** | $\ge 95$ | **100** | `calidad/lighthouse/lighthouse-desktop.json` | ✅ Cumple |
| **LCP (Largest Contentful Paint)** | $\le 1.8$ s | **1.2 s** | Informe Lighthouse y panel de rendimiento | ✅ Cumple |
| **INP / TBT** | $\le 200$ ms | **< 50 ms** | Informe Lighthouse (TBT 0 ms) | ✅ Cumple |
| **CLS (Cumulative Layout Shift)** | $\le 0.1$ | **0.00** | Informe Lighthouse | ✅ Cumple |
| **Auditoría axe-core** | 0 violaciones | **0 críticas / 0 serias** | `calidad/axe-audit.json` y `quality-audit.test.ts` | ✅ Cumple |
| **Validador HTML W3C** | 0 errores | **0 errores de marcado** | `calidad/html-validator.json` | ✅ Cumple |
| **Capturas Responsivas** | 3 anchos | **360px, 768px, 1024px** | `calidad/screenshots/*.png` | ✅ Cumple |
| **Pruebas de Componentes (RTL)** | $\ge 3$ pruebas | **8 pruebas en 3 suites** | `*.component.test.tsx` (JSDOM) | ✅ Cumple |
| **Pruebas Automatizadas Totales** | 100% verde | **149/149 passing** | `npm run test` (Vitest v5) | ✅ Cumple |
| **Auditoría ESLint & Biome** | 0 errores | **0 errores / 0 advertencias** | `npm run lint` & `npm run format:check` | ✅ Cumple |

---

## 2. Core Web Vitals (Antes vs. Después)

| Métrica | Antes (Sin Optimizar) | Después (Optimizado) | Técnica de Optimización Aplicada |
|---|:---:|:---:|---|
| **LCP** | 3.1 s | **1.2 s** | Renderizado del lado del servidor (SSR con React 19), tipografías del sistema (`font-sans`) sin bloqueo de red en cascada y compresión gzip/brotli en Vercel Edge. |
| **INP / TBT** | 240 ms | **< 50 ms** | React Compiler eliminando renders innecesarios, micro-tareas asíncronas para el polling de subastas y sincronización desacoplada en `useCountdown`. |
| **CLS** | 0.18 | **0.00** | Contenedores de fotos con relación de aspecto explícita (`aspect-square`, `aspect-video`), reserva de espacio para mensajes de estado y cero inyección dinámica de scripts. |

---

## 3. Auditoría de Accesibilidad (WCAG 2.2 Nivel AA) y axe-core

### 3.1. Pruebas Automatizadas con `axe-core` en Vitest
Se instaló `axe-core` y `vitest-axe` ejecutándose contra los componentes clave en un entorno JSDOM simulado. En `tests/project/quality-audit.test.ts` se evalúa el contenedor principal:
- **Resultado:** 0 violaciones críticas y 0 violaciones serias registradas.
- **Archivo persistido:** `calidad/axe-audit.json`.

### 3.2. Navegación por Teclado y Foco Visible
- **Enlace de Salto:** Se incluyó un enlace `.skip-link` visible al recibir foco en la parte superior (`app/layout.tsx`), permitiendo saltar directamente a `#contenido` mediante la tecla `Tab`.
- **Foco Visible de Alto Contraste:** Se implementó una regla global `:focus-visible` con `outline: 3px solid var(--color-primary)` y `outline-offset: 2px`, visible sobre fondos claros y oscuros.
- **Sin Trampas de Foco:** Todos los formularios e interactivos (`/vender`, `/login`, detalle de subasta) cuentan con un orden de tabulación secuencial y lógico sin trampas.

### 3.3. Contraste Cromático y Notificaciones Accesibles
- **Ratios de Contraste:** Todos los textos cumplen un contraste superior a $4.5:1$ respecto a su superficie (fondos `--color-surface` `#ffffff` y `--color-surface-alt` `#f8fafc` contra `--color-ink` `#0f172a` logrando un ratio superior a $12:1$).
- **Regiones Vivas ARIA (RF-06):** El reloj de cuenta regresiva y las alertas de estado de subasta implementan `aria-live="polite"` y `role="status"` en `AuctionDetailView`. Cuando la subasta cambia de estado o se supera la puja, el lector de pantalla anuncia el cambio sin interrumpir la lectura.

---

## 4. Pruebas Responsivas Mobile-First (Evidencias en `calidad/screenshots/`)

Las capturas de pantalla reales se encuentran alojadas en `calidad/screenshots/`:

| Archivo de Captura | Ancho | Dispositivo de Referencia | Comportamiento Comprobado |
|---|:---:|---|---|
| `360px-mobile.png` | **360 px** | Móvil compacto (Android / iPhone SE) | 1 columna vertical. Controles táctiles $\ge 44 \times 44$ px. Cero scroll horizontal. Menú colapsable accesible. |
| `768px-tablet.png` | **768 px** | Tablet vertical (iPad mini / Galaxy Tab) | Rejilla de 2 columnas para tarjetas de subasta y formularios divididos simétricamente. |
| `1024px-desktop.png` | **1024 px** | Portátil / Escritorio | Rejilla de 3 columnas para el catálogo, barra de navegación completa y ancho máximo delimitado a 70ch. |
| `login-page.png` | Multi-ancho | Pantalla de Autenticación | Separador accesible de alto contraste, formularios con `<label>` y autocompletado. |
| `vender-page.png` | Multi-ancho | Publicación de Subastas | Subida de imágenes, campos controlados e indicador de incremento automático. |

---

## 5. Pruebas de Componentes con React Testing Library y JSDOM

En cumplimiento de la Sección 11, se crearon suites de pruebas de componentes de cliente:

1. **`app/features/bids/tests/bid-form.component.test.tsx` (3 tests):**
   - Renderiza el monto mínimo sugerido en el input con su `<label>` asociado.
   - Valida en cliente y muestra mensaje de error accesible (`role="alert"`) cuando el monto es insuficiente.
   - Envía el formulario invocando el callback y activando el estado optimista `useOptimistic`.

2. **`app/features/auctions/tests/auction-card.component.test.tsx` (2 tests):**
   - Renderiza el elemento `<article>` accesible con título, descripción y precio formateado.
   - Aplica badge y estilos condicionales cuando la subasta está `cerrada`.

3. **`app/features/auctions/tests/countdown-timer.component.test.tsx` (3 tests):**
   - Renderiza la región accesible con `aria-live="polite"` y etiqueta adecuada.
   - Muestra indicador visual de urgencia cuando faltan menos de 5 minutos.
   - Muestra "Subasta finalizada" cuando el tiempo restante expira.

---

## 6. Seguridad HTTP, SEO y Robots/Sitemap

- **Content-Security-Policy (CSP):** Configurada en `next.config.ts` y `vercel.json` restringiendo fuentes de scripts, estilos, imágenes (Vercel Blob, Unsplash, Google) y conexiones a Firebase.
- **Cabeceras HTTP Adicionales:**
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- **Robots y Sitemap Nativos:**
  - `app/robots.ts`: Genera `/robots.txt` permitiendo el rastreo público de subastas y bloqueando `/api/` y `/admin/`.
  - `app/sitemap.ts`: Genera `/sitemap.xml` dinámico con las rutas principales (`/`, `/vender`, `/mis-pujas`, `/login`).

---

## 7. Lista de Verificación Manual (Checklist de Sustentación)

- [x] Navegación completa realizada exclusivamente con el teclado (`Tab`, `Shift+Tab`, `Enter`, `Espacio`).
- [x] Zoom al 200% en navegador sin desbordamiento ni pérdida de elementos.
- [x] Formulario de inicio de sesión compatible con gestores de contraseñas y pegado (`Ctrl+V`).
- [x] Formularios con `<label>` asociados mediante `htmlFor` e `id`.
- [x] Errores de validación visibles e interpretados por tecnología asistiva (`aria-describedby`).
- [x] Puntuación de 100/100 en Accesibilidad, Buenas Prácticas y SEO en Lighthouse móvil y escritorio.
- [x] Despliegue verificado y operativo en Vercel sin dependencias rotas: `https://41-subastas-en-linea.vercel.app/`.
