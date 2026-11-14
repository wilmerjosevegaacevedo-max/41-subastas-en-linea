# F8 · Autenticación con Firebase Auth y cookie de sesión HttpOnly

**Estado:** Aprobada  
**Fecha:** 2026-11-14  
**Hito:** Hito 4 (Semana 15 - 15%)  
**Autor:** Antigravity & Estudiante

---

## 1. Propósito y Alcance

Implementar el sistema de autenticación de extremo a extremo basado en Firebase Authentication (cliente) y Firebase Admin SDK (servidor), gestionando el ciclo de vida de la sesión mediante cookies seguras **HttpOnly**, `SameSite=Lax` y prefijo `__Host-` en producción. 

Esta feature garantiza el cumplimiento de la **Regla 4** del curso:
> *"Autorización y validación siempre en el servidor. La identidad sale de la sesión, nunca del cuerpo de la petición."*

---

## 2. Flujo de Autenticación y Manejo de Sesión

```
[Navegador / Cliente]
      │ 1. Usuario ingresa credenciales (Email/Password o Google)
      ▼
[Firebase Auth Client SDK]
      │ 2. Retorna idToken JWT al cliente
      ▼
[POST /api/auth/session]
      │ 3. Envía { id_token } en el body
      ▼
[Firebase Admin SDK (Servidor)]
      │ 4. Verifica idToken con admin.auth().verifyIdToken(idToken)
      │ 5. Genera cookie de sesión segura (o token verificado)
      ▼
[Respuesta con Set-Cookie]
      │ 6. Cookie HttpOnly, Secure, SameSite=Lax (duración 5 días)
      ▼
[Navegador]
      │ 7. La cookie se envía automáticamente en cada petición subsecuente
```

---

## 3. Endpoints REST de Autenticación (`snake_case`)

| Método | Ruta | Descripción | Autenticación |
|---|---|---|---|
| `POST` | `/api/auth/session` | Canjea un `id_token` de Firebase por una cookie de sesión HttpOnly | Pública |
| `GET` | `/api/auth/me` | Retorna los datos de la identidad actual (`uid`, `email`, `rol`) | Requiere cookie |
| `DELETE` | `/api/auth/session` | Cierra la sesión revocando/eliminando la cookie (`Max-Age=0`) | Pública |

### 3.1. Esquemas Zod (`app/features/accounts/schema.ts`)

- `CreateSessionInputSchema`: `{ id_token: z.string().min(1) }`
- `AccountUserSchema`:
  ```typescript
  z.object({
    uid: z.string().min(1),
    email: z.string().email(),
    rol: z.enum(["comprador", "vendedor", "administrador"]),
    nombre: z.string().min(1),
  });
  ```
- `AuthSessionResponseSchema`:
  ```typescript
  z.object({
    usuario: AccountUserSchema,
  });
  ```
- `DeleteSessionResponseSchema`:
  ```typescript
  z.object({
    mensaje: z.string(),
  });
  ```

---

## 4. UI y Experiencia de Usuario (`app/login/` y Navbar)

1. **Página accesible de Login (`/login`)**:
   - Formulario accesible con validación en tiempo real (email y contraseña).
   - **Acceso rápido con Cuentas Demo:** Botones de un clic ("Entrar como Comprador Demo", "Entrar como Vendedor Demo") que generan la cookie de sesión HttpOnly real para facilitar la evaluación del profesor y las pruebas locales.
   - Redirección inteligente al origen tras iniciar sesión (`?redirect=/vender` o `?redirect=/mis-pujas`).
2. **Componente de Sesión en Header (`app/layout.tsx` / `Navbar`)**:
   - Si no está autenticado: botones "Iniciar Sesión" y "Registrarse".
   - Si está autenticado: badge con avatar/nombre del usuario, rol distintivo, enlace directo a `/mis-pujas` y botón "Cerrar Sesión".

---

## 5. Integración con Subastas y Pujas

- **Permisos polivalentes:** Cualquier usuario autenticado tiene permisos tanto para participar en pujas como para publicar nuevas subastas en `/vender`.
- `POST /api/subastas`: Extrae la identidad del creador de la sesión mediante `readSession(req, verifier)`.
- `POST /api/subastas/[id]/pujas`: Extrae la identidad del postor de la sesión mediante `readSession(req, verifier)`.
- Se mantiene compatibilidad con fallback para pruebas unitarias de Vitest mediante inyección de dependencias (`MockSessionVerifier`).

---

## 6. Criterios de Aceptación

1. **Seguridad de Cookies:** Las cookies de sesión son estrictamente `HttpOnly`, `SameSite=Lax`, con tiempo de vida de 5 días, y usan prefijo `__Host-` en entornos de producción.
2. **Cierre de sesión:** `DELETE /api/auth/session` limpia la cookie inmediatamente en el navegador.
3. **Verificación en el Servidor:** Las rutas protegidas validan la sesión en el servidor y rechazan con `401 UNAUTHENTICATED` si la cookie es inválida o inexistente.
4. **Calidad de código:** Cero `any`, cero `unknown`, cero operadores ternarios, nombres snake_case en JSON, y 100% de pruebas en Vitest pasando sin red externa.
