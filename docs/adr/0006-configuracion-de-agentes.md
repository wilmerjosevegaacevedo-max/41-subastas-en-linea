# ADR-0006 · Configuración y gobernanza de agentes de IA (Google Antigravity)

- **Estado:** Aceptada
- **Fecha:** 2026-11-12
- **Autor / Decisor:** Estudiante

## Contexto
El proyecto requiere diseñar y documentar la configuración del asistente de IA utilizado por el estudiante, estableciendo límites claros de seguridad, reglas de calidad y subagentes de desarrollo, cumpliendo con la Sección 15 del documento de requerimientos.

## Decisión
Se adopta **Google Antigravity** como el entorno de IA principal para el desarrollo del proyecto:

1. **Instrucciones Centrales:** Viven en `AGENTS.md` (cargado automáticamente por el entorno) y `GEMINI.md`.
2. **Restricciones de Seguridad:** La lógica del guard (`.agents/guard/rules.ts`) define las zonas prohibidas (`.env*`, `.git/`, `secrets/`, `data/`) y es verificada mediante pruebas unitarias en `tests/project/guard.test.ts`.
3. **División de Roles (Subagentes de Antigravity):**
   - *Coordinador General* (Orquestador).
   - *Especialista Frontend* (UI accesible, Tailwind, responsive).
   - *Especialista Backend* (Rutas, Servicios, Firestore Admin SDK).
   - *Inspector de Seguridad y Calidad* (ESLint, Zod, Vitest).
4. **Verificación Continua:** Todo código generado por la IA es auditado automáticamente mediante `npm run check`.

## Consecuencias
- Configuración limpia y adaptada a la herramienta de desarrollo real del estudiante.
- Trazabilidad y evidencia disponible en la carpeta `ia/`.
