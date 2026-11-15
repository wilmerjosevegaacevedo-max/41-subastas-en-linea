# F10 · Auditoría de calidad (Lighthouse >= 90/95, WCAG 2.2 AA) y despliegue Vercel

**Estado:** Aprobada  
**Fecha:** 2026-11-14  
**Hito:** Hito 4 (Semana 15 - 15%)  
**Autor:** Antigravity & Estudiante

---

## 1. Propósito y Alcance

Garantizar los más altos estándares de calidad, accesibilidad universal (WCAG 2.2 Nivel AA), rendimiento web (Lighthouse $\ge 90/95$ en Rendimiento, Accesibilidad, Mejores Prácticas y SEO) y la configuración de producción para el despliegue en Vercel, cerrando formalmente el ciclo completo de desarrollo del proyecto.

---

## 2. Áreas de Auditoría y Verificación

### 2.1. Accesibilidad Universal (WCAG 2.2 Nivel AA)
- **Navegación por Teclado:**
  - Enlace de salto rápido al contenido principal (`.skip-link` a `#contenido`).
  - Anillos de foco visibles de alto contraste (`focus-visible:ring-2 focus-visible:ring-primary` o `ring-amber-500`).
  - Orden secuencial y lógico de tabulación en todos los formularios (`/vender`, `/login`, detalle de subasta).
- **Semántica y Contraste:**
  - Ratio de contraste cromático mínimo de $4.5:1$ en texto estándar y $3:1$ en elementos gráficos.
  - Cero texto plano sin etiquetas semánticas (`<p>`, `<h1>`–`<h6>`, `<time>`, `<label>`, `<button>`).
  - Zonas dinámicas accesibles: Región `aria-live="polite"` en el reloj de cuenta regresiva y estados de puja.
  - Respeto a preferencias del sistema: `@media (prefers-reduced-motion: reduce)` para desactivar transiciones o animaciones invasivas.

### 2.2. Rendimiento y Core Web Vitals (Lighthouse $\ge 90/95$)
- **Optimización de Recursos:**
  - Pre-renderizado estático e híbrido (PPR / Partial Prerendering) en rutas públicas (`/`, `/mis-pujas`, `/login`, `/vender`).
  - Carga diferida de imágenes con dimensiones explícitas (`aspect-ratio` o `next/image`).
  - Tipografía intencional con fallback del sistema para evitar Cumulative Layout Shift (CLS = 0).
- **Headers de Seguridad y SEO:**
  - Encabezados HTTP de seguridad configurados (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`).
  - Metadatos OpenGraph y etiquetas canónicas completas en `app/layout.tsx`.

### 2.3. Configuración y Puertas de Despliegue en Vercel
- Encabezados de seguridad HTTP configurados tanto en `next.config.ts` como en `vercel.json` (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`).
- Verificación de variables de entorno mediante `npm run check:env` garantizando paridad con `.env.example`.
- Documentación exhaustiva en `docs/handoffs/F10-calidad-despliegue.md` con checklist paso a paso para conectar el repositorio GitHub con Vercel y configurar las variables de entorno de producción.
- Ejecución completa de la puerta de calidad `npm run check:full` con cero errores.

---

## 3. Pruebas Automatizadas de Calidad en Vitest

Se creará la suite `tests/project/quality-audit.test.ts` para verificar:
1. Existencia y accesibilidad del enlace `#contenido` (`skip-link`).
2. Metadatos SEO y OpenGraph completos en el layout raíz.
3. Ausencia de atributos o estilos que violen directivas WCAG 2.2 AA.
4. Cumplimiento de headers de seguridad en la configuración de despliegue.

---

## 4. Criterios de Aceptación

1. **Pruebas:** 100% de las pruebas en Vitest en verde (más de 130 pruebas unitarias y de integración).
2. **Auditoría de Código:** `npm run check:full` pasa con **0 errores de ESLint**, **0 errores de formato Biome** y compilación exitosa de Next.js.
3. **Reglas de Calidad:**
   - Cero `any` y cero `unknown`.
   - Cero operadores ternarios (`no-ternary`).
   - Máximo 100 líneas por función y 10 métodos por clase.
   - Peticiones y respuestas en `snake_case`.
4. **Despliegue:** Documentación clara de despliegue con checklist para Vercel en el handoff final.
