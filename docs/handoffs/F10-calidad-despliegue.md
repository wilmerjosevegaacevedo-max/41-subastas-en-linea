# Handoff · F10: Auditoría de calidad (Lighthouse >= 90/95, WCAG 2.2 AA) y despliegue Vercel

**Fecha:** 2026-11-15  
**Hito:** Hito 4 (Semana 15 - 15%)  
**Estado:** Terminada, Verificada y Lista para Producción  
**Commit:** Pendiente de push a `main`

---

## 1. Resumen de la Entrega y Cierre del Proyecto

Con esta entrega se completa el **100% de los 4 Hitos** planificados para el proyecto de curso **41 · Subastas en línea con pujas y cuenta regresiva**. Se realizaron las auditorías finales de accesibilidad (WCAG 2.2 Nivel AA), rendimiento (Lighthouse $\ge 90/95$), encabezados de seguridad HTTP de producción y la configuración integral de despliegue en Vercel.

---

## 2. Aspectos Destacados de F10

1. **Encabezados de Seguridad HTTP en Producción (`next.config.ts` y `vercel.json`)**:
   - `X-Frame-Options: DENY`: Mitigación completa contra ataques de Clickjacking.
   - `X-Content-Type-Options: nosniff`: Prevención de ejecución involuntaria de scripts por sniffing MIME.
   - `Referrer-Policy: strict-origin-when-cross-origin`: Privacidad de navegación entre orígenes.
   - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`: Conexión forzada en HTTPS (HSTS).
   - `Permissions-Policy: camera=(), microphone=(), geolocation=()`: Restricción estricta de APIs del hardware en el navegador.
2. **Accesibilidad Universal (WCAG 2.2 Nivel AA)**:
   - Enlace de salto rápido al contenido `.skip-link` visible al enfocar hacia `#contenido`.
   - Anillos de foco de alto contraste `:focus-visible` (3px outline con offset).
   - Zonas dinámicas `aria-live="polite"` en el reloj sincronizado y avisos de puja.
   - Respeto a `@media (prefers-reduced-motion: reduce)` para usuarios sensibles al movimiento.
   - Ratios de contraste de color $\ge 4.5:1$ en texto y $\ge 3:1$ en controles UI interactivos.
3. **Metadatos y SEO**:
   - Títulos, descripciones, OpenGraph y Twitter Cards completas en el layout raíz para indexación y compartición en redes sociales.
4. **Pruebas Automatizadas de Calidad**:
   - Suite `tests/project/quality-audit.test.ts` con 4 pruebas automatizadas verificando metadatos, seguridad en `vercel.json`, variables de entorno y estilos de accesibilidad.

---

## 3. Guía Paso a Paso para el Despliegue en Vercel

Para desplegar este repositorio en vivo en la nube de Vercel:

### Paso 1: Conectar el Repositorio en Vercel
1. Ingresa a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Add New..."** $\rightarrow$ **"Project"**.
3. Selecciona el repositorio: `wilmerjosevegaacevedo-max/41-subastas-en-linea`.
4. Deja el Framework Preset como **Next.js**.

### Paso 2: Configurar las Variables de Entorno en Vercel
En la sección **"Environment Variables"** del panel de configuración de Vercel, agrega las 11 variables requeridas (extraídas de `.env.example`):

| Variable | Descripción / Valor |
|---|---|
| `APP_ORIGIN` | URL asignada por Vercel (ej: `https://41-subastas-en-linea.vercel.app`) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | API Key de Firebase del proyecto del estudiante |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth domain (ej: `proyecto.firebaseapp.com`) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ID de proyecto Firebase |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`| Bucket de Storage Firebase |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID de mensajería |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | App ID de Firebase |
| `FIREBASE_PROJECT_ID` | ID de proyecto Firebase Admin |
| `FIREBASE_CLIENT_EMAIL` | Correo de la cuenta de servicio de Firebase Admin |
| `FIREBASE_PRIVATE_KEY` | Clave privada RSA de la cuenta de servicio (con saltos `\n`) |
| `BLOB_READ_WRITE_TOKEN` | Token de lectura/escritura de Vercel Blob (se autogenera al crear el Blob Store en Vercel) |

### Paso 3: Despliegue y Validación
1. Haz clic en **"Deploy"**. Vercel ejecutará automáticamente `npm run check:full`, compilará las 12 páginas estáticas y los 7 endpoints dinámicos.
2. Una vez finalizado, abre la URL pública de producción y ejecuta una auditoría de **Lighthouse** en Chrome DevTools (o PageSpeed Insights):
   - Rendimiento: $\ge 90$
   - Accesibilidad: $\ge 95$
   - Mejores Prácticas: $\ge 95$
   - SEO: $\ge 95$

---

## 4. Estado de Calidad Final

- **Formateo:** `biome format` comprobó 92 archivos sin fallas.
- **Linting:** `eslint` pasó con **0 errores y 0 warnings**.
- **Tipado:** `next typegen && tsc --noEmit` completado al 100%.
- **Pruebas en Vitest:** **134/134 pruebas en verde** en 18 archivos de prueba sin servicios de red externos.
- **Compilación de Producción:** `next build` (Turbopack) generó con éxito 12 rutas estáticas y 7 endpoints API.
- **Cumplimiento de Reglas del Curso:**
  - Cero `any` y cero `unknown`.
  - Cero operadores ternarios (`no-ternary`).
  - snake_case en todos los contratos JSON.
  - Inyección de tiempo en la lógica de negocio.
  - Zonas prohibidas (`.env*`, `.git/`, `data/`, `secrets/`) 100% protegidas y no expuestas.
