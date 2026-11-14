# F2 · Formulario de puja con validación y estados de UI

- **Estado:** Aprobada
- **Rol(es):** Usuario comprador (o visitante que propone una puja)
- **Contrato afectado:** `app/features/bids/schema.ts`

## Objetivo
Un usuario puede ingresar un monto en el formulario de la subasta, validarlo de inmediato en el cliente con Zod contra el incremento mínimo y enviarlo de forma directa, recibiendo retroalimentación accesible de sus estados (carga, éxito, error con cifra exacta y anuncio para lectores de pantalla).

## Reglas de negocio
1. **Regla de incremento mínimo:** Una puja propuesta es válida si y solo si:
   $$\text{montoPropuesto} \ge \text{pujaActual} + \text{incrementoMinimo}$$
   Los montos se manejan internamente en **centavos enteros positivos** (`snake_case`).
2. **Entrada de datos (Decisión de la persona):**
   - Campo de texto libre numérico (`<input type="number">`).
   - Sugiere automáticamente como valor base o placeholder el monto mínimo aceptable ($\text{pujaActual} + \text{incrementoMinimo}$).
3. **Flujo de envío (Decisión de la persona):**
   - Envío directo e inmediato al presionar el botón «Pujar».
   - Mientras se procesa la solicitud, el botón pasa a estado de carga: se deshabilita, muestra spinner accesible y el texto «Enviando puja...».
4. **Mensaje de error (Decisión de la persona):**
   - Si el monto no supera el incremento mínimo, muestra exactamente:
     `Tu puja debe ser de al menos $X` (donde `$X` es la cifra formateada en pesos colombianos).
5. **Bloqueo ante subasta cerrada:**
   - Si la subasta está finalizada (tiempo $\le 0$ o estado cerrada), el campo y el botón se deshabilitan por completo (`disabled`).
6. **Estados visuales obligatorios:**
   - **Reposo:** Input numérico listo con botón «Pujar».
   - **Carga:** Deshabilitado con indicador visual y accesible.
   - **Éxito:** Notificación visual verde «¡Tu puja de $X ha sido aceptada!» y actualización inmediata de la puja actual en pantalla.
   - **Error de validación:** Mensaje de error rojo en texto visible, enlazado al campo con `aria-describedby` y anunciado con `role="alert"`.
7. **Accesibilidad (WCAG 2.2 AA):**
   - Etiqueta `<label for="monto_puja">` asociada explícitamente.
   - El resultado de la puja se comunica a lectores de pantalla con `aria-live="polite"`.
   - Compatible 100% con navegación por teclado.

## Entradas y salidas
| Entrada | Tipo / restricción |
| --- | --- |
| `subasta_id` | Texto identificador de la subasta |
| `monto_centavos` | Entero positivo en centavos |

Salida exitosa:
- Actualización de la puja más alta en la ficha del producto y anuncio de éxito.

Errores esperados:
- `VALIDATION_ERROR` (400) → Si el monto es menor al mínimo requerido o inválido.
- `EXPIRED` (410) → Si la subasta ha finalizado.

## Autorización
- Modo demostración (Hito 1): Abierto para validación en cliente.

## Criterios de aceptación
- **Dado** una subasta con puja actual de $150.000 e incremento de $10.000, **cuando** el usuario intenta pujar $155.000, **entonces** el formulario muestra el error exacto: *"Tu puja debe ser de al menos $160.000"*.
- **Dado** la misma subasta, **cuando** el usuario ingresa $160.000 y presiona «Pujar», **entonces** el botón pasa a «Enviando puja...», se registra la puja y la interfaz anuncia el éxito actualizando la puja actual a $160.000.
- **Dado** una subasta con tiempo agotado, **cuando** el usuario ve la página, **entonces** el formulario de puja está completamente deshabilitado.

## Bordes
- Monto exactamente igual al mínimo ($\text{pujaActual} + \text{incrementoMinimo}$) → Válido.
- Monto un centavo por debajo del mínimo → Rechazado.
- Valores vacíos, negativos, con decimales o no numéricos → Rechazados por Zod.

## Preguntas abiertas
1. **¿Cómo prefiere que el usuario ingrese el monto en el formulario de puja?**
   - *Respuesta de la persona:* Campo de texto libre numérico con el monto mínimo ya sugerido como placeholder/valor base.
2. **Al presionar el botón de pujar, ¿prefiere envío directo o confirmación previa?**
   - *Respuesta de la persona:* Envío directo al presionar «Pujar» (con estado de carga instantáneo).
3. **¿Qué mensaje exacto de error debe mostrarse si el monto no supera el incremento mínimo?**
   - *Respuesta de la persona:* «Tu puja debe ser de al menos $X» (especificando la cifra exacta).
