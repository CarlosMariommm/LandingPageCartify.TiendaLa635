import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollTo } from './scroll.js';
import { reduceMotion } from '../config.js';

export function initApp(section) {
  if (!section) return;
  const steps = [...section.querySelectorAll('[data-step]')];
  const screens = [...section.querySelectorAll('[data-screen]')];
  const bars = steps.map((s) => s.querySelector('.steps__bar i'));
  const phone = section.querySelector('[data-phone]');
  const said = section.querySelector('[data-sv-said]');
  let active = 0;

  /* ---------- Cambio de pantalla ---------- */
  function setActive(i, animate = true) {
    if (i === active) return;
    const prev = screens[active];
    const next = screens[i];
    active = i;
    steps.forEach((s, k) => s.classList.toggle('is-active', k === i));

    if (!animate || reduceMotion) {
      prev.classList.remove('is-active');
      next.classList.add('is-active');
      gsap.set(prev, { autoAlpha: 0 });
      gsap.set(next, { autoAlpha: 1 });
    } else {
      gsap.to(prev, {
        autoAlpha: 0,
        scale: 0.94,
        y: -20,
        duration: 0.45,
        ease: 'power2.in',
        overwrite: true,
        onComplete: () => screens[active] !== prev && prev.classList.remove('is-active'),
      });
      next.classList.add('is-active');
      gsap.fromTo(next, { autoAlpha: 0, scale: 1.04, y: 40 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.15, overwrite: true });
      gsap.fromTo(phone, { rotationZ: 0 }, { rotationZ: i % 2 ? 2 : -2, duration: 0.3, yoyo: true, repeat: 1, ease: 'power2.out' });
    }
    enterScreen(i);
  }

  function enterScreen(i) {
    if (reduceMotion) return;
    const s = screens[i];
    if (i === 0) {
      gsap.from(s.querySelectorAll('.s-promo, .s-cats span, .s-card'), { y: 24, opacity: 0, stagger: 0.05, duration: 0.6, delay: 0.3, ease: 'power3.out' });
    }
    if (i === 1) {
      const text = '“quiero unas uvas verdes”';
      const o = { n: 0 };
      gsap.set(s.querySelectorAll('.sv-reply, .sv-cartpill'), { opacity: 0, y: 16 });
      gsap
        .timeline({ delay: 0.4 })
        .to(o, { n: text.length, duration: 1.2, ease: 'none', onUpdate: () => (said.textContent = text.slice(0, Math.round(o.n))) })
        .to(s.querySelector('.sv-reply'), { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.8)' }, '+=0.3')
        .to(s.querySelector('.sv-cartpill'), { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.2');
    }
    if (i === 2) {
      gsap.from(s.querySelectorAll('.st-card, .st-steps span, .st-code i'), { y: 20, opacity: 0, stagger: 0.04, duration: 0.5, delay: 0.3, ease: 'power3.out' });
    }
  }

  /* ---------- Repartidor del teléfono ---------- */
  if (!reduceMotion) {
    const rider = section.querySelector('#phone-rider');
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8, paused: true });
    tl.to(rider, {
      duration: 6,
      ease: 'power1.inOut',
      motionPath: { path: '#phone-route', align: '#phone-route', alignOrigin: [0.5, 0.5] },
    });
    ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => (self.isActive ? tl.play() : tl.pause()),
    });
  }

  /* ---------- Escritorio: sección fija que avanza con el scroll ---------- */
  const mm = gsap.matchMedia();

  mm.add('(min-width: 981px) and (prefers-reduced-motion: no-preference)', () => {
    section.classList.add('is-pinnable');
    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=240%',
      pin: true,
      anticipatePin: 1,
      onUpdate(self) {
        const p = self.progress * steps.length;
        bars.forEach((b, k) => gsap.set(b, { scaleY: gsap.utils.clamp(0, 1, p - k) }));
        setActive(Math.min(steps.length - 1, Math.floor(p)));
      },
    });

    const tilt = gsap.fromTo(
      phone,
      { rotationY: -22, rotationX: 10, y: 30 },
      { rotationY: 16, rotationX: -4, y: -20, ease: 'none', scrollTrigger: { trigger: section, start: 'top top', end: '+=240%', scrub: 1 } }
    );

    const onClick = (e) => {
      const li = e.target.closest('[data-step]');
      if (!li) return;
      const k = Number(li.dataset.step);
      scrollTo(st.start + (st.end - st.start) * ((k + 0.5) / steps.length));
    };
    section.addEventListener('click', onClick);

    return () => {
      section.classList.remove('is-pinnable');
      section.removeEventListener('click', onClick);
      tilt.scrollTrigger?.kill();
      tilt.kill();
      gsap.set(phone, { clearProps: 'transform' });
    };
  });

  /* ---------- Móvil: carrusel automático ---------- */
  mm.add('(max-width: 980px), (prefers-reduced-motion: reduce)', () => {
    let timer = null;
    let progress = null;
    const run = () => {
      stop();
      bars.forEach((b, k) => gsap.set(b, { scaleY: k < active ? 1 : 0 }));
      if (reduceMotion) {
        bars.forEach((b, k) => gsap.set(b, { scaleY: k === active ? 1 : 0 }));
        return;
      }
      progress = gsap.fromTo(bars[active], { scaleY: 0 }, { scaleY: 1, duration: 4, ease: 'none' });
      timer = setTimeout(() => {
        setActive((active + 1) % steps.length);
        run();
      }, 4000);
    };
    const stop = () => {
      clearTimeout(timer);
      progress?.kill();
    };
    const onClick = (e) => {
      const li = e.target.closest('[data-step]');
      if (!li) return;
      setActive(Number(li.dataset.step));
      run();
    };
    section.addEventListener('click', onClick);
    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top 70%',
      end: 'bottom 30%',
      onToggle: (self) => (self.isActive ? run() : stop()),
    });
    return () => {
      stop();
      st.kill();
      section.removeEventListener('click', onClick);
    };
  });
}
