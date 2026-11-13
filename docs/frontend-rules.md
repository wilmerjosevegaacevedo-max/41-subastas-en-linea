# Reglas de Frontend y Accesibilidad

Obligatorias para el desarrollo de componentes en `app/**` y `app/features/*/ui/**`.

## 1. Diseño Responsivo Mobile-First (Tres Puntos de Control)

| Ancho | Prefijo Tailwind | Qué se espera |
| --- | --- | --- |
| **360 px** (base) | — | Una columna, controles apilados, navegación accesible |
| **768 px** | `md:` | Dos columnas donde ayude, formulario en dos columnas |
| **1024 px** | `lg:` | Rejilla de subastas de hasta tres columnas, layout completo |

- Sin desplazamiento horizontal desde 320 px hasta pantallas grandes (WCAG 1.4.10).
- Objetivos táctiles mínimos de **44 × 44 px** (`min-h-11 min-w-11`).
- Texto responsive con zoom al 200% sin pérdida de funcionalidad.

## 2. HTML Semántico y Accesibilidad (WCAG 2.2 AA)

1. Estructura semántica: `<header>`, `<nav aria-label="…">`, `<main id="contenido">`, `<footer>`.
2. Enlace accesible «Saltar al contenido» como primer elemento focable.
3. **Un solo `<h1>` por página** y jerarquía sin saltos (`h1 → h2 → h3`).
4. **`<div>` y `<span>` no llevan texto directamente**: se usan `<p>`, `<h1>`–`<h6>`, `<li>`, `<label>`, `<button>`, `<a>`, `<time>`.
5. Interactividad exclusiva en elementos nativos (`<button>`, `<a>`, `<input>`); **prohibido `<div onClick>`**.
6. Estados dinámicos de subasta (cambio de puja más alta, tiempo agotado) anunciados con `aria-live`.
7. Foco visible de 3 px en todos los elementos interactivos.
