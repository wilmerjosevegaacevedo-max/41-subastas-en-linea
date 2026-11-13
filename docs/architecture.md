# Arquitectura del Proyecto

Organización **por feature** (FDD): el código se agrupa por lo que el sistema de subastas hace, no por tipo de archivo. Cada área de negocio de `docs/features.md` es una carpeta en `app/features/`.

## Mapa del Proyecto

Todo el código vive en `app/` (no hay `src/`). El alias `@/…` apunta a `app/`; `@/tests/…` apunta a `tests/`.

```text
app/                     Next.js App Router
  api/…/route.ts           Rutas HTTP: validan con Zod, llaman al servicio, traducen errores
  page.tsx, subastas/      Páginas: leen la petición y componen componentes de `ui/`
  globals.css, layout.tsx   Tokens de diseño accesibles, estilos globales y layout raíz
  features/              Una carpeta por área de negocio
    container.ts           Raíz de composición: conecta las features entre sí
    <feature>/
      schema.ts            Contrato Zod de la feature
      server/              Reglas de negocio y persistencia
        *-service.ts       Servicios (reglas de negocio puras)
        repository.ts      Puertos (interfaces TypeScript)
        repository.memory.ts Implementación en memoria (para pruebas sin red)
        repository.firestore.ts Implementación real con Firebase Admin SDK
      ui/                  Componentes React de la feature (accesibles WCAG AA)
      tests/               Pruebas unitarias de la feature (Vitest)
  shared/                Lógica transversal compartida
    schema.ts              Contrato común (errores, roles, sesión)
    server/                Errores, HTTP, sesión HttpOnly, validación de variables de entorno
    ui/                    Componentes visuales comunes
    tests/                 Pruebas de la capa transversal
```

## Flujo de una Petición

```text
Navegador ──▶ Ruta o Página ──▶ Servicio (features/x/server) ──▶ Repositorio ──▶ Firestore / Blob
              valida (Zod)      reglas de negocio                solo guarda
              traduce errores   (pujas, anti-sniper)             y consulta
```

## Fronteras Arquitectónicas (ESLint)
1. `app/shared/` nunca importa nada de `app/features/`.
2. Las rutas no importan los repositorios directamente; acceden a través de servicios.
3. Los componentes de `ui/` reciben datos a través de props y no importan lógica de servidor (`server/`).
4. Cero `any` y cero `unknown`: todo dato externo se valida inmediatamente con esquemas Zod.
