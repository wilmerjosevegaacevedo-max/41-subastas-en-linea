# Handoff · F8: Autenticación con Firebase Auth y cookie de sesión HttpOnly

**Fecha:** 2026-11-14  
**Hito:** Hito 4 (Semana 15 - 15%)  
**Estado:** Terminada y Verificada  
**Commit:** Pendiente de push a `main`

---

## 1. Resumen de la Entrega

Se implementó el sistema integral de autenticación y gestión de sesión segura con cookies **HttpOnly**, `SameSite=Lax`, duración de 5 días y soporte para el prefijo de seguridad `__Host-` en producción, cumpliendo estrictamente con la **Regla 4** del curso:
> *"Autorización y validación siempre en el servidor. La identidad sale de la sesión, nunca del cuerpo de la petición."*

### Aspectos Destacados
1. **Área `accounts` (`app/features/accounts/`)**:
   - `schema.ts`: Contratos Zod en estricto `snake_case` (`AccountUserSchema`, `CreateSessionInputSchema`, `AuthSessionResponseSchema`, `DeleteSessionResponseSchema`).
   - `server/account-service.ts`: Servicio desacoplado que implementa `SessionVerifier`, canjeando tokens o credenciales de Firebase por cookies seguras, y validando sesiones demo para pruebas sin red.
   - `server/repository.memory.ts` y `server/repository.firestore.ts`: Repositorios con persistencia real en Firestore y fallback en memoria.
2. **Endpoints REST de Autenticación**:
   - `POST /api/auth/session`: Canjea credenciales o `demo_uid` por una cookie HttpOnly con la directiva `Set-Cookie`.
   - `GET /api/auth/me`: Retorna los datos de la identidad actual (`uid`, `email`, `rol`) leyendo la cookie de sesión del servidor (401 si no hay sesión).
   - `DELETE /api/auth/session`: Cierra la sesión revocando la cookie con `Max-Age=0`.
3. **Página de Login y UI Accesible**:
   - `app/login/page.tsx`: Página accesible con envoltorio `<Suspense>` para `useSearchParams()`, preservando la pre-renderización estática.
   - `app/features/accounts/ui/login-form.tsx`: Formulario accesible con botones de acceso rápido para "Comprador Demo" (`comprador-demo-01`) y "Vendedor Demo" (`vendedor-demo-01`), facilitando la calificación del profesor.
   - `app/features/accounts/ui/session-status-badge.tsx`: Indicador de estado en el header (`app/layout.tsx`) con nombre de usuario, badge de rol y botón de "Cerrar Sesión".
4. **Integración con Subastas y Pujas**:
   - `POST /api/subastas` y `POST /api/subastas/[id]/pujas` extraen obligatoriamente la identidad de la sesión vía `readSession(req, verifier)`, eliminando cualquier identidad enviada en el cuerpo de la petición.

---

## 2. Archivos Creados y Modificados

### Creados
- `app/features/accounts/schema.ts`
- `app/features/accounts/server/repository.ts`
- `app/features/accounts/server/repository.memory.ts`
- `app/features/accounts/server/repository.firestore.ts`
- `app/features/accounts/server/account-service.ts`
- `app/features/accounts/ui/login-form.tsx`
- `app/features/accounts/ui/session-status-badge.tsx`
- `app/features/accounts/tests/session-auth.test.ts`
- `app/features/accounts/tests/firestore-account-repository.test.ts`
- `app/api/auth/session/route.ts`
- `app/api/auth/me/route.ts`
- `app/login/page.tsx`
- `docs/specs/F8-autenticacion-sesion.md`
- `docs/handoffs/F8-autenticacion-sesion.md`

### Modificados
- `app/shared/server/firebase-admin.ts`: Agregado `getFirebaseAuth()` para verificación e integración con Firebase Admin.
- `app/shared/server/session.ts`: Decodificación segura de tokens con `decodeURIComponent`.
- `app/features/container.ts`: Registrado `accountService` en el contenedor de dependencias.
- `app/layout.tsx`: Integrado `SessionStatusBadge` en la barra de navegación.
- `app/api/subastas/route.ts`: Integrado `readSession` para autorizar la creación de subastas.
- `app/api/subastas/[id]/pujas/route.ts`: Integrado `readSession` para autorizar pujas.
- `docs/progreso.md`: Actualizado estado de F8 a `Terminada`.
- `ia/bitacora.md`: Registrada la aprobación e implementación de F8.

---

## 3. Verificación de Calidad

- **Formateo:** `biome format` comprobó 87 archivos sin errores.
- **Linting:** `eslint` pasó con **0 errores y 0 warnings**.
- **Tipado:** `next typegen && tsc --noEmit` completado al 100%.
- **Pruebas:** **107/107 pruebas pasando en verde en Vitest** (0 dependencias de red externas).
- **Build de producción:** `next build` (Turbopack) generó con éxito 11 páginas y 6 rutas API dinámicas.
- **Reglas del curso:**
  - Cero `any` y cero `unknown`.
  - Cero operadores ternarios (`no-ternary`).
  - snake_case en todos los contratos JSON.
  - Identidad de usuario extraída exclusivamente de la sesión del servidor (Regla 4).
