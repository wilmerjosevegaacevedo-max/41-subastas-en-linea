# ADR-0001 · Arquitectura por features y capas

- **Estado:** Aceptada
- **Fecha:** 2026-11-12

## Contexto
El proyecto requiere una estructura modular y escalable para la lógica de subastas, pujas, cuentas y componentes compartidos.

## Decisión
Se adopta FDD (Feature-Driven Development) con división en `app/features/<feature>/` (`schema.ts`, `server/`, `ui/`, `tests/`) y `app/shared/` para utilidades transversales (errores, HTTP, sesión, Firebase). Las rutas en `app/` consumen la lógica a través del contenedor o servicios tipados.
