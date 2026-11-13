# Configuración y Gobernanza de IA — Google Antigravity

En este directorio se documenta y evidencia la configuración del asistente de IA para el proyecto **41 · Subastas en línea con pujas y cuenta regresiva**, cumpliendo con la Sección 15 del documento de requerimientos.

## 1. Asistente Utilizado
El asistente de ingeniería utilizado es **Google Antigravity**.

## 2. Componentes de la Configuración:
1. **Reglas de Instrucción y Calidad:** 
   - `AGENTS.md` (cargado de forma nativa por el entorno).
   - `GEMINI.md` (instrucciones y división de subagentes).
2. **Guardia de Seguridad (`.agents/guard/rules.ts`):**
   - Bloquea lectura o escritura de archivos sensibles: `.env*` (excepto `.env.example`), `.git/`, `data/`, `secrets/`.
   - Prohíbe la ejecución de comandos que apunten a rutas protegidas.
3. **Pruebas Automatizadas de la Guardia:**
   - Ubicadas en `tests/project/guard.test.ts`.
   - Verifican mediante Vitest que cualquier intento de acceso a rutas prohibidas sea rechazado.
4. **Subagentes Especializados:**
   - Frontend (UI accesible WCAG AA, responsive, estados).
   - Backend (Route Handlers, Servicios, Repositorios Firestore).
   - QA & Seguridad (Verificación estricta de tipos, lint y pruebas).
5. **Bitácora de IA (`ia/bitacora.md`):**
   - Registro de interacciones, decisiones y validaciones realizadas con asistencia de IA.
