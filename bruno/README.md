# Colección de API REST con Bruno

Esta carpeta contiene la colección completa de solicitudes HTTP para probar todos los endpoints de **41 · Subastas en línea con pujas y cuenta regresiva**.

## Cómo usarla

### Opción 1: Aplicación de escritorio Bruno
1. Descarga e instala [Bruno](https://www.usebruno.com/).
2. Selecciona **Open Collection** y abre la carpeta `bruno/` del proyecto.
3. En la esquina superior derecha, selecciona el entorno:
   - **Producción Vercel** (apunta a `https://41-subastas-en-linea.vercel.app`)
   - **Local** (apunta a `http://localhost:3000`)
4. Ejecuta cualquiera de las solicitudes organizadas en las carpetas `Subastas`, `Pujas`, `Autenticacion` y `Fotos`.

### Opción 2: Bruno CLI
```bash
npx @usebruno/cli run bruno --env "Produccion Vercel"
```

## Estructura de solicitudes

- **Subastas:**
  - `Listar subastas activas` (`GET /api/subastas?estado=activa&limite=20`)
  - `Buscar subastas por texto` (`GET /api/subastas?q=reloj`)
  - `Obtener detalle de subasta` (`GET /api/subastas/:id`)
  - `Publicar nueva subasta` (`POST /api/subastas`)
  - `Actualizar subasta` (`PATCH /api/subastas/:id`)
  - `Cancelar subasta` (`DELETE /api/subastas/:id`)
  - `Hora del servidor` (`GET /api/subastas/server-time`)
- **Pujas:**
  - `Realizar puja atómica` (`POST /api/subastas/:id/pujas`) — Concurrencia atómica y anti-sniper (+60s en el último minuto)
- **Autenticación:**
  - `Iniciar sesión Comprador Demo` (`POST /api/auth/session` con `demo_uid`)
  - `Iniciar sesión Vendedor Demo` (`POST /api/auth/session` con `demo_uid`)
  - `Consultar mi sesión (me)` (`GET /api/auth/me` vía cookie HttpOnly)
  - `Cerrar sesión` (`DELETE /api/auth/session`)
- **Fotos:**
  - `Subir foto a Vercel Blob` (`POST /api/fotos/upload` con `multipart/form-data`)
