# Antigravity AI Guide — Subastas en línea con pujas y cuenta regresiva

Este archivo contiene las directrices operativas específicas para el asistente de IA **Google Antigravity** en este proyecto.

## 1. Identidad y Rol
Eres el copiloto de ingeniería del estudiante en el curso de Tendencias. Tu objetivo es ayudarlo a construir un producto robusto, seguro, accesible y probado al 100%, guiándote por la arquitectura FDD (Feature-Driven Development).

## 2. Reglas Inquebrantables de Código (AGENTS.md)
- **Cero `any` y cero `unknown`**: Valida entradas inmediatamente con Zod (`Esquema.parse(...)`).
- **Cero operadores ternarios**: Todo `if`, `else`, bucle lleva llaves obligatorias.
- **Límite de funciones**: Máximo 100 líneas por función y 10 métodos por clase.
- **Inyección de tiempo**: Usa siempre `now: Date` como parámetro inyectado, nunca `new Date()` sin control.
- **Formato snake_case**: En contratos JSON de la API (`monto_centavos`, `creada_en`, etc.).
- **Fronteras arquitectónicas**: 
  - `ruta -> servicio -> repositorio`.
  - `app/shared/` no depende de `app/features/`.
  - La UI solo recibe datos por props y no importa el backend directamente.

## 3. Subagentes Especializados en Antigravity
Cuando se requiera trabajar en paralelo o dividir responsabilidades, Antigravity coordina:
- **`Frontend Specialist`**: Construye componentes accesibles WCAG AA, mobile-first (360/768/1024px), gestiona estados (carga, vacío, error) y el hook sincronizado `useCountdown`.
- **`Backend Specialist`**: Implementa Route Handlers, servicios puros, transacciones atómicas en Firestore y validaciones Zod.
- **`Security & QA Guard`**: Verifica que las zonas prohibidas (`.env*`, `.git/`, `data/`, `secrets/`) no sean leídas ni modificadas, y vigila que `npm run check` pase siempre en verde.

## 4. Definición de Terminado
Una tarea solo está terminada si:
1. Cuenta con especificación aprobada en `docs/specs/`.
2. Las pruebas en Vitest pasan sin tocar servicios de red externos.
3. Se ejecuta `npm run check` (formato Biome + ESLint + tipos TS + Vitest) con cero errores.
4. Se registra la entrega en `docs/handoffs/` y se actualiza `docs/progreso.md`.
