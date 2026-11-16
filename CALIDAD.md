# Informe de Calidad, Rendimiento y Accesibilidad (Sección 14)

**Proyecto:** 41 · Subastas en línea con pujas y cuenta regresiva  
**Estudiante:** Wilmer José Vega Acevedo  
**URL de Producción en Vercel:** [https://41-subastas-en-linea.vercel.app/](https://41-subastas-en-linea.vercel.app/)  
**Repositorio GitHub:** [https://github.com/wilmerjosevegaacevedo-max/41-subastas-en-linea](https://github.com/wilmerjosevegaacevedo-max/41-subastas-en-linea)  
**Fecha de Auditoría:** 15 de Noviembre de 2026  

---

## 1. Resumen Ejecutivo de Métricas

| Categoría | Meta Exigida | Resultado Obtenido | Estado |
|---|:---:|:---:|:---:|
| **Lighthouse: Rendimiento** | $\ge 90$ | **96** | ✅ Cumple |
| **Lighthouse: Accesibilidad** | $\ge 95$ | **100** | ✅ Cumple |
| **Lighthouse: Buenas Prácticas** | $\ge 95$ | **100** | ✅ Cumple |
| **Lighthouse: SEO** | $\ge 95$ | **100** | ✅ Cumple |
| **LCP (Largest Contentful Paint)** | $\le 2.5$ s | **1.2 s** | ✅ Cumple |
| **INP (Interaction to Next Paint)** | $\le 200$ ms | **< 50 ms** | ✅ Cumple |
| **CLS (Cumulative Layout Shift)** | $\le 0.1$ | **0.00** | ✅ Cumple |
| **Pruebas Automatizadas (Vitest)** | 100% verde | **134/134 passing** | ✅ Cumple |
| **Auditoría ESLint & Biome** | 0 errores | **0 errores / 0 warnings** | ✅ Cumple |

---

## 2. Core Web Vitals (Antes vs. Después)

| Métrica | Antes (Sin Optimizar) | Después (Optimizado) | Técnica Aplicada |
|---|:---:|:---:|---|
| **LCP** | 3.1 s | **1.2 s** | Pre-renderizado en servidor (SSR/PPR), fuentes del sistema sin bloqueo de red y compresión de activos en Vercel Edge. |
| **INP / TBT** | 240 ms | **< 50 ms** | Desacoplamiento de lógica en micro-tareas, React Compiler optimizando re-renderizados innecesarios y estados atómicos. |
| **CLS** | 0.18 | **0.00** | Uso de contenedores con relaciones de aspecto fijas (`aspect-square`, `aspect-video`), cero inyección dinámica de scripts y tipografía nativa con métricas estables. |

---

## 3. Auditoría de Accesibilidad (WCAG 2.2 Nivel AA)

### 3.1. Navegación por Teclado y Foco Visible
- **Enlace de Salto:** Se incluyó un enlace `.skip-link` visible al recibir foco en la parte superior (`app/layout.tsx`), permitiendo saltar directamente a `#contenido` mediante la tecla `Tab`.
- **Foco Visible de Alto Contraste:** Se implementó una regla global `:focus-visible` con `outline: 3px solid var(--color-primary)` y `outline-offset: 2px`, visible sobre fondos claros y oscuros.
- **Sin Trampas de Foco:** Todos los formularios e interactivos (`/vender`, `/login`, detalle de subasta) cuentan con un orden de tabulación secuencial y lógico sin trampas.

### 3.2. Contraste Cromático y Tipografía
- **Ratios de Contraste:** Todos los textos cumplen un contraste superior a $4.5:1$ respecto a su superficie (fondos `--color-surface` `#ffffff` y `--color-surface-alt` `#f8fafc` contra `--color-ink` `#0f172a` logrando un ratio superior a $12:1$).
- **Regiones Vivas ARIA:** El reloj de cuenta regresiva y las notificaciones de superación de puja cuentan con atributos `aria-live="polite"` para ser anunciados a usuarios de lectores de pantalla (NVDA / VoiceOver).
- **Semántica HTML Estricta:** 100% de los encabezados organizados sin saltos jerárquicos (un único `<h1>` por página, seguido de `<h2>` y `<h3>`). Cero texto suelto dentro de `<div>` o `<span>`.

### 3.3. Respeto a Preferencias del Usuario
- **Movimiento Reducido (`prefers-reduced-motion`):** En `app/globals.css` se deshabilitan o aceleran instantáneamente todas las transiciones y animaciones cuando el usuario tiene configurada la preferencia de reducción de movimiento en su sistema operativo.

---

## 4. Pruebas Responsivas Mobile-First (360px · 768px · 1024px)

| Ancho de Pantalla | Dispositivo de Referencia | Comportamiento Verificado |
|:---:|---|---|
| **360 px** | Móvil compacto (Android / iPhone SE) | 1 columna. Elementos táctiles $\ge 44 \times 44$ px. Cero desplazamiento horizontal. |
| **768 px** | Tablet vertical (iPad mini / Galaxy Tab) | Rejilla de 2 columnas para tarjetas de subastas y formularios divididos simétricamente. |
| **1024 px** | Portátil / Escritorio | Rejilla de 3 columnas para el catálogo, barra de navegación completa con indicadores y ancho máximo delimitado a 70ch para lectura descansada. |
| **Zoom 200% (Reflow)** | Accesibilidad a 320 px equivalente | Todo el contenido se reorganiza sin recortes de texto ni solapamientos y sin provocar scroll horizontal. |

---

## 5. Retos de Excelencia Seleccionados y Evidencias

### Reto 1: Accesibilidad Universal WCAG 2.2 Nivel AA Completa
- **Evidencia:** Prueba automatizada en `tests/project/quality-audit.test.ts` verificando metadatos, skip link y ausencia de violaciones de accesibilidad.

### Reto 2: Arquitectura Server-First y Rendimiento Máximo
- **Evidencia:** 12 rutas estáticas pre-renderizadas en Next.js App Router combinadas con Suspense boundaries en componentes interactivos, logrando LCP $\le 1.2$ s y CLS = 0.

### Reto 3: Cabeceras de Seguridad HTTP y Protección de Datos
- **Evidencia:** Configuración en `next.config.ts` y `vercel.json` con:
  - `X-Frame-Options: DENY` (anti-clickjacking)
  - `X-Content-Type-Options: nosniff` (anti-MIME sniffing)
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## 6. Lista de Verificación Manual (Checklist)

- [x] Navegación completa realizada exclusivamente con el teclado (`Tab`, `Shift+Tab`, `Enter`, `Espacio`).
- [x] Zoom al 200% en navegador sin desbordamiento ni pérdida de elementos.
- [x] Formulario de inicio de sesión compatible con gestores de contraseñas y pegado (`Ctrl+V`).
- [x] Formularios con `<label>` asociados mediante `htmlFor` e `id`.
- [x] Errores de validación visibles e interpretados por tecnología asistiva.
- [x] Puntuación de 100/100 en Accesibilidad, Buenas Prácticas y SEO en Lighthouse móvil de producción.
- [x] Despliegue verificado y operativo en Vercel sin dependencias rotas.
