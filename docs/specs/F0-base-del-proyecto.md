# F0 · Base del proyecto

- **Estado:** Aprobada
- **Rol(es):** Sistema
- **Contrato afectado:** `app/shared/schema.ts`

## Objetivo
El sistema proporciona las bases técnicas verificables para que las features de subastas puedan validar peticiones, identificar sesiones, conectarse a Firebase y probarse sin depender de la red.

## Reglas de negocio
1. Los errores de dominio se traducen a respuestas HTTP mediante una única función compartida: 400 validación, 401 sesión ausente o inválida, 403 origen o permiso denegado, 404 recurso inexistente, 409 conflicto o puja superada, 410 subasta cerrada o vencida, y 500 error inesperado.
2. El cuerpo de error tiene la forma `{ error: { code, message, details? } }`, con códigos `VALIDATION_ERROR`, `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `EXPIRED` e `INTERNAL_ERROR`. Los errores inesperados no exponen detalles internos ni trazas de ejecución.
3. En POST, PUT, PATCH y DELETE se exige `Origin` igual al valor válido de `APP_ORIGIN`; en desarrollo también se permiten explícitamente `http://localhost` y `http://127.0.0.1` con cualquier puerto. Un origen ausente o distinto se rechaza antes de ejecutar reglas de negocio. GET y HEAD no requieren esta comprobación.
4. La identidad de una petición autenticada se obtiene de la cookie `__Host-subastas_session` (o `subastas_session` en desarrollo), con atributo `HttpOnly`, `SameSite=Lax` y `Secure` en producción. Nunca se acepta identidad desde el cuerpo.
5. Las variables de entorno se validan al usarse y `npm run check:env` informa únicamente `PRESENTE`, `AUSENTE` o `FORMATO_INVALIDO`, nunca valores. Las variables son `APP_ORIGIN`, `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` y `BLOB_READ_WRITE_TOKEN`.
6. Las pruebas de F0 no realizan llamadas a servicios externos: Firebase y la sesión se sustituyen por implementaciones de prueba.

## Criterios de aceptación
- **Dado** un error de dominio conocido, **cuando** una ruta lo traduzca, **entonces** responde con el estado asignado y el cuerpo `{ error: { code, message } }`.
- **Dado** un error no reconocido, **cuando** se traduzca, **entonces** responde con estado 500 y no expone detalles internos.
- **Dado** un origen no permitido o ausente en una mutación, **cuando** llegue una petición, **entonces** se rechaza con 403 antes del servicio; en desarrollo, `localhost` y `127.0.0.1` son permitidos.
- **Dado** una sesión válida en la cookie de sesión, **cuando** el servidor la verifique, **entonces** devuelve `uid` y rol cuando exista, sin leer identidad del cuerpo.
- **Dado** una variable requerida ausente o con formato inválido, **cuando** se ejecute `npm run check:env`, **entonces** informa `AUSENTE` o `FORMATO_INVALIDO` sin mostrar valores.
- **Dado** un entorno de pruebas, **cuando** se ejecuten las pruebas de F0, **entonces** no se realiza ninguna llamada de red.
