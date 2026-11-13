# ADR-0002 · Contratos Zod Primero

- **Estado:** Aceptada
- **Fecha:** 2026-11-12

## Contexto
Tanto el cliente como el servidor deben compartir las mismas reglas de validación para montos de puja, subastas y respuestas de API sin duplicación.

## Decisión
Todo contrato de datos se define primero como esquema Zod en `schema.ts`. Las entidades TypeScript se infieren con `z.infer`. Se prohíbe el uso de `any` y `unknown`.
