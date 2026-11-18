# Handoff · F12 Registro de nuevos usuarios y autenticación por credenciales

**Fecha:** 2026-11-17  
**Estado:** Terminada y verificada  
**Pruebas:** 156/156 pasando en verde  

---

## 1. Resumen de Cambios

1. **Contratos Zod (`app/features/accounts/schema.ts`):**
   - Se añadió `RegisterUserInputSchema` con validación estricta de `nombre`, `email`, `password` (mínimo 6 caracteres) y `rol` (`COMPRADOR` o `VENDEDOR`).
   - Se amplió `CreateSessionInputSchema` para aceptar `email` y `password` en login directo además de `demo_uid` e `id_token`.
2. **Capa de Persistencia y Repositorio (`app/features/accounts/server/`):**
   - Se actualizó `AccountRecord` para almacenar `password_hash` derivado criptográficamente con SHA-256 (`node:crypto`).
   - Soporte en `MemoryAccountRepository` y `FirestoreAccountRepository` para persistir contraseñas seguras y buscar usuarios por correo.
3. **Servicio de Cuentas (`account-service.ts`):**
   - Implementado `register()`: valida correo único (`CONFLICT` 409 si ya existe), genera `uid` único (`user-<uuid>`), almacena el usuario con hash y emite la cookie de sesión HttpOnly (`user-token:<uid>`).
   - Implementado login con credenciales en `createSession()`: valida correo y contraseña (`UNAUTHENTICATED` 401 si no coinciden) y emite la sesión.
   - Actualizado `verify()` para reconocer y validar tokens `user-token:<uid>` de usuarios registrados.
4. **Endpoints REST:**
   - Creado `POST /api/auth/register`: procesa el registro, valida con Zod y devuelve `201 Created` con la cabecera `Set-Cookie` HttpOnly.
   - `POST /api/auth/session`: soporta inicio de sesión tanto con cuentas demo como con credenciales reales (`email` y `password`).
5. **Interfaz de Usuario Accesible (`app/features/accounts/ui/login-form.tsx`):**
   - Sistema de pestañas accesible con roles WAI-ARIA (`tablist`, `tab`, `aria-selected`):
     - **Pestaña Iniciar Sesión:** acceso rápido con botones Demo ("Carlos" y "Valeria") y formulario de correo/contraseña.
     - **Pestaña Crear Cuenta:** formulario de registro con Nombre, Correo, Contraseña y Selector de Tipo de Cuenta (Comprador / Vendedor).
   - Componentes divididos sin operadores ternarios (`no-ternary`) y con menos de 100 líneas por función (`max-lines-per-function`).
6. **Pruebas Automatizadas (`app/features/accounts/tests/registration-credentials.test.ts`):**
   - 6 pruebas nuevas verificando registro exitoso, rechazo de correo duplicado, login con contraseña correcta, rechazo de contraseña errónea, y respuestas HTTP de endpoints `/api/auth/register` y `/api/auth/session`.

---

## 2. Verificación de Calidad

- `npm run format:check`: 110 archivos verificados sin correcciones pendientes.
- `npm run lint`: Cero errores y cero advertencias (cumplimiento estricto de ESLint).
- `npm run typecheck`: Tipos TypeScript 100% correctos.
- `npm test`: 23 suites y 156 pruebas unitarias y de integración pasando en verde.
