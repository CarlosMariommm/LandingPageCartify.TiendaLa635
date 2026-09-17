import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PRODUCTS, CATEGORIES, CAT_LABEL, byId, money, normalize } from './data.js';
import { icon } from './icons.js';
import { STORE_URL, reduceMotion } from '../config.js';

export function initStore(root) {
  if (!root) return;

  const $ = (sel) => root.querySelector(sel);
  const grid = $('[data-grid]');
  const pills = $('[data-pills]');
  const ind = $('[data-pill-ind]');
  const search = $('[data-search]');
  const empty = $('[data-empty]');
  const badge = $('[data-badge]');
  const cartBtn = $('[data-open-cart]');
  const list = $('[data-cart-list]');
  const cartEmpty = $('[data-cart-empty]');
  const subtotal = $('[data-subtotal]');
  const payBtn = $('[data-pay]');
  const done = $('[data-cart-done]');
  const toastEl = $('[data-toast]');

  const state = { cat: 'todos', q: '', cart: new Map(), favs: new Set() };

  /* ---------- Render inicial ---------- */
  pills.insertAdjacentHTML(
    'beforeend',
    CATEGORIES.map(
      (c, i) =>
        `<button class="pill${i === 0 ? ' is-active' : ''}" type="button" role="tab" aria-selected="${i === 0}" data-cat="${c.id}">${c.label}</button>`
    ).join('')
  );

  grid.innerHTML = PRODUCTS.map(
    (p) => `
    <article class="pcard" data-id="${p.id}">
      <div class="pcard__img"><img src="${p.img}" alt="${p.name}" loading="lazy"${p.zoom ? ` style="scale:${p.zoom}"` : ''} /></div>
      ${p.tag ? `<span class="pcard__tag">${p.tag}</span>` : ''}
      <button class="pcard__fav" type="button" aria-label="Guardar ${p.name} en favoritos" aria-pressed="false" data-fav>${icon('heart')}</button>
      <p class="pcard__cat">${CAT_LABEL[p.cat]}</p>
      <h3 class="pcard__name">${p.name}</h3>
      <div class="pcard__row">
        <span class="pcard__price">${money(p.price)}</span>
        <button class="pcard__add" type="button" aria-label="Agregar ${p.name} al carrito" data-add>${icon('plus')}</button>
      </div>
    </article>`
  ).join('') +
    `<a class="pcard pcard--more" href="${STORE_URL}" target="_blank" rel="noopener" data-more>
      <div><b>¿Busca algo más?</b><p>Lácteos, pan dulce y mucho más en la tienda real.</p></div>
      <span class="pcard__go">${icon('arrow-up-right')}</span>
    </a>`;

  const cards = [...grid.querySelectorAll('.pcard:not([data-more])')];
  const more = grid.querySelector('[data-more]');
  moveIndicator(false);
  window.addEventListener('resize', () => moveIndicator(false));
  document.fonts?.ready.then(() => moveIndicator(false));

  /* ---------- Filtros ---------- */
  pills.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cat]');
    if (!btn || btn.dataset.cat === state.cat) return;
    state.cat = btn.dataset.cat;
    pills.querySelectorAll('.pill').forEach((p) => {
      const on = p === btn;
      p.classList.toggle('is-active', on);
      p.setAttribute('aria-selected', String(on));
    });
    moveIndicator(true);
    applyFilter();
  });

  let searchTimer;
  search.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.q = normalize(search.value.trim());
      applyFilter();
    }, 120);
  });

  empty.addEventListener('click', (e) => {
    const t = e.target.closest('[data-try]');
    if (!t) return;
    search.value = t.dataset.try;
    state.q = t.dataset.try;
    applyFilter();
  });

  function moveIndicator(animate) {
    const active = pills.querySelector('.pill.is-active');
    if (!active) return;
    const props = { x: active.offsetLeft, width: active.offsetWidth };
    if (animate && !reduceMotion) gsap.to(ind, { ...props, duration: 0.55, ease: 'power3.inOut' });
    else gsap.set(ind, props);
  }

  let refreshTimer;
  function applyFilter() {
    const flipState = Flip.getState([...cards, more]);
    let visible = 0;
    cards.forEach((card) => {
      const p = byId(card.dataset.id);
      const matchCat = state.cat === 'todos' || p.cat === state.cat;
      const matchQ = !state.q || normalize(p.name).includes(state.q) || p.aliases.some((a) => a.includes(state.q));
      const show = matchCat && matchQ;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    empty.hidden = visible > 0;
    if (!visible) $('[data-empty-q]').textContent = search.value.trim();

    // El alto de la sección cambia: las secciones de abajo recalculan su posición.
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 800);

    if (reduceMotion) return;
    Flip.from(flipState, {
      duration: 0.6,
      ease: 'power3.inOut',
      scale: true,
      absolute: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.5, delay: 0.15 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.8, duration: 0.35 }),
    });
  }

  /* ---------- Tarjetas ---------- */
  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.pcard');
    if (!card) return;
    const p = byId(card.dataset.id);

    if (e.target.closest('[data-add]')) {
      addToCart(p, card.querySelector('img'));
      const btn = e.target.closest('[data-add]');
      gsap.fromTo(btn, { rotate: -90 }, { rotate: 0, duration: 0.5, ease: 'back.out(2)' });
    }

    const fav = e.target.closest('[data-fav]');
    if (fav) toggleFav(p, fav);
  });

  function toggleFav(p, btn) {
    const on = !state.favs.has(p.id);
    on ? state.favs.add(p.id) : state.favs.delete(p.id);
    btn.classList.toggle('is-on', on);
    btn.setAttribute('aria-pressed', String(on));
    if (reduceMotion) return;
    gsap.fromTo(btn, { scale: on ? 0.6 : 1.2 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    if (!on) return;
    // Chispitas alrededor del corazón.
    for (let i = 0; i < 7; i++) {
      const dot = document.createElement('span');
      dot.className = 'burst';
      btn.appendChild(dot);
      const angle = (i / 7) * Math.PI * 2;
      gsap.set(dot, { left: '50%', top: '50%', xPercent: -50, yPercent: -50 });
      gsap.to(dot, {
        x: Math.cos(angle) * 24,
        y: Math.sin(angle) * 24,
        scale: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => dot.remove(),
      });
    }
  }

  /* ---------- Carrito ---------- */
  function addToCart(p, img) {
    state.cart.set(p.id, (state.cart.get(p.id) || 0) + 1);
    renderCart();
    if (reduceMotion || !img) {
      bumpBadge();
    } else {
      flyToCart(img);
    }
    toast(`${p.name} agregado`);
  }

  function flyToCart(img) {
    const from = img.getBoundingClientRect();
    const to = cartBtn.getBoundingClientRect();
    const clone = img.cloneNode();
    clone.className = 'fly';
    Object.assign(clone.style, {
      left: `${from.left}px`,
      top: `${from.top}px`,
      width: `${from.width}px`,
      height: `${from.height}px`,
    });
    document.body.appendChild(clone);
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);

    gsap
      .timeline({ onComplete: () => (clone.remove(), bumpBadge()) })
      .to(clone, { x: dx, duration: 0.8, ease: 'power1.inOut' }, 0)
      .to(clone, { y: dy, duration: 0.8, ease: 'back.in(2.2)' }, 0)
      .to(clone, { scale: 0.12, rotate: 25, duration: 0.8, ease: 'power2.in' }, 0);
  }

  function bumpBadge() {
    const count = [...state.cart.values()].reduce((a, b) => a + b, 0);
    badge.textContent = count;
    if (reduceMotion) return;
    gsap.fromTo(badge, { scale: 1.8 }, { scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
    gsap.fromTo(cartBtn, { rotate: -14 }, { rotate: 0, duration: 0.8, ease: 'elastic.out(1.2, 0.3)' });
  }

  function renderCart() {
    const entries = [...state.cart.entries()];
    cartEmpty.hidden = entries.length > 0;
    payBtn.disabled = entries.length === 0;
    let total = 0;
    list.innerHTML = entries
      .map(([id, qty]) => {
        const p = byId(id);
        total += p.price * qty;
        return `<li data-id="${id}">
          <i><img src="${p.img}" alt="" /></i>
          <div><b>${p.name}</b><small>${money(p.price)} c/u</small></div>
          <div class="stepper">
            <button type="button" aria-label="Quitar uno" data-dec>${icon('minus')}</button>
            <b>${qty}</b>
            <button type="button" aria-label="Agregar uno" data-inc>${icon('plus')}</button>
          </div>
        </li>`;
      })
      .join('');
    subtotal.textContent = money(total);
    if (!entries.length) badge.textContent = '0';
  }

  list.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    const id = li.dataset.id;
    const qty = state.cart.get(id) || 0;
    if (e.target.closest('[data-inc]')) state.cart.set(id, qty + 1);
    else if (e.target.closest('[data-dec]')) qty <= 1 ? state.cart.delete(id) : state.cart.set(id, qty - 1);
    else return;
    renderCart();
    badge.textContent = [...state.cart.values()].reduce((a, b) => a + b, 0);
  });

  const drawer = $('[data-drawer]');
  const openCart = () => {
    // El panel se abre donde la persona está mirando, no arriba de todo.
    const r = root.getBoundingClientRect();
    const h = Math.min(root.clientHeight, window.innerHeight - 40, 660);
    const top = gsap.utils.clamp(0, root.clientHeight - h, 90 - r.top);
    drawer.style.top = `${top}px`;
    drawer.style.height = `${h}px`;
    drawer.classList.toggle('is-floating', h < root.clientHeight);
    root.classList.add('cart-open');
    done.hidden = true;
    if (!reduceMotion) gsap.from(list.children, { x: 40, opacity: 0, stagger: 0.05, duration: 0.5, delay: 0.15, ease: 'power3.out' });
  };
  const closeCart = () => root.classList.remove('cart-open');

  cartBtn.addEventListener('click', openCart);
  root.querySelectorAll('[data-close-cart]').forEach((el) => el.addEventListener('click', closeCart));
  root.addEventListener('keydown', (e) => e.key === 'Escape' && closeCart());

  payBtn.addEventListener('click', () => {
    done.hidden = false;
    if (reduceMotion) return;
    gsap.fromTo(done.children, { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.07, duration: 0.5, ease: 'power3.out' });
    gsap.fromTo('.done-check circle', { strokeDashoffset: 214 }, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.out' });
    gsap.fromTo('.done-check path', { strokeDashoffset: 50 }, { strokeDashoffset: 0, duration: 0.45, delay: 0.5, ease: 'power2.out' });
  });

  $('[data-reset-cart]').addEventListener('click', () => {
    state.cart.clear();
    renderCart();
    closeCart();
  });

  /* ---------- Aviso ---------- */
  let toastTl;
  function toast(text) {
    toastEl.innerHTML = `${icon('check')} ${text}`;
    toastTl?.kill();
    if (reduceMotion) {
      toastEl.style.opacity = 1;
      clearTimeout(toast.t);
      toast.t = setTimeout(() => (toastEl.style.opacity = 0), 1800);
      return;
    }
    toastTl = gsap
      .timeline()
      .fromTo(toastEl, { opacity: 0, y: 20, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(2)' })
      .to(toastEl, { opacity: 0, y: 10, duration: 0.3, ease: 'power2.in' }, '+=1.4');
  }

  renderCart();
}
