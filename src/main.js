import '@fontsource/poppins/latin-400.css';
import '@fontsource/poppins/latin-500.css';
import '@fontsource/poppins/latin-600.css';
import '@fontsource/poppins/latin-700.css';
import '@fontsource/poppins/latin-800.css';
import './style.css';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { Flip } from 'gsap/Flip';

import { STORE_URL, STORE_HOST, API_URL, TIQUI_VIDEO, LEGALES, reduceMotion, finePointer } from './config.js';
import { hydrateIcons, LOGO_MARK, icon } from './modules/icons.js';
import { initScroll, scrollTo, stopScroll, startScroll } from './modules/scroll.js';
import { initStore } from './modules/store.js';
import { initVoice } from './modules/voice.js';
import { initBento } from './modules/bento.js';
import { initPrint } from './modules/print.js';
import { initApp } from './modules/app.js';
import { initAdmin } from './modules/admin.js';
import { montarTiqui } from './modules/tiqui.js';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, Flip);

/* ---------- Marca e íconos ---------- */
document.querySelectorAll('[data-logo]').forEach((el) => (el.innerHTML = LOGO_MARK));
document.querySelectorAll('[data-store-link]').forEach((a) => (a.href = STORE_URL));
montarTiqui();
pintarFantasmas();
hydrateIcons();

initScroll();

/* ---------- Cinta ---------- */
buildMarquee();

/* ---------- Secciones interactivas ---------- */
initStore(document.querySelector('[data-store]'));
initVoice(document.querySelector('[data-voice]'));
initBento();
initPrint(document.querySelector('[data-print]'));
initApp(document.querySelector('[data-app]'));
initAdmin(document.querySelector('[data-admin]'));

/* ---------- Globales ---------- */
initNav();
initAnchors();
initSplitTitles();
initReveals();
initMagnetic();
initHeroParallax();
initTrailer();
initCta();
initCopy();
initLegales();
cargarNegocio();

const heroTl = buildHeroIntro();
runLoader(heroTl);

/* ======================================================== */

function runLoader(next) {
  const loader = document.querySelector('.loader');
  const finish = () => {
    document.body.classList.remove('is-loading');
    startScroll();
    ScrollTrigger.refresh();
  };

  if (reduceMotion) {
    loader.remove();
    finish();
    next.progress(1);
    return;
  }

  stopScroll();
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.loader__mark', { scale: 0.5, rotate: -30, opacity: 0, duration: 0.7, ease: 'back.out(1.8)' })
    .from('.loader__word .mask > span', { yPercent: 110, duration: 0.6, stagger: 0.08 }, '-=0.4')
    .to('.loader__bar i', { scaleX: 1, duration: 0.75, ease: 'power2.inOut' }, '-=0.25')
    .to('.loader__inner', { y: -30, opacity: 0, duration: 0.45, ease: 'power2.in' }, '+=0.05')
    .to(loader, { yPercent: -100, duration: 0.85, ease: 'power4.inOut' }, '-=0.15')
    .add(() => next.play(), '-=0.5')
    .add(() => {
      loader.remove();
      finish();
    });
}

function buildHeroIntro() {
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
  tl.from('.hero__title .line__in', { yPercent: 115, duration: 1.1, stagger: 0.09, ease: 'power4.out' })
    .to('.squiggle path', { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, 0.7)
    .from('[data-hero-fade]', { y: 26, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.2)
    .from('.browser', { y: 90, opacity: 0, rotationY: -32, rotationX: 14, duration: 1.4, ease: 'power4.out' }, 0.25)
    .from('.float', { scale: 0, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'back.out(1.6)' }, 0.7)
    .from('.scroll-cue', { opacity: 0, y: 10, duration: 0.6 }, 1.2)
    .add(() => chipsLoop(), 1.3);
  return tl;
}

function chipsLoop() {
  const chips = gsap.utils.toArray('.hchip');
  if (reduceMotion) return;
  const badge = document.querySelector('[data-hero-badge]');
  const loop = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
  chips.forEach((chip, i) => {
    const at = i * 1.5;
    loop.fromTo(chip, { opacity: 0, y: 16, scale: 0.85 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'back.out(2)' }, at);
    loop.to(chip, { opacity: 0, y: -12, scale: 0.95, duration: 0.4, ease: 'power2.in' }, at + 3.4);
  });
  loop.call(() => bump(badge, '3'), null, 0.25);
  loop.call(() => bump(badge, '2'), null, 5.9);

  // Solo corre mientras el hero está a la vista.
  ScrollTrigger.create({
    trigger: '.hero',
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
  });
}

function bump(el, text) {
  if (!el) return;
  el.textContent = text;
  gsap.fromTo(el, { scale: 1.7 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.45)' });
}

function initHeroParallax() {
  const area = document.querySelector('[data-tilt-area]');
  const browser = area?.querySelector('[data-tilt]');
  if (!area || !browser) return;

  const base = { rx: 7, ry: -13 };
  gsap.set(browser, { rotationX: base.rx, rotationY: base.ry, transformPerspective: 1600 });

  // Al bajar, la maqueta se endereza y se aleja un poco.
  if (!reduceMotion) {
    gsap.to(area, {
      yPercent: 12,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  if (!finePointer || reduceMotion) return;
  const rx = gsap.quickTo(browser, 'rotationX', { duration: 0.9, ease: 'power3' });
  const ry = gsap.quickTo(browser, 'rotationY', { duration: 0.9, ease: 'power3' });
  const layers = [...area.querySelectorAll('[data-depth]')].map((el) => ({
    depth: parseFloat(el.dataset.depth),
    x: gsap.quickTo(el, 'x', { duration: 1.1, ease: 'power3' }),
    y: gsap.quickTo(el, 'y', { duration: 1.1, ease: 'power3' }),
  }));

  window.addEventListener('pointermove', (e) => {
    if (window.scrollY > window.innerHeight || document.body.classList.contains('is-loading')) return;
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    rx(base.rx - ny * 9);
    ry(base.ry + nx * 12);
    layers.forEach((l) => {
      l.x(nx * l.depth);
      l.y(ny * l.depth);
    });
  });
}

function buildMarquee() {
  const rows = {
    a: [
      ['Frutas frescas', '/img/manzana.webp'],
      ['Snacks', '/img/takis-originales.png'],
      ['Bebidas', '/img/coca-cola.png'],
      ['Lácteos', '/img/queso-parmesano.webp'],
      ['Uvas verdes', '/img/uvas-verdes.webp'],
    ],
    b: [['Impresiones'], ['Tarjetas de regalo'], ['Puntos de fidelidad'], ['Entrega a domicilio'], ['Asistente de voz']],
  };

  document.querySelectorAll('[data-marquee]').forEach((track) => {
    const items = rows[track.dataset.marquee];
    const group = items
      .map(
        ([label, img]) =>
          `<span class="marquee__item">${img ? `<img src="${img}" alt="" />` : ''}${label}<span class="marquee__star">✦</span></span>`
      )
      .join('');
    // Dos mitades idénticas: al llegar a -50% vuelve a empezar sin salto.
    const half = `<span class="marquee__half" style="display:inline-flex">${group}${group}</span>`;
    track.innerHTML = half + half;
  });

  if (reduceMotion) return;

  const tweens = [...document.querySelectorAll('.marquee__row')].map((row) => {
    const track = row.querySelector('.marquee__track');
    const dir = Number(row.dataset.dir);
    const tween = gsap.fromTo(
      track,
      { xPercent: dir > 0 ? 0 : -50 },
      { xPercent: dir > 0 ? -50 : 0, duration: 38, ease: 'none', repeat: -1 }
    );
    // Arranca "lejos" del cero para poder ir en reversa al subir sin trabarse.
    tween.totalTime(tween.duration() * 100);
    return tween;
  });

  // Se acelera con la velocidad del scroll y vuelve a su ritmo.
  let settle;
  ScrollTrigger.create({
    trigger: '.marquee',
    start: 'top bottom',
    end: 'bottom top',
    onUpdate(self) {
      const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 250, 7);
      tweens.forEach((t) => gsap.to(t, { timeScale: boost * (self.direction || 1), duration: 0.2, overwrite: true }));
      clearTimeout(settle);
      settle = setTimeout(() => tweens.forEach((t) => gsap.to(t, { timeScale: 1, duration: 1.2, overwrite: true })), 120);
    },
  });
}

function initNav() {
  const nav = document.querySelector('[data-nav]');
  const burger = document.querySelector('[data-burger]');
  const menu = document.querySelector('[data-menu]');
  let menuOpen = false;

  gsap.to('.progress i', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
  });

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate(self) {
      const hide = self.direction === 1 && self.scroll() > 500 && !menuOpen;
      nav.classList.toggle('is-hidden', hide);
    },
  });

  // Resalta el enlace de la sección visible.
  const links = [...document.querySelectorAll('[data-link]')];
  links.forEach((link) => {
    const section = document.querySelector(link.getAttribute('href'));
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: (self) => {
        if (self.isActive) links.forEach((l) => l.classList.toggle('is-active', l === link));
        else link.classList.remove('is-active');
      },
    });
  });

  const setMenu = (open) => {
    menuOpen = open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    if (open) {
      menu.hidden = false;
      stopScroll();
      gsap.fromTo(menu, { clipPath: 'circle(0% at 92% 5%)' }, { clipPath: 'circle(150% at 92% 5%)', duration: 0.7, ease: 'power3.inOut' });
      gsap.from('.menu__links a, .menu .btn', { y: 40, opacity: 0, stagger: 0.05, duration: 0.6, delay: 0.2, ease: 'power3.out' });
    } else {
      startScroll();
      gsap.to(menu, {
        clipPath: 'circle(0% at 92% 5%)',
        duration: 0.5,
        ease: 'power3.inOut',
        onComplete: () => (menu.hidden = true),
      });
    }
  };
  burger.addEventListener('click', () => setMenu(!menuOpen));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => menuOpen && setMenu(false)));
  window.addEventListener('keydown', (e) => e.key === 'Escape' && menuOpen && setMenu(false));
}

function initAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      scrollTo(target, { offset: target.id === 'inicio' ? 0 : -10 });
    });
  });
}

// Parte los títulos en palabras para que suban una por una.
function initSplitTitles() {
  document.querySelectorAll('[data-split]').forEach((el) => {
    const wrapWords = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(' '));
            } else {
              const w = document.createElement('span');
              w.className = 'w';
              w.innerHTML = `<span class="w__in">${part}</span>`;
              frag.appendChild(w);
            }
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          wrapWords(child);
        }
      });
    };
    el.setAttribute('aria-label', el.textContent.trim());
    wrapWords(el);
    [...el.querySelectorAll('.w')].forEach((w) => w.setAttribute('aria-hidden', 'true'));

    if (reduceMotion) return;
    gsap.from(el.querySelectorAll('.w__in'), {
      yPercent: 110,
      rotate: 4,
      duration: 1,
      stagger: 0.06,
      ease: 'power4.out',
      scrollTrigger: { trigger: el, start: 'top 86%', once: true },
    });
  });
}

function initReveals() {
  if (reduceMotion) return;
  gsap.utils.toArray('.kicker').forEach((el) =>
    gsap.from(el, { x: -20, opacity: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } })
  );
  gsap.utils.toArray('[data-fade]').forEach((el) =>
    gsap.from(el, { y: 30, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } })
  );
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    once: true,
    onEnter: (els) =>
      gsap.fromTo(els, { y: 70, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 1.1, stagger: 0.09, ease: 'power3.out', overwrite: true }),
  });
  gsap.set('[data-reveal]', { opacity: 0 });
}

function initMagnetic() {
  if (!finePointer || reduceMotion) return;
  document.querySelectorAll('.magnetic').forEach((btn) => {
    const x = gsap.quickTo(btn, 'x', { duration: 0.6, ease: 'power3' });
    const y = gsap.quickTo(btn, 'y', { duration: 0.6, ease: 'power3' });
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      x((e.clientX - r.left - r.width / 2) * 0.28);
      y((e.clientY - r.top - r.height / 2) * 0.38);
    });
    btn.addEventListener('pointerleave', () => {
      x(0);
      y(0);
    });
  });
}

function initTrailer() {
  const frame = document.querySelector('[data-trailer-frame]');
  const bgVideo = document.querySelector('[data-trailer-bg]');
  const modal = document.querySelector('[data-modal]');
  const modalVideo = document.querySelector('[data-modal-video]');
  let lastFocus = null;

  if (frame && !reduceMotion) {
    gsap.fromTo(
      frame,
      { scale: 0.82, borderRadius: 48 },
      { scale: 1, borderRadius: 28, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'center center', scrub: true } }
    );
    ScrollTrigger.create({
      trigger: frame,
      start: 'top 75%',
      end: 'bottom 25%',
      onToggle: (self) => (self.isActive ? bgVideo.play().catch(() => {}) : bgVideo.pause()),
    });
  }

  /*
   * El mismo modal sirve para el trailer y para la presentación de Tiqui: solo
   * cambia el video que carga y el nombre que anuncia el lector de pantalla.
   */
  const TRAILER = { src: '/video/trailer.mp4', poster: '/video/poster.jpg', nombre: 'Trailer de Tienda la 635' };
  const open = (video = TRAILER) => {
    lastFocus = document.activeElement;
    if (modalVideo.dataset.src !== video.src) {
      modalVideo.dataset.src = video.src;
      modalVideo.src = video.src;
      if (video.poster) modalVideo.poster = video.poster;
      else modalVideo.removeAttribute('poster');
    }
    modal.setAttribute('aria-label', video.nombre);
    modal.hidden = false;
    stopScroll();
    bgVideo.pause();
    gsap.fromTo('.modal__backdrop', { opacity: 0 }, { opacity: 1, duration: 0.4 });
    gsap.fromTo('.modal__box', { scale: 0.9, y: 30, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
    modalVideo.currentTime = 0;
    modalVideo.play().catch(() => {});
    modal.querySelector('.modal__close').focus();
  };

  /*
   * La presentación de Tiqui. Mientras no exista (config.js → TIQUI_VIDEO
   * vacío) la sección dice "Muy pronto" y no hay botón que lleve a nada.
   */
  const botonTiqui = document.querySelector('[data-play-tiqui]');
  if (botonTiqui && TIQUI_VIDEO) {
    botonTiqui.hidden = false;
    document.querySelector('[data-tiqui-video-estado]').textContent = 'Conózcala en un minuto.';
    botonTiqui.addEventListener('click', () => open({ src: TIQUI_VIDEO, nombre: 'Presentación de Tiqui' }));
  }
  const close = () => {
    modalVideo.pause();
    gsap.to('.modal__box', { scale: 0.94, opacity: 0, duration: 0.3, ease: 'power2.in' });
    gsap.to('.modal__backdrop', {
      opacity: 0,
      duration: 0.35,
      onComplete: () => {
        modal.hidden = true;
        startScroll();
        lastFocus?.focus();
      },
    });
  };

  document.querySelectorAll('[data-open-trailer]').forEach((b) => b.addEventListener('click', () => open()));
  modal.querySelectorAll('[data-close-modal]').forEach((b) => b.addEventListener('click', close));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) close();
  });
}

function initCta() {
  if (reduceMotion) return;
  const tl = gsap.timeline({ scrollTrigger: { trigger: '.cta', start: 'top 70%', once: true } });
  tl.from('.cta .eyebrow', { y: 20, opacity: 0, duration: 0.6 })
    .from('.cta__word .mask > span', { yPercent: 110, duration: 1.1, stagger: 0.1, ease: 'power4.out' }, 0.1)
    .from('.cta__line', { scaleX: 0, duration: 0.7, ease: 'power3.inOut' }, 0.6)
    .from('.cta__tag', { y: 20, opacity: 0, duration: 0.7 }, 0.8)
    .from('.cta__actions > *', { y: 20, opacity: 0, stagger: 0.1, duration: 0.7 }, 0.95);

  gsap.to('.glow--c', {
    scale: 1.25,
    ease: 'none',
    scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom top', scrub: true },
  });
}

function initCopy() {
  const btn = document.querySelector('[data-copy]');
  const label = btn?.querySelector('[data-copy-label]');
  if (!btn) return;
  let timer;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(STORE_URL);
      label.textContent = '¡Enlace copiado!';
    } catch {
      label.textContent = STORE_URL;
    }
    btn.classList.add('is-copied');
    btn.querySelector('.ic')?.remove();
    btn.insertAdjacentHTML('beforeend', icon('check'));
    clearTimeout(timer);
    timer = setTimeout(() => {
      label.textContent = STORE_HOST;
      btn.classList.remove('is-copied');
      btn.querySelector('.ic')?.remove();
      btn.insertAdjacentHTML('beforeend', icon('copy'));
    }, 2200);
  });
}

/*
 * Las etiquetas "fantasma" del fondo de la sección de Tiqui: solo el
 * contorno, casi invisibles. Es el mismo fondo de su video y de la app.
 */
function pintarFantasmas() {
  const svg = document.querySelector('[data-fantasmas]');
  if (!svg) return;
  const FORMA =
    'M183,127 Q200,110 217,127 L261.6,171.6 Q280,190 280,216 C284,258 284,302 280,344 Q280,380 244,380 C215,383 185,383 156,380 Q120,380 120,344 C116,302 116,258 120,216 Q120,190 138.4,171.6 Z M212,160 A12,12 0 1 0 188,160 A12,12 0 1 0 212,160 Z';
  // En los bordes, lejos del texto: son fondo, no tienen que cruzarse con nada.
  const lugares = [
    [-40, 20, -14, 0.55], [1230, -30, 12, 0.6], [1300, 640, -8, 0.5], [-20, 700, 16, 0.42], [560, -60, -20, 0.3],
  ];
  svg.innerHTML = lugares
    .map(
      ([x, y, giro, k]) =>
        `<path d="${FORMA}" fill="none" stroke="#003049" stroke-opacity=".07" stroke-width="${(6 / k).toFixed(1)}" transform="translate(${x} ${y}) rotate(${giro}) scale(${k})"/>`
    )
    .join('');
}

// Los documentos legales viven en la tienda; aquí van los enlaces.
function initLegales() {
  const nav = document.querySelector('[data-legales]');
  if (!nav) return;
  nav.innerHTML = LEGALES.map(
    ({ texto, ruta }) => `<a href="${new URL(ruta, STORE_URL)}" target="_blank" rel="noopener">${texto}</a>`
  ).join('');
}

/*
 * Los datos del negocio, los mismos que el dueño llena en el panel
 * (Personalización → Identidad) y que salen en el pie de la tienda. Si el
 * servidor no contesta —está dormido, o este dominio no está en su
 * CORS_ORIGINS—, el pie se queda con los enlaces legales y ya.
 */
async function cargarNegocio() {
  const dl = document.querySelector('[data-negocio]');
  if (!dl) return;
  try {
    const control = new AbortController();
    const reloj = setTimeout(() => control.abort(), 60000);
    const res = await fetch(`${API_URL}/storeSettings`, { signal: control.signal });
    clearTimeout(reloj);
    if (!res.ok) return;
    const ajustes = await res.json();
    const n = ajustes?.negocio || {};
    const escapar = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    const filas = [
      ['Titular', n.titular],
      ['NIT', n.nit],
      ['NRC', n.nrc],
      ['Dirección', ajustes?.direccion],
      ['Teléfono', n.telefono],
      ['Correo', n.correo],
      ['Horario', n.horario],
    ].filter(([, v]) => v && String(v).trim());
    if (!filas.length) return;
    dl.innerHTML = filas.map(([k, v]) => `<div><dt>${k}</dt><dd>${escapar(v)}</dd></div>`).join('');
    dl.hidden = false;
    if (n.titular) document.querySelector('[data-titular]').textContent = n.titular;
  } catch {
    // Sin datos del negocio: el pie sigue completo con lo demás.
  }
}
