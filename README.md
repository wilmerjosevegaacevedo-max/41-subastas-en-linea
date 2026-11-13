# 41 · Subastas en línea con pujas y cuenta regresiva

Proyecto del curso de Tendencias (desarrollo con agentes de IA). Plataforma de subastas con pujas en tiempo casi real, cuenta regresiva accesible y cierre automático con anti-francotirador, desarrollada bajo metodología FDD (Feature-Driven Development) y dirigida por el estudiante mediante **Google Antigravity**.

Stack: Next.js (App Router), React 19, TypeScript, Tailwind CSS, Zod, Firebase (Auth y Firestore vía Admin SDK), Vercel Blob y Vitest.

## Instrucciones y Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo local en `http://localhost:3000` |
| `npm run check` | Formato (Biome) + Lint (ESLint) + Tipos (TypeScript) + Pruebas (Vitest) |
| `npm run check:full` | Ejecuta `npm run check` y `npm run build` |
| `npm run check:env` | Verifica presencia y formato de variables de entorno sin exponer secretos |
| `npm run format` | Aplica el formato automático con Biome |
| `npm run lint` | Aplica las reglas estrictas de arquitectura y sintaxis con ESLint |
| `npm test` | Ejecuta todas las pruebas unitarias con Vitest |

## Estructura del Proyecto

```text
AGENTS.md, GEMINI.md     Reglas y directrices para Google Antigravity (lo primero que lee)
docs/                    features.md (lista FDD), progreso.md, architecture.md, frontend-rules.md,
                         adr/ (decisiones), specs/ (especificaciones por feature), handoffs/
app/                     Todo el código de la aplicación (rutas, páginas, features y shared)
  shared/                Lógica transversal: errores de dominio, cliente HTTP, sesión, seguridad CSRF
  features/              Módulos de negocio (auctions, bids, accounts)
ia/                      Configuración y evidencias de IA (README.md, bitacora.md, guard de seguridad)
tests/                   Punto de entrada de pruebas del proyecto y ayudantes
```

## Gobernanza de IA (Sección 15)
El proyecto cuenta con un sistema de guardia (`.agents/guard/rules.ts`) probado en `tests/project/guard.test.ts` que previene el acceso de la IA a archivos sensibles (`.env*`, `.git/`, `data/`, `secrets/`).
