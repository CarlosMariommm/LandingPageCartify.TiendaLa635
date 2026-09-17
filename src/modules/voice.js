import gsap from 'gsap';
import { PRODUCTS, byId, money, normalize } from './data.js';
import { reduceMotion } from '../config.js';

const NUMBERS = {
  un: 1, uno: 1, una: 1, unos: 1, unas: 1, par: 2,
  dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
};

// Alias normalizados, los de más palabras primero ("coca cola" antes que "coca").
const ALIASES = PRODUCTS.flatMap((p) => p.aliases.map((a) => ({ id: p.id, words: normalize(a).split(' ') }))).sort(
  (a, b) => b.words.length - a.words.length
);

/** "quiero una manzana y dos coca colas" → [{id:'manzana', qty:1}, {id:'coca', qty:2}] */
export function parseOrder(text) {
  const tokens = normalize(text)
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const found = new Map();
  let lastEnd = 0;

  for (let i = 0; i < tokens.length; i++) {
    const hit = ALIASES.find((a) => a.words.every((w, k) => tokens[i + k] === w));
    if (!hit) continue;

    let qty = 1;
    for (let j = i - 1; j >= Math.max(lastEnd, i - 3); j--) {
      const t = tokens[j];
      if (/^\d+$/.test(t)) { qty = Math.min(parseInt(t, 10), 20); break; }
      if (NUMBERS[t]) { qty = NUMBERS[t]; break; }
    }
    found.set(hit.id, (found.get(hit.id) || 0) + qty);
    i += hit.words.length - 1;
    lastEnd = i + 1;
  }
  return [...found.entries()].map(([id, qty]) => ({ id, qty }));
}

const listText = (items) => {
  const parts = items.map(({ id, qty }) => `${qty} ${byId(id).name}`);
  return parts.length > 1 ? `${parts.slice(0, -1).join(', ')} y ${parts.at(-1)}` : parts[0];
};

const sleep = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? Math.min(ms, 60) : ms));

export function initVoice(root) {
  if (!root) return;
  const $ = (s) => root.querySelector(s);
  const mic = $('[data-mic]');
  const wave = $('[data-wave]');
  const status = $('[data-voice-status]');
  const userB = $('[data-bubble-user]');
  const botB = $('[data-bubble-bot]');
  const list = $('[data-vcart-list]');
  const totalEl = $('[data-vcart-total]');
  const hint = $('[data-voice-hint]');
  const chips = [...root.querySelectorAll('[data-phrase]')];

  const cart = new Map();
  let busy = false;
  let demoIndex = 0;
  let total = 0;

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  hint.textContent = SR
    ? 'O toque el micrófono y háblele de verdad (funciona en Chrome y Edge).'
    : 'Toque una frase o el micrófono para ver una demostración.';

  /* ---------- Onda ---------- */
  wave.innerHTML = '<i></i>'.repeat(28);
  const bars = [...wave.children];
  let waveTimer = null;
  const startWave = () => {
    if (reduceMotion) return;
    stopWave();
    waveTimer = setInterval(() => {
      bars.forEach((b, i) => {
        const center = 1 - Math.abs(i - bars.length / 2) / (bars.length / 2);
        gsap.to(b, { height: 6 + Math.random() * 38 * (0.35 + center), duration: 0.12, ease: 'power1.out' });
      });
    }, 110);
  };
  const stopWave = () => {
    clearInterval(waveTimer);
    gsap.to(bars, { height: 5, duration: 0.3, stagger: 0.008 });
  };

  const setMode = (mode) => {
    root.classList.toggle('is-listening', mode === 'listening');
    root.classList.toggle('is-thinking', mode === 'thinking');
    busy = mode !== 'idle';
    chips.forEach((c) => (c.disabled = busy));
  };

  const show = (el, html) => {
    el.hidden = false;
    el.innerHTML = html;
  };

  /* ---------- Respuesta ---------- */
  async function answer(text, { speak = false } = {}) {
    setMode('thinking');
    status.textContent = 'Buscando productos…';
    show(botB, '<span class="typing"><i></i><i></i><i></i></span>');
    if (!reduceMotion) gsap.fromTo(botB, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 });
    await sleep(950);

    const items = parseOrder(text);
    let reply;
    if (!items.length) {
      reply = 'No encontré esos productos en la demostración. Pruebe con frutas, snacks o bebidas.';
    } else {
      reply = `Listo, agregué ${listText(items)} a su carrito.`;
      items.forEach(({ id, qty }) => cart.set(id, (cart.get(id) || 0) + qty));
      renderCart(items.map((i) => i.id));
    }
    botB.textContent = reply;
    if (speak) say(reply);

    status.textContent = 'Toque el micrófono y hable.';
    setMode('idle');
  }

  function renderCart(changed = []) {
    const prevTotal = total;
    total = [...cart.entries()].reduce((sum, [id, q]) => sum + byId(id).price * q, 0);
    list.innerHTML = [...cart.entries()]
      .map(([id, q]) => {
        const p = byId(id);
        return `<li data-id="${id}"><i><img src="${p.img}" alt="" /></i><span>${p.name}<small>×${q}</small></span><b>${money(p.price * q)}</b></li>`;
      })
      .join('');

    const fresh = changed.map((id) => list.querySelector(`[data-id="${id}"]`)).filter(Boolean);
    if (!reduceMotion) {
      gsap.from(fresh, { x: -24, opacity: 0, backgroundColor: 'rgba(0,154,235,0.25)', stagger: 0.12, duration: 0.6, ease: 'power3.out', clearProps: 'backgroundColor' });
      list.scrollTop = list.scrollHeight;
    }
    const counter = { v: prevTotal };
    gsap.to(counter, {
      v: total,
      duration: reduceMotion ? 0 : 0.9,
      ease: 'power2.out',
      onUpdate: () => (totalEl.textContent = money(counter.v)),
    });
  }

  /* ---------- Demostración escrita ---------- */
  async function simulate(phrase) {
    if (busy) return;
    setMode('listening');
    status.textContent = 'Escuchando…';
    startWave();
    botB.hidden = true;
    show(userB, '');
    if (!reduceMotion) gsap.fromTo(userB, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35 });

    const words = phrase.split(' ');
    for (let i = 0; i < words.length; i++) {
      userB.textContent = `“${words.slice(0, i + 1).join(' ')}”`;
      await sleep(150 + Math.random() * 90);
    }
    await sleep(350);
    stopWave();
    await answer(phrase);
  }

  chips.forEach((c) => c.addEventListener('click', () => simulate(c.dataset.phrase)));

  /* ---------- Micrófono real ---------- */
  mic.addEventListener('click', () => {
    if (busy) return;
    if (!SR) {
      simulate(chips[demoIndex++ % chips.length].dataset.phrase);
      return;
    }

    const rec = new SR();
    rec.lang = 'es-SV';
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    let finalText = '';
    let failed = false;

    setMode('listening');
    status.textContent = 'Escuchando… diga, por ejemplo, “quiero dos takis”.';
    botB.hidden = true;
    show(userB, '…');
    startWave();

    rec.onresult = (e) => {
      const text = [...e.results].map((r) => r[0].transcript).join(' ');
      userB.textContent = `“${text}”`;
      if (e.results[e.results.length - 1].isFinal) finalText = text;
    };
    rec.onerror = (e) => {
      failed = true;
      stopWave();
      setMode('idle');
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed' || e.error === 'audio-capture') {
        userB.hidden = true;
        status.textContent = 'Sin acceso al micrófono. Le muestro una demostración.';
        setTimeout(() => simulate(chips[demoIndex++ % chips.length].dataset.phrase), 900);
      } else {
        userB.hidden = true;
        status.textContent = 'No le escuché bien. Intente de nuevo.';
      }
    };
    rec.onend = () => {
      if (failed) return;
      stopWave();
      if (finalText) answer(finalText, { speak: true });
      else {
        setMode('idle');
        userB.hidden = true;
        status.textContent = 'No le escuché. Toque el micrófono e intente de nuevo.';
      }
    };

    try {
      rec.start();
    } catch {
      failed = true;
      stopWave();
      setMode('idle');
      simulate(chips[0].dataset.phrase);
    }
  });

  function say(text) {
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'es-419';
    const voice = speechSynthesis.getVoices().find((v) => v.lang.startsWith('es'));
    if (voice) u.voice = voice;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }
}
