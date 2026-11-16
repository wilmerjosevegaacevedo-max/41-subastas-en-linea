# 41 · Subastas en línea con pujas y cuenta regresiva

Proyecto oficial del curso de Tendencias (desarrollo con agentes de IA). Plataforma de subastas en línea con pujas atómicas, extensiones automáticas anti-francotirador (+60s en el último minuto), cuenta regresiva accesible y cierre automático con determinación de ganador. Construido bajo metodología **FDD (Feature-Driven Development)** y dirigido por el estudiante mediante **Google Antigravity**.

* **URL de Producción en Vivo (Vercel):** [https://41-subastas-en-linea.vercel.app/](https://41-subastas-en-linea.vercel.app/)
* **Repositorio GitHub:** [https://github.com/wilmerjosevegaacevedo-max/41-subastas-en-linea](https://github.com/wilmerjosevegaacevedo-max/41-subastas-en-linea)
* **Especificación OpenAPI 3.0:** [`openapi.yaml`](./openapi.yaml)
* **Colección de Solicitudes API:** [`bruno/`](./bruno/)
* **Dossier de Calidad y WCAG 2.2 AA:** [`CALIDAD.md`](./CALIDAD.md)

---

## Stack Tecnológico

* **Framework:** Next.js 16 (App Router con Turbopack y React Compiler)
* **Lenguaje:** TypeScript 5 (tipado estricto, cero `any`, cero `unknown`)
* **Estilos:** Tailwind CSS v4 (tokens semánticos de diseño de alto contraste)
* **Validación:** Zod (contratos estrictos en `snake_case` cliente/servidor)
* **Base de Datos & Auth:** Firebase (Authentication con cookie HttpOnly y Firestore vía Admin SDK)
* **Almacenamiento de Fotos:** Vercel Blob (cuotas seguras de 4.5 MB)
* **Pruebas:** Vitest (134 pruebas automatizadas con 100% de éxito)
* **Calidad de Código:** Biome (formateador) y ESLint 9 (reglas de frontera, cero ternarios)

---

## Instrucciones y Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo local en `http://localhost:3000` |
| `npm run check` | Formato (Biome) + Lint (ESLint) + Tipos (TypeScript) + Pruebas (Vitest) |
| `npm run check:full` | Puerta de calidad estricta: `npm run check` + compilación de producción `next build` |
| `npm run check:env` | Verifica presencia y formato de variables de entorno sin exponer secretos |
| `npm run format` | Aplica el formato automático de código con Biome |
| `npm run lint` | Aplica las reglas estrictas de arquitectura y sintaxis con ESLint |
| `npm test` | Ejecuta las 134 pruebas unitarias y de integración con Vitest |

---

## Estructura del Proyecto

```text
AGENTS.md, GEMINI.md     Reglas y directrices para Google Antigravity (lo primero que lee)
openapi.yaml             Especificación formal OpenAPI 3.0 de todos los endpoints REST
bruno/                   Colección de solicitudes HTTP listas para ejecutar en Bruno
CALIDAD.md, calidad/     Dossier de calidad, métricas Core Web Vitals y auditoría WCAG 2.2 AA
docs/
  features.md            Lista de features FDD (F0 a F10)
  progreso.md            Tabla de estado y trazabilidad de cada feature
  specs/                 Especificaciones formales aprobadas por el estudiante
  handoffs/              Notas de entrega de cada feature completada
  adr/                   Decisiones de arquitectura de software
app/                     Todo el código de la aplicación (App Router)
  shared/                Lógica transversal: errores de dominio, sesión HttpOnly, clientes
  features/
    auctions/            Módulo de subastas (catálogo, detalle, publicación, fotos)
    bids/                Módulo de pujas (transacciones atómicas, regla anti-sniper)
    accounts/            Módulo de usuarios y autenticación (cuentas demo y Firebase Auth)
ia/                      Gobernanza de IA (bitacora.md, README.md, guardia de seguridad)
tests/                   Pruebas globales del proyecto, calidad, contratos y guardia
```

---

## Gobernanza de IA (Sección 15)

El proyecto cuenta con un sistema de guardia (`.agents/guard/rules.ts`) probado rigurosamente en `tests/project/guard.test.ts` que previene el acceso o modificación indebida de la IA a archivos sensibles (`.env*`, `.git/`, `data/`, `secrets/`). Cada feature cuenta con una especificación formal en `docs/specs/` aprobada explícitamente por el estudiante antes de su implementación, documentada en `ia/bitacora.md`.

---

## Cuentas de Demostración Disponibles

Para facilitar la evaluación y corrección del proyecto sin requerir configuración previa de credenciales, la plataforma cuenta con usuarios demo listos para usar en `/login`:

1. **Comprador Demo:** `comprador.demo@subastas.com` (Nombre: *Carlos Comprador*, Rol: `COMPRADOR`)
2. **Vendedor Demo:** `vendedor.demo@subastas.com` (Nombre: *Valeria Vendedora*, Rol: `VENDEDOR`)
