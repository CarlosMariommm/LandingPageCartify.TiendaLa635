import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduceMotion } from '../config.js';

let lenis = null;

export function initScroll() {
  if (reduceMotion) return null;
  lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function scrollTo(target, opts = {}) {
  if (lenis) {
    lenis.scrollTo(target, { offset: 0, duration: 1.4, ...opts });
    return;
  }
  if (typeof target === 'number') window.scrollTo({ top: target });
  else if (target) target.scrollIntoView();
}

export const stopScroll = () => lenis?.stop();
export const startScroll = () => lenis?.start();
