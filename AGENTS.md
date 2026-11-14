# 41 · Subastas en línea con pujas y cuenta regresiva — Reglas para agentes

Proyecto del curso de Tendencias (desarrollo con agentes de IA). Next.js App Router + TypeScript + Tailwind CSS, Firebase (Authentication y Firestore vía Admin SDK) y Vercel Blob para fotos, Zod y Vitest. Se construye por **features** (FDD): la lista está en `docs/features.md` y por dónde vamos, en `docs/progreso.md` (léelo al empezar y actualízalo al cerrar cada feature).

## Comandos
- `npm run check` → formato + lint + tipos + pruebas (es la definición estricta de "terminado"; añade `npm run build` si tocaste UI o rutas; `npm run check:full` hace ambas).
- `npm run format` aplica el formato (Biome, solo formateador); `npm run lint` aplica las reglas de código y las fronteras de la arquitectura con **ESLint**.
- `npm test` · `npm run typecheck` · `npm run lint` · `npm run build`
- `npm run check:env` → verifica las variables de entorno sin mostrar sus valores.

## Arquitectura por features
`ruta o página → servicio → repositorio`. Las reglas de negocio viven **solo** en `app/features/<feature>/server/*-service.ts`. Las rutas validan con Zod y traducen errores; los repositorios solo guardan y consultan.
- `app/features/<feature>/schema.ts` — contrato Zod de la feature.
- `app/shared/schema.ts` — contrato común (roles, sesión, errores).
- `app/features/<feature>/server/` — servicios y repositorios (`repository.ts` puertos, `repository.memory.ts` para pruebas, `repository.firestore.ts` real).
- `app/features/<feature>/ui/` — componentes de React accesibles.
- Áreas del proyecto: `auctions` (subastas), `bids` (pujas y extensiones), `accounts` (usuarios y sesión).
- Una feature **no importa el `server/` de otra**: declara un puerto propio y se conecta en `app/features/container.ts` (raíz de composición). `app/shared/` nunca importa features. Las fronteras las vigila `npm run lint`.
- Todo el código vive en `app/` (no hay `src/`): rutas, páginas y estilos globales (`app/api/` = rutas HTTP) junto a `app/features/` y `app/shared/`.
- `app/shared/server/` — errores, HTTP, sesión, clientes de Firebase y Vercel Blob.
- `app/features/<feature>/tests/` — las pruebas de cada feature (Vitest); `app/shared/tests/` las de lo común. `tests/` es el punto de entrada: ayudantes compartidos (`tests/helpers/`) y pruebas del proyecto (`tests/project/`).
- `docs/specs/` — especificaciones formales. `docs/adr/` — decisiones de arquitectura. `docs/handoffs/` — notas de entrega.

## Reglas que no se negocian
1. **Sin especificación aprobada en `docs/specs/` no se implementa una feature.**
2. Zonas de archivos:
   - Backend = `app/features/*/server/**` + `app/features/container.ts` + `app/shared/server/**` + `app/api/**`.
   - Frontend = `app/features/*/ui/**` + `app/shared/ui/**` + rutas y páginas de `app/` (sin `api`, `features` ni `shared`).
   - Tests = `tests/**` + `app/features/*/tests/**` + `app/shared/tests/**`.
   - Security = solo lectura.
   - Orquestador = `app/features/*/schema.ts`, `app/shared/schema.ts` y `docs/**`.
3. Las pruebas se escriben desde la especificación, no desde el código; nunca se cambia una prueba para que pase.
4. Autorización y validación siempre en el servidor. La identidad sale de la sesión, nunca del cuerpo de la petición.
5. El tiempo se inyecta (`now: Date`); nada de `new Date()` dentro de la lógica de negocio ni de las funciones puras de cálculo de tiempo.
6. Zonas prohibidas: `.env*` (salvo `.env.example`), `data/`, `.git/` y `secrets/`. No las leas ni las listes por ninguna herramienta ni comando.

## Reglas de código (enforced por ESLint)
1. **Cero `any` y cero `unknown`**, escritos o implícitos (tampoco `z.unknown()` ni `z.any()`). Lo que llega sin tipo (`res.json()`, `req.json()`) se valida **en el mismo punto**: `Esquema.parse(await res.json())`. Para un `catch`, pasa el error a una función genérica `<T>(error: T)`.
2. **Sin operadores ternarios (`a ? b : c`)**: todo `if`/`else`/`for`/`while` lleva llaves obligatorias.
3. **Funciones de máximo 100 líneas de código**.
4. **Clases de máximo 10 funciones**.
5. **Nombres:** funciones y variables en `camelCase`; clases, interfaces y tipos en `PascalCase`.
6. **Peticiones y respuestas entre backend y frontend en `snake_case`** (`monto_centavos`, `creada_en`, `cierra_en`).

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->
