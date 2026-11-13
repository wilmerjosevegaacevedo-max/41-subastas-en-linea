# Handoff · F0 · Base del proyecto

- **Fecha:** 2026-11-12
- **Estado:** Terminada y verificada
- **Commit:** `96349fe`

## Qué se construyó
1. Infraestructura transversal de errores de dominio tipados y traducción a respuestas HTTP (`app/shared/server/errors.ts`, `app/shared/server/http.ts`).
2. Protección contra CSRF comprobando cabecera `Origin` (`app/shared/server/origin.ts`).
3. Manejo de cookie de sesión segura con `HttpOnly`, `SameSite=Lax` y `Secure` (`app/shared/server/session.ts`).
4. Verificación de variables de entorno sin exponer secretos (`app/shared/server/env.ts`, `scripts/check-env.ts`).
5. Puertas de calidad con Biome y ESLint estricto (cero `any`, cero `unknown`, sin operadores ternarios).
6. Guardia de seguridad de IA en `.agents/guard/rules.ts` con pruebas en `tests/project/guard.test.ts`.

## Verificación
- `npm run check`: 100% verde (Biome + ESLint + TypeScript + Vitest con 13 pruebas unitarias).
