# F11 · Plan de Correcciones y Cumplimiento Integral de la Rúbrica Oficial

**Estado:** Aprobada  
**Fecha:** 2026-11-16  
**Autor:** Antigravity & Estudiante  

---

## 1. Propósito y Alcance

Atender exhaustivamente el 100% de las observaciones realizadas en la primera revisión por el profesor, alineando el sistema con cada detalle literal del documento oficial de asignación (`martes_jueves/martes_jueves/41-subastas-en-linea.md`).

---

## 2. Requerimientos por Área

### 2.1. Funcionalidad y React (Secciones 5, 6 y 7)
1. **Endpoint `GET /api/subastas/:id/estado`**:
   - Devuelve `{ subasta_id, puja_actual_centavos, incremento_centavos, cierra_en, estado, ganador_uid, tiempo_servidor }`.
   - Implementa **cierre perezoso**: si `now >= new Date(cierra_en)` y la subasta está `activa`, se transiciona atómicamente a `cerrada` y se fija `ganador_uid`.
2. **Sondeo con Page Visibility API**:
   - Hook sincronizado en `/subastas/[id]` que sondea el estado cada 3-5 segundos.
   - Si `document.hidden === true` (evento `visibilitychange`), se pausa el sondeo; al volver, se actualiza inmediatamente.
   - Botón manual «Actualizar» como alternativa accesible si el sondeo falla.
3. **Notificaciones en Cliente (RF-06)**:
   - Aviso visual accesible con `role="status"` y `aria-live="polite"` cuando el postor es superado por otra puja o cuando el vendedor recibe una puja.
4. **Cierre Automático y Tarea de Respaldo (RF-04)**:
   - Endpoint `/api/cron/cerrar-subastas` para cerrar subastas expiradas por lote.
5. **Uso de `useOptimistic`**:
   - En `bid-form.tsx`, mostrar la puja propuesta inmediatamente y revertir si el servidor responde con error o 409.

### 2.2. API REST, Seguridad y Convenciones (Secciones 3, 9 y 16)
1. **Crear `proxy.ts`**:
   - Archivo en la raíz del proyecto para Next.js 16 que redirija a `/login?redirect=...` si falta la cookie `subastas_session`.
2. **Roles como Custom Claims y `auth_time`**:
   - En `session.ts`, verificar `auth_time` (inicio de sesión reciente < 5 días) y decodificar el custom claim `rol`.
3. **Seguridad HTTP**:
   - Límite de frecuencia con `429 Too Many Requests` para pujas repetidas en ventana corta de tiempo.
   - Encabezado `x-request-id` con UUID en cada respuesta.
   - Encabezado `Cache-Control: no-store` en rutas dinámicas y privadas.
   - Paginación por cursor (`cursor` y `siguiente_cursor`) en `GET /api/subastas`.
   - Content Security Policy (CSP) en `next.config.ts`.
4. **Mapeo Interno de Firestore en `camelCase`**:
   - Documentos de Firestore guardados en colecciones `subastas/{id}` y `subastas/{id}/pujas/{pid}` con campos en `camelCase` (`vendedorUid`, `pujaActualCentavos`, `cierraEn`, `ganadorUid`), manteniendo la API externa en `snake_case` según las reglas del proyecto.

### 2.3. Pruebas Automatizadas con React Testing Library (Sección 11)
1. **Dependencias:** Instalar `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom` y `jsdom`.
2. **Pruebas de Componentes (mínimo 3):**
   - `bid-form.test.tsx` (consultando por rol accesible y label, simulando envío y validación).
   - `auction-card.test.tsx` (verificando datos de tarjeta accesible).
   - `countdown-timer.test.tsx` (probando corrección de desfase temporal con relojes adelantados/atrasados).
3. **Cobertura $\ge 80\%$** configurada en Vitest.

### 2.4. Dossier de Calidad Real (Sección 14)
1. Carpeta `calidad/` con evidencias reales:
   - Capturas en 360px, 768px y 1024px.
   - Reportes estructurados de auditoría y pruebas de accesibilidad con `axe-core`.
2. Archivos `app/robots.ts` y `app/sitemap.ts`.

### 2.5. Gobernanza de IA (Sección 15)
1. Archivo `ia/PRUEBAS-CONTENCION.md` con las 10 pruebas de contención documentadas y sus evidencias.
2. Actualización de `ia/bitacora.md` documentando los 3 casos donde el estudiante corrigió/rechazó a la IA.
3. Configuración de Husky y workflow de CI en `.github/workflows/ci.yml`.

---

## 3. Criterios de Aceptación

1. `GET /api/subastas/:id/estado` responde en menos de 100ms con el estado y hora del servidor.
2. Si una subasta alcanza su `cierra_en`, se cierra automáticamente (cierre perezoso y cron).
3. La página de detalle sondea y respeta Page Visibility API (se detiene en pestaña oculta).
4. El formulario de puja usa `useOptimistic` con reversión ante fallos.
5. `proxy.ts` redirige peticiones no autenticadas a `/login`.
6. Las 3 pruebas de componentes con React Testing Library pasan en verde en Vitest.
7. Se mantiene `npm run check:full` con 0 errores de ESLint, 0 ternarios, cero `any` y tipos estrictos.

---

## 4. Estado de Aprobación
- [ ] Esperando aprobación explícita del estudiante en el chat con la frase:
  `Apruebo la especificación de F11`
