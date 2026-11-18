# F12 · Registro de nuevos usuarios y autenticación por credenciales

**Estado:** Aprobada  
**Fecha:** 2026-11-17  
**Hito:** Autenticación y Cuentas  
**Autor:** Antigravity & Estudiante

---

## 1. Propósito y Alcance

Permitir a cualquier visitante registrarse como un nuevo usuario en la plataforma (eligiendo su rol entre Comprador o Vendedor) e iniciar sesión mediante correo electrónico y contraseña, además de conservar el acceso rápido con cuentas demo.

Garantiza el cumplimiento estricto de las reglas del proyecto:
- **Regla 4:** Autorización y validación siempre en el servidor. La identidad sale de la sesión en cookie HttpOnly, nunca del cuerpo de la petición.
- **Regla de Contratos:** Cero `any` y cero `unknown`, validación estricta Zod y contratos de red en `snake_case`.
- **Accesibilidad:** Formulario con etiquetas semánticas, navegación por teclado y alertas accesibles para lectores de pantalla.

---

## 2. Contratos y Esquemas Zod (`app/features/accounts/schema.ts`)

### 2.1. Registro de Usuario (`RegisterUserInputSchema`)
```typescript
export const RegisterUserInputSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  rol: RoleSchema.default("COMPRADOR"),
});
```

### 2.2. Inicio de Sesión con Credenciales (`CreateSessionInputSchema` extendido)
```typescript
export const CreateSessionInputSchema = z.object({
  id_token: z.string().min(1).optional(),
  demo_uid: z.enum(["comprador-demo-01", "vendedor-demo-01"]).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
});
```

---

## 3. Endpoints REST (`snake_case`)

| Método | Ruta | Descripción | Respuesta Exitosa | Códigos de Error |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Crea un nuevo usuario y emite la cookie de sesión HttpOnly | `201 Created` + `AuthSessionResponse` + `Set-Cookie` | `400` (Datos inválidos)<br>`409` (Correo ya registrado) |
| `POST` | `/api/auth/session` | Inicia sesión con `demo_uid`, `id_token` o `email`/`password` y emite `Set-Cookie` | `200 OK` + `AuthSessionResponse` + `Set-Cookie` | `400` (Datos incompletos)<br>`401` (Credenciales incorrectas) |

---

## 4. Arquitectura y Reglas de Negocio

1. **Persistencia de Credenciales (`AccountRepository`):**
   - Se almacena el hash de la contraseña utilizando `node:crypto` (`scryptSync` o derivación criptográfica segura con salt) para evitar contraseñas en texto plano.
   - Tanto `MemoryAccountRepository` como `FirestoreAccountRepository` soportan la persistencia y consulta por email y contraseña hash.
2. **Validación de Unicidad:**
   - Si un usuario intenta registrarse con un correo ya existente, se lanza un `DomainError("CONFLICT", "El correo ya está registrado")`.
3. **Generación de Sesión:**
   - Para usuarios registrados localmente, se genera un token de sesión seguro prefijado `user-token:<uid>` firmado/validable por `AccountService.verify()`, emitiendo la cookie de sesión HttpOnly.
4. **UI Accesible (`app/features/accounts/ui/login-form.tsx`):**
   - Interfaz con dos pestañas accesibles: *"Iniciar Sesión"* y *"Crear Cuenta"*.
   - Selector visual y accesible de rol: *"Comprador (Quiero pujar)"* o *"Vendedor (Quiero subastar)"*.
   - Redirección automática tras el registro o inicio de sesión al destino solicitado (`?redirect=...`).

---

## 5. Criterios de Aceptación y Pruebas

- [x] Registro exitoso crea el usuario y emite `Set-Cookie` con cookie HttpOnly.
- [x] Registro rechaza correos duplicados con código HTTP 409 (`CONFLICT`).
- [x] Registro rechaza contraseñas menores a 6 caracteres o correos mal formados con 400 (`VALIDATION_ERROR`).
- [x] Login con credenciales válidas emite la cookie de sesión correctamente.
- [x] Login con contraseña incorrecta retorna 401 (`UNAUTHENTICATED`).
- [x] Los botones de cuentas demo siguen funcionando exactamente igual.
- [x] `npm run check` pasa al 100% (cero errores de lint, formato, tipos y todas las pruebas en verde).
