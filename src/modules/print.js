import gsap from 'gsap';
import { icon } from './icons.js';
import { reduceMotion } from '../config.js';

// Los formatos base reales del servicio de impresión (backend/src/scripts/seedFormatosBaseImpresion.js).
const FORMATS = [
  { id: 'carta', name: 'Carta', w: 21.6, h: 27.9 },
  { id: 'a4', name: 'A4', w: 21, h: 29.7 },
  { id: 'oficio', name: 'Oficio', w: 21.6, h: 33 },
  { id: 'media', name: 'Media carta', w: 21.6, h: 13.95 },
  { id: 'dui', name: 'Foto DUI', w: 8.5, h: 5.4, photo: true, copies: 2, max: 8 },
  { id: 'pasaporte', name: 'Foto pasaporte', w: 4, h: 4, photo: true, copies: 6, max: 20 },
];

const PAPERS = [
  { id: 'normal', name: 'Normal' },
  { id: 'foto', name: 'Fotográfico' },
  { id: 'cartulina', name: 'Cartulina' },
  { id: 'reciclado', name: 'Reciclado' },
];

// Las fotos se acomodan sobre una hoja carta.
const PHOTO_SHEET = { w: 21.6, h: 27.9 };

const PERSON = `<svg viewBox="0 0 60 70" aria-hidden="true"><circle cx="30" cy="24" r="13" fill="#fff" opacity=".9"/><path d="M6 70c0-15 11-24 24-24s24 9 24 24" fill="#fff" opacity=".9"/></svg>`;

export function initPrint(root) {
  if (!root) return;
  const $ = (s) => root.querySelector(s);
  const formatsEl = $('[data-formats]');
  const papersEl = $('[data-papers]');
  const sheet = $('[data-sheet]');
  const stage = $('[data-sheet-stage]');
  const front = $('[data-front]');
  const back = $('[data-back]');
  const meta = $('[data-sheet-meta]');
  const fileInput = $('[data-file]');
  const drop = $('[data-drop]');
  const dropThumb = $('[data-drop-thumb]');
  const dropTitle = $('[data-drop-title]');
  const copiesBox = $('[data-copies]');
  const copiesN = $('[data-copies-n]');
  const duplexBtn = $('[data-duplex]');
  const colorBtn = $('[data-color]');
  const flipBtn = $('[data-flip]');

  const state = { fmt: FORMATS[0], paper: 'normal', img: null, duplex: false, color: true, copies: 1, flipped: false };

  formatsEl.innerHTML = FORMATS.map(
    (f, i) =>
      `<button class="chip${i === 0 ? ' is-active' : ''}" type="button" role="radio" aria-checked="${i === 0}" data-fmt="${f.id}">${f.name}<small>${f.w} × ${f.h} cm</small></button>`
  ).join('');
  papersEl.innerHTML = PAPERS.map(
    (p, i) => `<button class="chip${i === 0 ? ' is-active' : ''}" type="button" role="radio" aria-checked="${i === 0}" data-paper="${p.id}">${p.name}</button>`
  ).join('');

  const pick = (group, btn) =>
    group.querySelectorAll('.chip').forEach((c) => {
      c.classList.toggle('is-active', c === btn);
      c.setAttribute('aria-checked', String(c === btn));
    });

  /* ---------- Medidas ---------- */
  function sheetDims() {
    const page = state.fmt.photo ? PHOTO_SHEET : state.fmt;
    const maxW = Math.min(stage.clientWidth - 70, 440);
    const maxH = stage.clientHeight - 90;
    const scale = Math.min(maxW / page.w, maxH / page.h);
    return { width: page.w * scale, height: page.h * scale, cm: scale };
  }

  function resize(animate) {
    const d = sheetDims();
    if (!animate || reduceMotion) {
      gsap.set(sheet, { width: d.width, height: d.height, '--cm': `${d.cm}px` });
      return;
    }
    gsap.to(sheet, { width: d.width, height: d.height, '--cm': `${d.cm}px`, duration: 0.7, ease: 'power3.inOut' });
  }

  /* ---------- Contenido de la hoja ---------- */
  const media = (cls = '') => (state.img ? `<img class="${cls}" src="${state.img}" alt="Su imagen" />` : `<div class="ph">${PERSON}</div>`);

  function renderFront(animate) {
    const f = state.fmt;
    if (f.photo) {
      const slots = Array.from(
        { length: state.copies },
        () => `<div class="slot" style="--w:${f.w};--h:${f.h}">${media()}</div>`
      ).join('');
      front.innerHTML = `<div class="slots">${slots}</div>`;
      if (animate && !reduceMotion) {
        gsap.from(front.querySelectorAll('.slot'), { scale: 0.4, opacity: 0, duration: 0.5, stagger: 0.04, ease: 'back.out(1.8)', delay: 0.2 });
      }
    } else if (state.img) {
      front.innerHTML = `<div class="doc doc--full"><div class="doc__img"><img src="${state.img}" alt="Su imagen" /></div></div>`;
    } else {
      front.innerHTML = `<div class="doc">
        <div class="doc__title"></div>
        <div class="doc__line" style="width:92%"></div><div class="doc__line" style="width:84%"></div><div class="doc__line" style="width:88%"></div>
        <div class="doc__img">${icon('image')}</div>
        <div class="doc__line" style="width:90%"></div><div class="doc__line" style="width:70%"></div>
      </div>`;
    }
    if (animate && !reduceMotion && !f.photo) gsap.from(front.firstElementChild, { opacity: 0, y: 10, duration: 0.5, delay: 0.25 });
  }

  function renderBack() {
    back.innerHTML = state.fmt.photo
      ? `<span class="back-label">Reverso</span>`
      : `<div class="doc"><div class="doc__line" style="width:95%"></div><div class="doc__line" style="width:88%"></div><div class="doc__line" style="width:91%"></div><div class="doc__line" style="width:80%"></div><div class="doc__line" style="width:93%"></div><div class="doc__line" style="width:60%"></div></div><span class="back-label">Página 2</span>`;
  }

  function renderMeta() {
    const f = state.fmt;
    const paper = PAPERS.find((p) => p.id === state.paper).name;
    const parts = [`<b>${f.name}</b>`, `${f.w} × ${f.h} cm`, `Papel ${paper.toLowerCase()}`, state.color ? 'A color' : 'Blanco y negro', state.duplex ? 'Doble cara' : 'Una cara'];
    if (f.photo) parts.splice(2, 0, `${state.copies} ${state.copies === 1 ? 'copia' : 'copias'}`);
    meta.innerHTML = parts.join(' · ');
  }

  function setFlip(flipped) {
    state.flipped = flipped;
    gsap.to(sheet, { rotationY: flipped ? 180 : 0, duration: reduceMotion ? 0 : 0.9, ease: 'power3.inOut' });
  }

  function syncColor() {
    sheet.classList.toggle('is-bw', !state.color);
  }

  /* ---------- Eventos ---------- */
  formatsEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-fmt]');
    if (!b || b.dataset.fmt === state.fmt.id) return;
    pick(formatsEl, b);
    state.fmt = FORMATS.find((f) => f.id === b.dataset.fmt);
    state.copies = state.fmt.photo ? state.fmt.copies : 1;
    copiesBox.hidden = !state.fmt.photo;
    copiesN.textContent = state.copies;
    if (state.flipped) setFlip(false);
    resize(true);
    renderFront(true);
    renderBack();
    renderMeta();
    if (!reduceMotion) gsap.fromTo(sheet, { y: 0 }, { y: -14, duration: 0.35, yoyo: true, repeat: 1, ease: 'power2.out' });
  });

  papersEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-paper]');
    if (!b) return;
    pick(papersEl, b);
    state.paper = b.dataset.paper;
    sheet.dataset.paper = state.paper;
    renderMeta();
    if (!reduceMotion) gsap.fromTo(sheet, { rotationZ: -2, scale: 0.97 }, { rotationZ: 0, scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.5)' });
  });

  const toggle = (btn, key, after) =>
    btn.addEventListener('click', () => {
      state[key] = !state[key];
      btn.setAttribute('aria-checked', String(state[key]));
      after?.();
      renderMeta();
    });

  toggle(duplexBtn, 'duplex', () => {
    flipBtn.hidden = !state.duplex;
    if (state.duplex) {
      setFlip(true);
      setTimeout(() => state.duplex && state.flipped && setFlip(false), 1500);
    } else if (state.flipped) {
      setFlip(false);
    }
  });
  toggle(colorBtn, 'color', syncColor);
  flipBtn.addEventListener('click', () => setFlip(!state.flipped));

  const stepCopies = (delta) => {
    const next = Math.min(state.fmt.max, Math.max(1, state.copies + delta));
    if (next === state.copies) {
      if (!reduceMotion) gsap.fromTo(copiesN, { x: -4 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' });
      return;
    }
    state.copies = next;
    copiesN.textContent = next;
    const slots = front.querySelector('.slots');
    if (delta > 0) {
      slots.insertAdjacentHTML('beforeend', `<div class="slot" style="--w:${state.fmt.w};--h:${state.fmt.h}">${media()}</div>`);
      if (!reduceMotion) gsap.from(slots.lastElementChild, { scale: 0.3, opacity: 0, duration: 0.5, ease: 'back.out(2)' });
    } else {
      const last = slots.lastElementChild;
      if (reduceMotion) last.remove();
      else gsap.to(last, { scale: 0.3, opacity: 0, duration: 0.25, onComplete: () => last.remove() });
    }
    renderMeta();
  };
  $('[data-copies-inc]').addEventListener('click', () => stepCopies(1));
  $('[data-copies-dec]').addEventListener('click', () => stepCopies(-1));

  /* ---------- Imagen del usuario (solo local) ---------- */
  function useFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      dropTitle.textContent = 'En esta demostración solo se previsualizan imágenes.';
      return;
    }
    if (state.img) URL.revokeObjectURL(state.img);
    state.img = URL.createObjectURL(file);
    dropThumb.innerHTML = `<img src="${state.img}" alt="" />`;
    dropTitle.textContent = file.name.length > 34 ? `${file.name.slice(0, 31)}…` : file.name;
    if (state.flipped) setFlip(false);
    renderFront(true);
    if (!reduceMotion) gsap.fromTo(sheet, { scale: 0.94 }, { scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.5)' });
  }

  fileInput.addEventListener('change', () => useFile(fileInput.files[0]));
  [drop, stage].forEach((zone) => {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      drop.classList.add('is-over');
    });
    zone.addEventListener('dragleave', () => drop.classList.remove('is-over'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      drop.classList.remove('is-over');
      useFile(e.dataTransfer.files[0]);
    });
  });

  /* ---------- Arranque ---------- */
  syncColor();
  renderFront(false);
  renderBack();
  renderMeta();
  resize(false);
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => resize(false), 150);
  });
}
