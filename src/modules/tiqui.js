/*
 * TIQUI — la asistente de Tienda la 635, dibujada para la landing.
 *
 * Es la MISMA etiqueta de la tienda y de la app, copiada punto por punto:
 *   · forma:     frontend/src/components/UI/mascotaFormas.js (lienzo 400 × 470)
 *   · caras:     movil/src/components/Tiqui/Tiqui.js
 *   · disfraces: frontend/src/components/UI/DisfrazTiqui.jsx
 * Si cambia allá, se cambia aquí: tiene que ser el mismo personaje en todos
 * lados.
 *
 * Uso en el HTML:
 *   <span data-tiqui data-pose="saludo" data-extra="ondas" data-disfraz="navidad"></span>
 * y en JS `ponerPose(el, 'feliz')` para cambiarle la cara (lo usa la demo de voz).
 *
 * Tiqui es ELLA. Es un dibujo: va con aria-hidden y quien la usa dice con
 * texto lo que pasa.
 */

const CUERPO =
  'M183,127 Q200,110 217,127 L261.6,171.6 Q280,190 280,216 C284,258 284,302 280,344 ' +
  'Q280,380 244,380 C215,383 185,383 156,380 Q120,380 120,344 C116,302 116,258 120,216 ' +
  'Q120,190 138.4,171.6 Z';
const AGUJERO = ' M212,160 A12,12 0 1 0 188,160 A12,12 0 1 0 212,160 Z';
const CORDON = 'M200,160 C200,126 216,118 223,96 C230,74 212,64 219,44';

const OJO_I = [174, 252];
const OJO_D = [226, 252];
const MIRADA = { piensa: [7, -8], escucha: [0, 3], apenado: [0, 5] };

const TONOS = {
  // La de la tienda: etiqueta navy con la cara blanca.
  navy: { cuerpo: '#003049', rasgo: '#FFFFFF', cordon: '#009AEB', acento: '#009AEB' },
  // Sobre fondos oscuros: etiqueta blanca con la cara navy (como en la app).
  blanco: { cuerpo: '#FFFFFF', rasgo: '#003049', cordon: '#8ECBE8', acento: '#8ECBE8' },
};

const DISFRACES = {
  navidad: { tipo: 'gorro-navidad', principal: '#C1121F', acento: '#FFFFFF' },
  halloween: { tipo: 'sombrero-bruja', principal: '#4C1D95', acento: '#EA580C' },
  independencia: { tipo: 'corbatin', principal: '#0F47AF', acento: '#FFFFFF' },
  'san-valentin': { tipo: 'mono', principal: '#E11D74', acento: '#9D174D', rubor: true },
};

const arco = ([x, y]) => `M${x - 12},${y + 5} Q${x},${y - 13} ${x + 12},${y + 5}`;
const trazo = (color, ancho = 7) =>
  `stroke="${color}" stroke-width="${ancho}" fill="none" stroke-linecap="round" stroke-linejoin="round"`;

function ojos(pose, rasgo) {
  const [mx, my] = MIRADA[pose] || [0, 0];
  const abierto = ([x, y], k = 1) =>
    `<ellipse class="tq-ojo" cx="${x + mx}" cy="${y + my}" rx="${10 * k}" ry="${14 * k}" fill="${rasgo}"/>`;
  if (pose === 'feliz') return `<path d="${arco(OJO_I)} ${arco(OJO_D)}" ${trazo(rasgo)}/>`;
  if (pose === 'saludo') return `${abierto(OJO_I)}<path d="${arco(OJO_D)}" ${trazo(rasgo)}/>`;
  const k = pose === 'escucha' ? 1.15 : 1;
  return abierto(OJO_I, k) + abierto(OJO_D, k);
}

const CEJAS = {
  escucha: 'M162,221 Q174,210 186,221 M214,221 Q226,210 238,221',
  piensa: 'M162,229 L186,229 M214,223 Q226,211 238,221',
  apenado: 'M162,231 L186,222 M214,222 L238,231',
};

function boca(pose, rasgo) {
  if (pose === 'feliz')
    return `<path d="M182,280 Q200,316 218,280 Z" fill="${rasgo}" stroke="${rasgo}" stroke-width="4" stroke-linejoin="round"/>`;
  if (pose === 'escucha') return `<ellipse cx="200" cy="291" rx="8" ry="10" fill="${rasgo}"/>`;
  if (pose === 'habla') return `<ellipse class="tq-boca-habla" cx="200" cy="290" rx="11" ry="12" fill="${rasgo}"/>`;
  const d = { piensa: 'M188,292 Q204,297 214,286', apenado: 'M186,296 Q200,286 214,296' }[pose] || 'M184,284 Q200,300 216,284';
  return `<path d="${d}" ${trazo(rasgo, 7.5)}/>`;
}

const estrella = (cx, cy, r) =>
  `M${cx},${cy - r} L${cx + r * 0.3},${cy - r * 0.3} L${cx + r},${cy} L${cx + r * 0.3},${cy + r * 0.3} L${cx},${cy + r} L${cx - r * 0.3},${cy + r * 0.3} L${cx - r},${cy} L${cx - r * 0.3},${cy - r * 0.3} Z`;

function extra(tipo, acento, rasgo) {
  if (tipo === 'ondas')
    return `<g class="tq-ondas" ${trazo(acento, 5)}><path d="M244,40 Q256,52 244,64"/><path d="M256,28 Q276,52 256,76" opacity=".7"/><path d="M268,16 Q296,52 268,88" opacity=".4"/></g>`;
  if (tipo === 'estrellas')
    return `<g><path d="${estrella(96, 150, 18)}" fill="#FFC23D"/><path d="${estrella(312, 110, 14)}" fill="#FFC23D"/><path d="${estrella(318, 300, 10)}" fill="#FFC23D" opacity=".6"/><path d="${estrella(80, 300, 9)}" fill="#FFC23D" opacity=".5"/></g>`;
  if (tipo === 'bolsa')
    return `<g><path d="M282,318 C282,296 318,296 318,318" ${trazo(acento, 6)}/><path d="M258,318 L342,318 L350,404 Q350,414 340,414 L260,414 Q250,414 250,404 Z" fill="${acento}"/><circle cx="336" cy="322" r="17" fill="#FFFFFF"/><path d="M328,322 L334,328 L345,316" ${trazo('#003049', 4.5)}/></g>`;
  if (tipo === 'pregunta')
    return `<g><path d="M288,94 C288,78 314,78 314,94 C314,104 301,104 301,116" ${trazo(acento, 8)}/><circle cx="301" cy="131" r="5.5" fill="${acento}"/></g>`;
  if (tipo === 'corazon')
    return `<g transform="translate(318 118) scale(1.6)"><path d="M0,-6 c-9,-13 -29,-4 -20,11 l20,18 20,-18 c9,-15 -11,-24 -20,-11 z" fill="#F0707F"/></g>`;
  return '';
}

const PIEZAS = {
  'gorro-navidad': ({ principal }) =>
    `<path d="M132,188 C134,146 162,110 206,98 C242,88 280,102 294,138 C300,158 300,194 296,222 L280,224 C279,208 274,196 270,188 Z" fill="${principal}"/>
     <path d="M252,112 C272,128 280,160 282,190" stroke="#000" stroke-opacity=".22" stroke-width="5" stroke-linecap="round" fill="none"/>
     <rect x="114" y="172" width="172" height="28" rx="14" fill="#FFFFFF"/>
     <circle cx="288" cy="228" r="15" fill="#FFFFFF"/>`,
  'sombrero-bruja': ({ principal, acento }) =>
    `<path d="M124,190 L166,86 C170,74 162,62 146,58 L130,56 C148,50 170,52 184,66 C192,74 196,86 198,96 L280,190 Z" fill="${principal}"/>
     <path d="M128,180 L136.1,160 L253.8,160 L271.3,180 Z" fill="${acento}"/>
     <path d="M183,158 L207,158 L207,182 L183,182 Z M190,165 L200,165 L200,175 L190,175 Z" fill-rule="evenodd" fill="#FFC23D"/>
     <ellipse cx="200" cy="190" rx="114" ry="17" fill="${principal}"/>`,
  corbatin: ({ principal, acento }) =>
    `<path d="M200,338 L162,318 Q154,338 162,358 Z" fill="${principal}"/>
     <path d="M200,338 L238,318 Q246,338 238,358 Z" fill="${principal}"/>
     <rect x="189" y="327" width="22" height="22" rx="6" fill="${acento}"/>`,
  mono: ({ principal, acento }) =>
    `<g transform="rotate(-38 160 150)">
       <path d="M160,150 C144,128 118,134 122,152 C124,168 146,166 160,150 Z" fill="${principal}"/>
       <path d="M160,150 C176,128 202,134 198,152 C196,168 174,166 160,150 Z" fill="${principal}"/>
       <circle cx="160" cy="150" r="9" fill="${acento}"/>
     </g>`,
};

function disfrazSvg(clave, contorno) {
  const d = DISFRACES[clave];
  if (!d) return '';
  const rubor = d.rubor
    ? `<g opacity=".55"><ellipse cx="150" cy="284" rx="13" ry="8" fill="#F0707F"/><ellipse cx="250" cy="284" rx="13" ry="8" fill="#F0707F"/></g>`
    : '';
  return `${rubor}<g stroke="${contorno}" stroke-width="4" stroke-linejoin="round" paint-order="stroke">${PIEZAS[d.tipo](d)}</g>`;
}

/** El SVG de Tiqui, listo para meter en el HTML. */
export function dibujarTiqui({ pose = 'normal', extra: ex = '', disfraz = '', tono = 'navy' } = {}) {
  const t = TONOS[tono] || TONOS.navy;
  // Va detrás de todo: con sombrero, el gorro tapa el agujero y el cordón
  // asoma por arriba, como una antena (igual que en la tienda).
  const cordon = `<path d="${CORDON}" ${trazo(t.cordon)}/>`;
  const cachetes =
    pose === 'saludo' || pose === 'feliz'
      ? `<g opacity=".5"><ellipse cx="150" cy="284" rx="12" ry="7" fill="#F0707F"/><ellipse cx="250" cy="284" rx="12" ry="7" fill="#F0707F"/></g>`
      : '';
  return `<svg class="tq" viewBox="60 10 300 400" aria-hidden="true" focusable="false">
    <g class="tq__cuerpo">
      ${cordon}
      <path d="${CUERPO}${AGUJERO}" fill-rule="evenodd" fill="${t.cuerpo}"/>
      ${CEJAS[pose] ? `<path d="${CEJAS[pose]}" ${trazo(t.rasgo, 6.5)}/>` : ''}
      ${ojos(pose, t.rasgo)}
      ${boca(pose, t.rasgo)}
      ${cachetes}
      ${disfrazSvg(disfraz, t.rasgo)}
      ${extra(ex, t.acento, t.rasgo)}
    </g>
    <rect x="150" y="398" width="100" height="6" rx="3" fill="#000" opacity=".12"/>
  </svg>`;
}

const opcionesDe = (el) => ({
  pose: el.dataset.pose,
  extra: el.dataset.extra,
  disfraz: el.dataset.disfraz,
  tono: el.dataset.tono,
});

/** Pinta cada [data-tiqui] del documento. */
export function montarTiqui(root = document) {
  root.querySelectorAll('[data-tiqui]').forEach((el) => {
    el.innerHTML = dibujarTiqui(opcionesDe(el));
  });
}

/** Le cambia la cara (y lo que la acompaña) a un Tiqui ya pintado. */
export function ponerPose(el, pose, extraNuevo = el.dataset.extra) {
  if (!el) return;
  el.dataset.pose = pose;
  el.dataset.extra = extraNuevo || '';
  el.innerHTML = dibujarTiqui(opcionesDe(el));
}
