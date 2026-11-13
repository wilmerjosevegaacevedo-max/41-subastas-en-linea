# ADR-0005 · Convenciones de código y calidad

- **Estado:** Aceptada
- **Fecha:** 2026-11-12

## Contexto
Se requiere código limpio, seguro y fácilmente mantenible.

## Decisión
1. Cero `any` y cero `unknown`.
2. Sin operadores ternarios: todo control de flujo lleva llaves explícitas.
3. Funciones de máx. 100 líneas y clases de máx. 10 métodos.
4. Identificadores en inglés / dominio y mensajes en español.
5. Inyección del tiempo (`now: Date`), evitando `new Date()` sin control.
