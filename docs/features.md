# Lista de features (FDD)

Proyecto: **41 · Subastas en línea con pujas y cuenta regresiva**.

## Áreas y Carpetas
- **Transversal**: `app/shared/`, `app/` (layouts, páginas base).
- **Subastas (`auctions`)**: `app/features/auctions/`.
- **Pujas (`bids`)**: `app/features/bids/`.
- **Cuentas y Sesión (`accounts`)**: `app/features/accounts/`.

## Features Planificadas

| Id | Feature | Quién | Hito |
| --- | --- | --- | --- |
| **F0** | Base del proyecto: errores HTTP, sesión, Firebase Admin, entorno y puertas de calidad | Sistema | Base |
| **F1** | Detalle de subasta con cuenta regresiva accesible y sincronizada con el servidor | Público | Hito 1 |
| **F2** | Formulario de puja con validación de incremento y estados de UI | Usuario | Hito 1 |
| **F3** | Catálogo de subastas activas (inicio con filtros y tarjetas responsivas) | Público | Hito 2 |
| **F4** | Publicar una nueva subasta con fotos, precio inicial y fecha de cierre | Vendedor | Hito 2 |
| **F5** | Historial de mis pujas y subastas ganadas | Comprador | Hito 2 |
| **F6** | API REST de subastas y persistencia en Firestore (CRUD por capas) | API / Sistema | Hito 3 |
| **F7** | Transacción concurrente de pujas y regla anti-francotirador (+1 min) | API / Sistema | Hito 3 |
| **F8** | Autenticación con Firebase Auth y cookie de sesión HttpOnly | Todos | Hito 4 |
| **F9** | Subida directa de fotos con Vercel Blob y cuotas seguras | Vendedor | Hito 4 |
| **F10** | Auditoría de calidad (Lighthouse >= 90/95, WCAG 2.2 AA) y despliegue Vercel | Sistema | Hito 4 |
