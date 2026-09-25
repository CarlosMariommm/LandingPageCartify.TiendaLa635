// Todo lo que cambia si la tienda cambia de dirección vive aquí.
export const STORE_URL = 'https://cartify-tienda-la635.vercel.app/';
export const STORE_HOST = 'cartify-tienda-la635.vercel.app';

/*
 * El servidor de la tienda. De aquí salen los datos del negocio del pie
 * (titular, NIT, teléfono, horario…), los mismos que el dueño llena en
 * Personalización → Identidad. Para que el navegador deje leerlos, el dominio
 * de esta landing tiene que estar en CORS_ORIGINS del servidor (Render). Si no
 * responde, el pie sale igual, solo que sin esos datos.
 */
export const API_URL = 'https://cartify-tiendala635.onrender.com/api';

/*
 * La presentación de Tiqui en video. Vacío mientras no esté lista (se está
 * esperando la voz de ElevenLabs): la sección muestra "Muy pronto". Cuando
 * exista, se copia a public/video/ y se pone aquí la ruta, por ejemplo
 * '/video/tiqui.mp4'; con eso aparece el botón para verla.
 */
export const TIQUI_VIDEO = '';

// Los documentos legales viven en la tienda: aquí solo se enlazan.
export const LEGALES = [
  { texto: 'Términos y condiciones', ruta: 'terminos' },
  { texto: 'Política de privacidad', ruta: 'privacidad' },
  { texto: 'Política de cookies', ruta: 'cookies' },
  { texto: 'Cambios y devoluciones', ruta: 'devoluciones' },
];

export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = window.matchMedia('(pointer: fine)').matches;
