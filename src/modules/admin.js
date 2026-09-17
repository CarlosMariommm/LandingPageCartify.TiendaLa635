import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { icon } from './icons.js';
import { reduceMotion, finePointer } from '../config.js';

const WEEK = [
  { d: 'Lun', v: 812 },
  { d: 'Mar', v: 945 },
  { d: 'Mié', v: 760 },
  { d: 'Jue', v: 1102 },
  { d: 'Vie', v: 1390 },
  { d: 'Sáb', v: 1528 },
  { d: 'Hoy', v: 1284.5, today: true },
];

const CASCADE = {
  tienda: {
    nodes: [
      { k: 'Módulo', v: 'Tienda' },
      { k: 'Categoría', v: 'Snacks' },
      { k: 'Proveedor', v: 'Distribuidora La Central', tag: 'Obligatorio' },
      { k: 'Marca', v: 'Takis' },
      { k: 'Producto', v: 'Takis Originales', img: '/img/takis-originales.png', stock: 0.64, stockText: 'Stock 48' },
    ],
    note: 'En Tienda, cada producto necesita proveedor: al elegirlo, solo aparecen sus marcas.',
  },
  impresiones: {
    nodes: [
      { k: 'Módulo', v: 'Impresiones' },
      { k: 'Categoría', v: 'Fotografías' },
      { k: 'Proveedor', v: 'Sin proveedor', tag: 'Opcional', dashed: true },
      { k: 'Marca', v: '—', dashed: true },
      { k: 'Producto', v: 'Foto pasaporte 4 × 4 cm', icon: 'printer' },
    ],
    note: 'En Impresiones el proveedor es opcional: el formulario se adapta solo.',
  },
};

const PERMS = [
  { label: 'Dashboard', admin: true, emp: true },
  { label: 'Pedidos y entregas', admin: true, emp: true },
  { label: 'Inventario y precios', admin: true, emp: false },
  { label: 'Proveedores, marcas y categorías', admin: true, emp: false },
  { label: 'Empleados y clientes', admin: true, emp: false },
  { label: 'Promociones, fidelidad y tarjetas', admin: true, emp: false },
  { label: 'Personalización de la tienda', admin: true, emp: false },
];

export function initAdmin(root) {
  if (!root) return;
  const tabs = [...root.querySelectorAll('[data-tab]')];
  const panels = [...root.querySelectorAll('[data-panel]')];
  const played = new Set();
  let current = 'dashboard';

  /* ---------- Pestañas ---------- */
  function select(name, focus = false) {
    if (name === current) return;
    const prev = panels.find((p) => p.dataset.panel === current);
    const next = panels.find((p) => p.dataset.panel === name);
    current = name;
    tabs.forEach((t) => {
      const on = t.dataset.tab === name;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    prev.hidden = true;
    prev.classList.remove('is-active');
    next.hidden = false;
    next.classList.add('is-active');
    if (!reduceMotion) gsap.fromTo(next, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
    intro(name);
  }

  tabs.forEach((t) => t.addEventListener('click', () => select(t.dataset.tab)));
  root.querySelector('[role="tablist"]').addEventListener('keydown', (e) => {
    if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    const i = tabs.findIndex((t) => t.dataset.tab === current);
    const dir = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1;
    select(tabs[(i + dir + tabs.length) % tabs.length].dataset.tab, true);
  });

  function intro(name) {
    if (name === 'dashboard') dashboardIntro();
    if (name === 'inventario') cascadeIntro();
    if (name === 'reportes' && !played.has('reportes')) pdfIntro();
    if (name === 'roles') rolesIntro();
    played.add(name);
  }

  /* ---------- Dashboard ---------- */
  const barsEl = root.querySelector('[data-bars]');
  const max = Math.max(...WEEK.map((w) => w.v));
  barsEl.innerHTML = WEEK.map(
    (w) => `<div class="bar${w.today ? ' is-today' : ''}">
      <span class="bar__tip" style="bottom:calc(${(w.v / max) * 82}% + 30px)">$${w.v.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      <span class="bar__fill" style="height:${(w.v / max) * 82}%"></span>
      <span class="bar__day">${w.d}</span>
    </div>`
  ).join('');

  if (!finePointer) root.querySelector('.chart__head small').textContent = 'Toque una barra para ver el monto';

  function dashboardIntro() {
    root.querySelectorAll('[data-count]').forEach((el) => {
      const end = parseFloat(el.dataset.count);
      const dec = Number(el.dataset.decimals || 0);
      const pre = el.dataset.prefix || '';
      const o = { v: 0 };
      gsap.to(o, {
        v: end,
        duration: reduceMotion ? 0 : 1.6,
        ease: 'power3.out',
        onUpdate: () => (el.textContent = pre + o.v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })),
      });
    });
    if (!reduceMotion) {
      gsap.fromTo(barsEl.querySelectorAll('.bar__fill'), { scaleY: 0 }, { scaleY: 1, duration: 1, stagger: 0.07, ease: 'power3.out' });
      gsap.from(root.querySelectorAll('.kpi'), { y: 20, opacity: 0, stagger: 0.08, duration: 0.6, ease: 'power3.out' });
    }
  }

  ScrollTrigger.create({ trigger: root, start: 'top 75%', once: true, onEnter: () => current === 'dashboard' && dashboardIntro() });

  /* ---------- Inventario ---------- */
  const cascade = root.querySelector('[data-cascade]');
  const modBox = root.querySelector('[data-module]');
  let mod = 'tienda';

  const barcode = () => {
    let x = 0;
    const lines = [];
    const pattern = [2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 2];
    pattern.forEach((w, i) => {
      if (i % 2 === 0) lines.push(`<rect x="${x}" y="0" width="${w}" height="22" />`);
      x += w + 1;
    });
    return `<svg class="barcode" viewBox="0 0 ${x} 22" preserveAspectRatio="none" fill="#1c1614">${lines.join('')}</svg>`;
  };

  function renderCascade() {
    const data = CASCADE[mod];
    cascade.innerHTML =
      data.nodes
        .map((n, i) => {
          const last = i === data.nodes.length - 1;
          const visual = n.img
            ? `<div class="node__img"><img src="${n.img}" alt="" /></div>`
            : n.icon
              ? `<div class="node__img">${icon(n.icon)}</div>`
              : '';
          return `<div class="node${n.dashed ? ' is-dashed' : ''}${last ? ' node--product' : ''}">
            ${visual}
            <small>${n.k}</small><b>${n.v}</b>
            ${n.tag ? `<em class="${n.tag === 'Opcional' ? 'is-opt' : ''}">${n.tag}</em>` : ''}
            ${n.stock ? `<div class="stock"><i style="width:${n.stock * 100}%"></i></div><small style="margin-top:4px;text-transform:none;letter-spacing:0">${n.stockText}</small>` : ''}
            ${last && n.img ? barcode() : ''}
          </div>`;
        })
        .join('') + `<p class="cascade__note">${data.note}</p>`;
  }

  function cascadeIntro() {
    if (reduceMotion) return;
    const nodes = cascade.querySelectorAll('.node');
    gsap.set(nodes, { '--link': 0 });
    gsap
      .timeline()
      .from(nodes, { x: -20, opacity: 0, stagger: 0.14, duration: 0.5, ease: 'power3.out' })
      .to(nodes, { '--link': 1, stagger: 0.14, duration: 0.3, ease: 'power2.out' }, 0.3)
      .from(cascade.querySelectorAll('.stock i'), { scaleX: 0, duration: 0.8, ease: 'power3.out' }, 0.8)
      .from(cascade.querySelector('.cascade__note'), { opacity: 0, y: 10, duration: 0.5 }, 0.9);
  }

  modBox.addEventListener('click', (e) => {
    const b = e.target.closest('[data-mod]');
    if (!b || b.dataset.mod === mod) return;
    mod = b.dataset.mod;
    modBox.querySelectorAll('button').forEach((x) => x.classList.toggle('is-active', x === b));
    renderCascade();
    cascadeIntro();
  });
  renderCascade();

  /* ---------- Reportes ---------- */
  const pdf = root.querySelector('[data-pdf]');
  const genBtn = root.querySelector('[data-gen-pdf]');

  function pdfIntro() {
    if (reduceMotion) return;
    gsap
      .timeline()
      .fromTo(pdf, { yPercent: -105 }, { yPercent: 0, duration: 1.6, ease: 'steps(14)' })
      .from(pdf.querySelectorAll('tbody tr'), { opacity: 0, x: -10, stagger: 0.08, duration: 0.3 }, 0.6)
      .from(pdf.querySelector('.pdf__total'), { opacity: 0, duration: 0.3 }, '-=0.1');
  }

  genBtn.addEventListener('click', () => {
    const original = genBtn.innerHTML;
    genBtn.disabled = true;
    genBtn.innerHTML = `${icon('rotate')} Generando…`;
    gsap.to(genBtn.querySelector('.ic'), { rotate: 360, duration: 0.7, repeat: 1, ease: 'none' });
    setTimeout(() => {
      pdfIntro();
      genBtn.innerHTML = `${icon('check')} Listo`;
      setTimeout(() => {
        genBtn.innerHTML = original;
        genBtn.disabled = false;
      }, 1600);
    }, reduceMotion ? 0 : 900);
  });

  /* ---------- Roles ---------- */
  const permsEl = root.querySelector('[data-perms]');
  const roleBox = root.querySelector('[data-role]');
  const boxes = [...root.querySelectorAll('[data-2fa] i')];
  const ok2fa = root.querySelector('[data-2fa-ok]');
  let role = 'admin';

  function renderPerms(animate) {
    permsEl.innerHTML = PERMS.map((p) => {
      const on = role === 'admin' ? p.admin : p.emp;
      return `<li class="${on ? '' : 'is-off'}"><span class="perms__ic">${icon(on ? 'check' : 'lock')}</span>${p.label}</li>`;
    }).join('');
    if (animate && !reduceMotion) {
      gsap.from(permsEl.children, { x: -14, opacity: 0, stagger: 0.05, duration: 0.4, ease: 'power3.out' });
    }
  }

  let twofaTl;
  function rolesIntro() {
    renderPerms(true);
    const code = '635482';
    twofaTl?.kill();
    boxes.forEach((b) => {
      b.textContent = '';
      b.classList.remove('is-filled');
    });
    gsap.set(ok2fa, { opacity: 0, y: 6 });
    twofaTl = gsap.timeline({ delay: 0.4 });
    boxes.forEach((b, i) =>
      twofaTl.call(
        () => {
          b.textContent = code[i];
          b.classList.add('is-filled');
          if (!reduceMotion) gsap.fromTo(b, { scale: 1.25 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' });
        },
        null,
        i * (reduceMotion ? 0 : 0.18)
      )
    );
    twofaTl.to(ok2fa, { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(2)' }, '+=0.25');
  }

  roleBox.addEventListener('click', (e) => {
    const b = e.target.closest('[data-r]');
    if (!b || b.dataset.r === role) return;
    role = b.dataset.r;
    roleBox.querySelectorAll('button').forEach((x) => x.classList.toggle('is-active', x === b));
    renderPerms(true);
  });
  renderPerms(false);
}
