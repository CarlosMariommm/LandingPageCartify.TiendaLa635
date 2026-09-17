import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import QRCode from 'qrcode';
import { icon } from './icons.js';
import { STORE_URL, reduceMotion, finePointer } from '../config.js';

// Corre una animación solo mientras su tarjeta está en pantalla.
const whileVisible = (trigger, tl) =>
  ScrollTrigger.create({
    trigger,
    start: 'top 90%',
    end: 'bottom 10%',
    onToggle: (self) => (self.isActive ? tl.play() : tl.pause()),
  });

export function initBento() {
  spotlight();
  mapCard();
  codeCard();
  pointsCard();
  giftCard();
  ageCard();
  qrCard();
  seasonCard();
}

function spotlight() {
  if (!finePointer) return;
  document.querySelectorAll('[data-spot]').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

function mapCard() {
  const map = document.querySelector('[data-map]');
  if (!map) return;
  const route = map.querySelector('#map-route');
  const rider = map.querySelector('#map-rider');
  const statusEl = map.querySelector('[data-map-status]');
  const etaEl = map.querySelector('[data-map-eta]');
  const len = route.getTotalLength();
  gsap.set(route, { strokeDasharray: len, strokeDashoffset: len });

  const setStatus = (t) => (statusEl.textContent = t);
  const trip = { p: 0 };
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.2, paused: true });

  tl.call(() => setStatus('Preparando su pedido'))
    .set(trip, { p: 0 })
    .set(route, { strokeDashoffset: len })
    .set(rider, { opacity: 1 })
    .add(() => (etaEl.textContent = '12'))
    .to({}, { duration: 1.4 })
    .call(() => setStatus('En camino'))
    .to(trip, {
      p: 1,
      duration: reduceMotion ? 0.01 : 7,
      ease: 'power1.inOut',
      onUpdate() {
        const pt = route.getPointAtLength(len * trip.p);
        gsap.set(rider, { x: pt.x, y: pt.y });
        route.style.strokeDashoffset = len * (1 - trip.p);
        etaEl.textContent = Math.max(1, Math.ceil(12 * (1 - trip.p)));
      },
    })
    .call(() => {
      setStatus('¡Llegó! Tenga listo su código');
      etaEl.textContent = '0';
    })
    .fromTo(rider, { scale: 1 }, { scale: 1.6, duration: 0.3, yoyo: true, repeat: 1, transformOrigin: 'center' })
    .to({}, { duration: 1.8 });

  const start = route.getPointAtLength(0);
  gsap.set(rider, { x: start.x, y: start.y });
  whileVisible(map, tl);
}

function codeCard() {
  const box = document.querySelector('[data-code]');
  if (!box) return;
  const H = 66;
  box.innerHTML = Array.from(
    { length: 4 },
    () => `<div class="code__slot"><div class="code__reel">${Array.from({ length: 30 }, (_, i) => `<span>${i % 10}</span>`).join('')}</div></div>`
  ).join('');
  const reels = [...box.querySelectorAll('.code__reel')];

  const roll = () => {
    // Igual que la tienda: cuatro dígitos.
    const digits = String(Math.floor(Math.random() * 10000)).padStart(4, '0').split('').map(Number);
    box.setAttribute('aria-label', `Código de entrega de ejemplo: ${digits.join(' ')}`);
    reels.forEach((reel, i) => {
      const target = 20 + digits[i];
      if (reduceMotion) return gsap.set(reel, { y: -target * H });
      gsap.fromTo(reel, { y: -(digits[i] % 10) * H }, { y: -target * H, duration: 1.1 + i * 0.22, ease: 'power3.out' });
    });
  };

  gsap.set(reels, { y: 0 });
  ScrollTrigger.create({ trigger: box, start: 'top 85%', once: true, onEnter: roll });
  document.querySelector('[data-code-roll]')?.addEventListener('click', roll);
}

function pointsCard() {
  const bar = document.querySelector('[data-points-bar]');
  const num = document.querySelector('[data-points]');
  if (!bar) return;
  const C = 2 * Math.PI * 50;
  const run = () => {
    const counter = { v: 0 };
    gsap.fromTo(bar, { strokeDashoffset: C }, { strokeDashoffset: C * (1 - 0.72), duration: reduceMotion ? 0 : 1.8, ease: 'power3.out' });
    gsap.to(counter, {
      v: 1250,
      duration: reduceMotion ? 0 : 1.8,
      ease: 'power3.out',
      onUpdate: () => (num.textContent = Math.round(counter.v).toLocaleString('en-US')),
    });
  };
  ScrollTrigger.create({ trigger: bar, start: 'top 85%', once: true, onEnter: run });
  bar.closest('.card').addEventListener('click', run);
}

function giftCard() {
  const area = document.querySelector('[data-gift-area]');
  const gift = document.querySelector('[data-gift]');
  if (!area || !gift) return;

  if (!reduceMotion) {
    gsap.to(gift, { y: -8, rotation: -2, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  }
  if (!finePointer || reduceMotion) return;

  const card = area.closest('.card');
  const rx = gsap.quickTo(gift, 'rotationX', { duration: 0.6, ease: 'power3' });
  const ry = gsap.quickTo(gift, 'rotationY', { duration: 0.6, ease: 'power3' });
  card.addEventListener('pointermove', (e) => {
    const r = gift.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    ry(nx * 26);
    rx(-ny * 22);
    gift.style.setProperty('--gx', `${(nx + 0.5) * 100}%`);
    gift.style.setProperty('--gy', `${(ny + 0.5) * 100}%`);
  });
  card.addEventListener('pointerleave', () => {
    rx(0);
    ry(0);
  });
}

function ageCard() {
  const root = document.querySelector('[data-age]');
  if (!root) return;
  const textEl = root.querySelector('[data-age-text]');
  const lock = root.querySelector('[data-age-lock]');
  const ok = root.querySelector('[data-age-ok]');
  const dui = '04567891-2';
  const typed = { n: 0 };

  const setLock = (open) => {
    lock.classList.toggle('is-open', open);
    lock.innerHTML = icon(open ? 'lock-open' : 'lock');
  };

  if (reduceMotion) {
    textEl.textContent = dui;
    setLock(true);
    return;
  }

  const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.6, paused: true });
  tl.call(() => {
    textEl.textContent = '';
    setLock(false);
  })
    .set(ok, { opacity: 0, y: 8 })
    .set(typed, { n: 0 })
    .to({}, { duration: 0.6 })
    .to(typed, {
      n: dui.length,
      duration: 1.6,
      ease: `steps(${dui.length})`,
      onUpdate: () => (textEl.textContent = dui.slice(0, Math.round(typed.n))),
    })
    .call(() => setLock(true), null, '+=0.35')
    .fromTo(lock, { scale: 0.7 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' })
    .to(ok, { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(2)' }, '-=0.4')
    .to({}, { duration: 2.4 });

  whileVisible(root, tl);
}

async function qrCard() {
  const el = document.querySelector('[data-qr]');
  if (!el) return;
  try {
    el.innerHTML = await QRCode.toString(STORE_URL, {
      type: 'svg',
      margin: 0,
      errorCorrectionLevel: 'M',
      color: { dark: '#001a29', light: '#ffffff' },
    });
  } catch {
    el.innerHTML = icon('qr');
  }
}

function seasonCard() {
  const root = document.querySelector('[data-season]');
  if (!root) return;
  const seasons = [
    { label: 'Día del cariño', text: 'Día del cariño — llévele algo a quien quiere', color: '#be185d', bits: ['♥', '♥', '♡'] },
    { label: 'Fiestas agostinas', text: 'Felices fiestas agostinas, San Salvador', color: '#0f47af', bits: ['✦', '•', '✧'] },
    { label: 'Regreso a clases', text: 'Regreso a clases — imprima sus tareas aquí', color: '#c2410c', bits: ['✎', '•', '✦'] },
    { label: 'Navidad', text: 'Feliz Navidad de parte de Tienda la 635', color: '#15803d', bits: ['❄', '✦', '•'] },
  ];
  const btns = root.querySelector('[data-season-btns]');
  const ribbon = root.querySelector('[data-season-ribbon]');
  const text = root.querySelector('[data-season-text]');
  const confetti = root.querySelector('[data-season-confetti]');
  let current = -1;
  let auto = null;

  btns.innerHTML = seasons
    .map((s, i) => `<button type="button" aria-pressed="false" style="--s:${s.color}" data-i="${i}">${s.label}</button>`)
    .join('');

  const setSeason = (i, animate = true) => {
    if (i === current) return;
    current = i;
    const s = seasons[i];
    btns.querySelectorAll('button').forEach((b, k) => {
      b.classList.toggle('is-active', k === i);
      b.setAttribute('aria-pressed', String(k === i));
    });
    ribbon.style.setProperty('--s', s.color);

    if (!animate || reduceMotion) {
      text.textContent = s.text;
      return;
    }
    gsap
      .timeline()
      .to(text, { yPercent: -120, opacity: 0, duration: 0.25, ease: 'power2.in' })
      .call(() => (text.textContent = s.text))
      .fromTo(text, { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.45, ease: 'power3.out' });

    // Lluvia chiquita con los símbolos de la temporada.
    for (let k = 0; k < 14; k++) {
      const bit = document.createElement('span');
      bit.textContent = s.bits[k % s.bits.length];
      bit.style.color = s.color;
      bit.style.left = `${Math.random() * 100}%`;
      confetti.appendChild(bit);
      gsap.fromTo(
        bit,
        { y: -10, opacity: 1, rotate: 0, scale: 0.6 + Math.random() * 0.8 },
        {
          y: 170 + Math.random() * 60,
          x: (Math.random() - 0.5) * 60,
          rotate: (Math.random() - 0.5) * 240,
          opacity: 0,
          duration: 1.6 + Math.random(),
          delay: Math.random() * 0.4,
          ease: 'power1.in',
          onComplete: () => bit.remove(),
        }
      );
    }
  };

  setSeason(0, false);

  btns.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    clearInterval(auto);
    auto = null;
    setSeason(Number(b.dataset.i));
  });

  if (reduceMotion) return;
  ScrollTrigger.create({
    trigger: root,
    start: 'top 85%',
    end: 'bottom 15%',
    onToggle(self) {
      if (self.isActive && auto === null && !root.dataset.touched) {
        auto = setInterval(() => setSeason((current + 1) % seasons.length), 3200);
      } else if (!self.isActive) {
        clearInterval(auto);
        auto = null;
      }
    },
  });
  btns.addEventListener('click', () => (root.dataset.touched = '1'));
}
