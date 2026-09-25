# Landing — Tienda la 635

Página de presentación de Tienda la 635 (plataforma Cartify): Tiqui —la asistente de voz—, tienda,
beneficios, impresiones, app móvil y panel administrativo, con demos que se pueden tocar.

## Correr

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

## Publicar

```bash
npm run build
```

Sale todo en `dist/`. En Vercel basta con importar la carpeta: detecta Vite solo
(comando `npm run build`, salida `dist`).

## Dónde tocar cada cosa

| Qué | Archivo |
| --- | --- |
| URL de la tienda y del servidor | `src/config.js` |
| Video de presentación de Tiqui | `src/config.js` → `TIQUI_VIDEO` (vacío = "Muy pronto") |
| Enlaces legales del pie | `src/config.js` → `LEGALES` |
| Tiqui (dibujo, caras y disfraces) | `src/modules/tiqui.js` |
| Productos y precios de las demos | `src/modules/data.js` |
| Textos y estructura de las secciones | `index.html` |
| Colores, tipografía y diseño | `src/style.css` (tokens arriba de todo) |
| Tienda interactiva (filtros, carrito) | `src/modules/store.js` |
| Háblele a Tiqui (frases, micrófono, respuestas) | `src/modules/voice.js` |
| Tarjetas de beneficios | `src/modules/bento.js` |
| Editor de impresiones | `src/modules/print.js` |
| Sección de la app móvil | `src/modules/app.js` |
| Panel administrativo | `src/modules/admin.js` |
| Trailer | `public/video/trailer.mp4` |

## Notas

- Tiqui es ELLA, habla en primera persona y tutea. Su dibujo es el mismo de la tienda y la app
  (forma de `mascotaFormas.js`, caras de la app, disfraces de `DisfrazTiqui.jsx`).
- Los datos del negocio del pie (titular, NIT, teléfono, horario…) se leen del servidor, de lo que el
  dueño llena en el panel. Para que el navegador los deje leer, el dominio de esta landing tiene que
  estar en `CORS_ORIGINS` del backend en Render. Sin eso, el pie sale igual, sin esos datos.
- La página no usa cookies ni analíticas, por eso no lleva aviso de cookies.

- Animaciones con GSAP (ScrollTrigger, Flip, MotionPath) y scroll suave con Lenis.
- Respeta `prefers-reduced-motion`: sin loader, sin scroll suave y todo visible de entrada.
- El micrófono del asistente usa la Web Speech API (Chrome y Edge). En otros navegadores,
  o si no hay permiso, corre una demostración escrita.
- La imagen que se sube en Impresiones se previsualiza en el navegador; no se envía a ningún lado.
- Los números del panel son de ejemplo y así lo indica la propia maqueta.
