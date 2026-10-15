import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './sealife.css';
import { habitatAt, type Habitat, type Species } from '../config/sealife';
import type { Box, PointerState } from '../ocean/types';

interface SeaLifeProps {
  /** Tiempo de la película (0–6): decide el hábitat y la luz. */
  film: Box<number>;
  pointer: Box<PointerState>;
  /**
   * Qué mueve la cámara: el scroll (web) o la propia película (kiosco, que avanza solo).
   * Con 'film' el paralaje y las entradas por arriba/abajo siguen al avance de la película.
   */
  drive?: 'scroll' | 'film';
}

interface Creature {
  sp: Species;
  el: HTMLDivElement;
  /** Posición en vw / vh (esquina superior izquierda). */
  x: number;
  y: number;
  w: number;
  dir: 1 | -1;
  vx: number;
  /** Distancia a la cámara: 0 cerca, 1 lejos. */
  d: number;
  phase: number;
  amp: number;
  freq: number;
  /** Empujón al huir del puntero. */
  flee: number;
  fy: number;
  habitat: Habitat;
  /** Alto en vh (para saber cuándo salió del todo por arriba o por abajo). */
  h: number;
  /** La cámara dejó su capa: acelera hacia el borde por el que va saliendo. */
  leaving: boolean;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const pick = (pool: [Species, number][]) => {
  const total = pool.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [sp, w] of pool) {
    r -= w;
    if (r <= 0) return sp;
  }
  return pool[0][0];
};

/**
 * Fauna viva sobre la película: peces con aleta caudal que bate en 3D, cardúmenes, tortuga,
 * raya que aletea y medusas bioluminiscentes. Cada animal tiene una distancia a cámara que
 * decide su tamaño, desenfoque y cuánto lo vela el agua (con luz cenital y vientre en sombra).
 * Huyen del puntero y se desplazan con el scroll como si la cámara bajara entre ellos.
 */
export function SeaLife({ film, pointer, drive = 'scroll' }: SeaLifeProps) {
  const back = useRef<HTMLDivElement>(null);
  const front = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = back.current;
    const fore = front.current;
    if (!host || !fore) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const coarse = window.matchMedia?.('(hover: none) and (pointer: coarse)').matches ?? false;
    const narrow = () => window.innerWidth < 760;

    const live: Creature[] = [];
    let habitat: Habitat | null = null;
    let nextAt = 0;
    let nextFront = performance.now() + 40000;
    let lastFilm = film.current;
    let scrollAcc = 0;
    let lastY = window.scrollY;
    let last = performance.now();
    let raf = 0;

    const build = (sp: Species, w: number, dir: 1 | -1, d: number, h: Habitat, layer: HTMLElement) => {
      const el = document.createElement('div');
      el.className = `sl sl--${sp.kind}`;
      const blur = d < 0 ? 5 : d < 0.08 ? 1.2 : lerp(0, 2.6, d);
      const light = h.silhouette ? 0.22 : h.light * lerp(1, 0.78, Math.max(0, d));
      const haze = h.silhouette ? 0.55 : Math.min(0.85, lerp(0.04, 0.58, Math.pow(Math.max(0, d), 1.2)) + (1 - h.light) * 0.32);
      el.style.width = `${w}vw`;
      el.style.setProperty('--sl-blur', `${blur.toFixed(2)}px`);
      el.style.setProperty('--sl-light', light.toFixed(3));
      el.style.setProperty('--sl-sat', (h.silhouette ? 0.2 : lerp(1.08, 0.62, Math.max(0, d))).toFixed(3));
      el.style.setProperty('--sl-haze', haze.toFixed(3));
      el.style.setProperty('--sl-water', h.water);
      el.style.setProperty('--sl-src', `url("${sp.src}")`);
      el.style.setProperty('--sl-op', (d < 0 ? 0.82 : lerp(1, 0.55, d)).toFixed(3));
      el.style.setProperty('--sl-beat', `${rand(0.42, 0.7).toFixed(2)}s`);
      el.style.setProperty('--sl-bob', `${rand(3.2, 5.6).toFixed(2)}s`);
      el.style.setProperty('--sl-delay', `${(-Math.random() * 3).toFixed(2)}s`);

      const part = (cls: string) =>
        `<div class="sl-part ${cls}"><img src="${sp.src}" alt="" draggable="false" decoding="async"/><i class="sl-haze"></i></div>`;
      const body =
        sp.kind === 'fish'
          ? part('sl-tail') + part('sl-head')
          : part('sl-whole');
      el.innerHTML = `<div class="sl-bob"><div class="sl-flip${dir < 0 ? ' is-left' : ''}"><div class="sl-body" style="aspect-ratio:${(1 / sp.aspect).toFixed(4)};--sl-split:${((sp.tail ?? 0) * 100).toFixed(1)}%">${body}</div></div></div>`;
      layer.appendChild(el);
      return el;
    };

    /** Alto en vh de un animal de `w` vw. */
    const heightVh = (w: number, sp: Species) => w * sp.aspect * ((window.innerWidth || 1) / (window.innerHeight || 1));

    /**
     * Todo animal entra nadando desde fuera de la pantalla:
     *  side  · por un costado, nadando hacia el otro (o justo al borde, `edge`, para que asome ya);
     *  below · por debajo: al bajar la cámara, el scroll lo sube hasta la vista;
     *  above · por arriba, cuando se sube con el scroll.
     */
    const spawn = (h: Habitat, opts: { front?: boolean; from?: 'side' | 'below' | 'above'; edge?: boolean } = {}) => {
      const sp = pick(h.pool);
      const vw = 100;
      const from = sp.kind === 'jelly' ? 'below' : (opts.from ?? 'side');
      // Los que entran por arriba o por abajo van cerca: el scroll los mueve lo bastante para que se vean.
      const d = opts.front
        ? -0.35
        : sp.kind === 'jelly'
          ? rand(0.05, 0.85)
          : from !== 'side'
            ? Math.pow(Math.random(), 1.5) * 0.5
            : Math.pow(Math.random(), 1.35) * 0.92;
      const sizeK = d < 0 ? 1.9 : 1 - d;
      const w = lerp(sp.size[0], sp.size[1], sizeK) * (narrow() ? 2 : 1.35);
      const dir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
      const speed = rand(sp.speed[0], sp.speed[1]) * (d < 0 ? 2.4 : lerp(1, 0.55, d));
      const n = sp.school ? Math.round(rand(sp.school[0], sp.school[1])) : 1;
      const hv = heightVh(w, sp);
      const baseY = sp.kind === 'jelly' ? rand(100.5, 106) : from === 'below' ? rand(102, 112) : from === 'above' ? -hv - rand(2, 12) : rand(12, 78);
      const startX =
        from !== 'side' ? rand(4, 86 - w) : dir > 0 ? -w - (opts.edge ? 0.5 : rand(2, 10)) : vw + (opts.edge ? 0.5 : rand(2, 10));
      for (let k = 0; k < n; k++) {
        if (live.length >= h.max && k > 0) break;
        const kw = w * rand(0.85, 1.1);
        const c: Creature = {
          sp,
          el: build(sp, kw, dir, d, h, opts.front ? fore : host),
          x: startX - dir * k * rand(kw * 0.5, kw * 1.4),
          // El cardumen se abre en profundidad de la pantalla, pero siempre fuera de ella al nacer.
          y: baseY + (k ? (from === 'below' ? rand(0, 10) : from === 'above' ? -rand(0, 10) : rand(-9, 9)) : 0),
          w: kw,
          dir,
          vx: speed * rand(0.92, 1.08),
          d,
          phase: Math.random() * Math.PI * 2,
          amp: sp.kind === 'jelly' ? rand(0.6, 1.4) : rand(0.8, 2.6),
          freq: rand(0.25, 0.55),
          flee: 0,
          fy: 0,
          habitat: h,
          h: heightVh(kw, sp),
          leaving: false,
        };
        live.push(c);
      }
    };

    const remove = (i: number) => {
      live[i].el.remove();
      live.splice(i, 1);
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (document.hidden) return;

      const t = film.current;
      const h = habitatAt(t);
      if (h !== habitat) {
        habitat = h;
        if (h) {
          // Al llegar a una capa nueva, los primeros asoman ya por los costados y por el borde
          // hacia el que avanza la cámara (nadie aparece de la nada).
          spawn(h, { edge: true });
          nextAt = now + rand(h.every[0], h.every[1]) * 1000;
        }
      }
      // Los de la capa anterior no desaparecen: aceleran y salen nadando (ver abajo).
      if (habitat && now > nextAt) {
        const own = live.filter((c) => c.habitat === habitat).length;
        if (own < habitat.max) spawn(habitat);
        nextAt = now + rand(habitat.every[0], habitat.every[1]) * 1000 * (narrow() ? 1.4 : 1);
      }
      if (!coarse && habitat && !habitat.silhouette && habitat.light > 0.8 && now > nextFront) {
        spawn(habitat, { front: true });
        nextFront = now + rand(110000, 180000);
      }

      // El scroll mueve la cámara: los animales cercanos se desplazan más (paralaje).
      const sy = window.scrollY;
      let dy = ((sy - lastY) / (window.innerHeight || 800)) * 100;
      // Un salto (menú, enlace) no es la cámara moviéndose: no arrastra a los animales.
      if (Math.abs(dy) > 35) dy = 0;
      dy = Math.max(-4, Math.min(4, dy));
      lastY = sy;
      // En el ascenso la cámara sube: lo que hay en el agua se queda abajo y sale por el borde
      // inferior antes de que rompa la superficie. Nunca hay animales en el cielo.
      const dT = t - lastFilm;
      lastFilm = t;
      const lift = t >= 5 && Math.abs(dT) < 0.2 ? dT * 320 : 0;
      // Cerca de la superficie lo que quede en el agua termina de hundirse fuera de cuadro.
      const sink = t > 5.55 ? (t - 5.55) * 600 * dt : 0;
      // Salto (menú, enlace): la película corta, la fauna también. Y nada queda en el cielo.
      if (Math.abs(dT) > 0.6 || (t > 5.6 && Math.abs(dT) >= 0.2)) {
        while (live.length) remove(live.length - 1);
      }
      // Kiosco: la cámara baja al avanzar la película (≈ 90 vh por tramo).
      if (drive === 'film') dy = t < 5 && Math.abs(dT) < 0.2 ? Math.max(-4, Math.min(4, dT * 90)) : 0;
      if (t >= 5) dy = 0;
      // Cuanto más se recorre, más vida entra por el borde hacia el que va la cámara.
      scrollAcc += Math.abs(dy);
      if (habitat && !habitat.silhouette && scrollAcc > (narrow() ? 140 : 90)) {
        scrollAcc = 0;
        const own = live.filter((c) => c.habitat === habitat).length;
        if (own < habitat.max) spawn(habitat, { from: dy >= 0 ? 'below' : 'above' });
      }

      const p = pointer.current;
      const pOn = p.active && now - p.seen < 2500;
      const px = p.nx * 100;
      const py = p.ny * 100;

      for (let i = live.length - 1; i >= 0; i--) {
        const c = live[i];
        const par = c.d < 0 ? 0.9 : lerp(0.42, 0.08, c.d);
        c.y -= dy * par;
        c.y += lift * lerp(1, 0.75, Math.max(0, c.d)) + sink;
        if (c.sp.kind === 'jelly') {
          c.y -= c.vx * dt;
          c.x += Math.sin(now / 1000 * c.freq + c.phase) * 0.6 * dt;
        } else {
          c.x += c.dir * c.vx * (1 + c.flee + (c.leaving ? 1.6 : 0)) * dt;
        }
        // Huir del puntero (solo los cercanos lo “ven”).
        if (pOn && c.d < 0.6 && c.d >= 0) {
          const cx = c.x + c.w / 2;
          const cy = c.y + ((c.w * c.sp.aspect) / 2) * (window.innerWidth / (window.innerHeight || 1));
          const dist = Math.hypot(cx - px, cy - py);
          if (dist < 14) {
            c.flee = Math.min(2.6, c.flee + dt * 9);
            c.fy += (cy > py ? 1 : -1) * dt * 10;
          }
        }
        c.flee *= 1 - dt * 1.4;
        c.fy *= 1 - dt * 1.2;
        const bob = Math.sin((now / 1000) * c.freq * Math.PI * 2 * 0.25 + c.phase) * c.amp;
        const y = c.y + bob + c.fy;
        if (c.habitat !== habitat && !c.leaving) {
          c.leaving = true;
          // Mientras sale nadando toma la luz y el velo del agua de la capa nueva.
          if (habitat && !habitat.silhouette && c.sp.kind !== 'jelly') {
            c.el.style.setProperty('--sl-light', (habitat.light * lerp(1, 0.78, Math.max(0, c.d))).toFixed(3));
            c.el.style.setProperty('--sl-haze', Math.min(0.85, 0.2 + (1 - habitat.light) * 0.5).toFixed(3));
            c.el.style.setProperty('--sl-water', habitat.water);
          }
        }
        c.el.style.transform = `translate3d(${c.x.toFixed(2)}vw, ${y.toFixed(2)}vh, 0)`;
        // Solo se retira cuando ya salió del todo por el lado hacia el que se mueve.
        const gone =
          (c.sp.kind === 'jelly' ? y + c.h < -6 : c.dir > 0 ? c.x > 102 : c.x + c.w < -2) ||
          (dy < 0 ? y > 135 : y + c.h < -35) ||
          y > 160 ||
          y + c.h < -60 ||
          c.x < -240 ||
          c.x > 340;
        if (gone) remove(i);
      }

    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      live.forEach((c) => c.el.remove());
    };
  }, [film, pointer, drive]);

  // El primer plano va por encima del texto (desenfocado, de paso): se monta en <body>.
  return (
    <>
      <div ref={back} className="sealife" aria-hidden="true" />
      {createPortal(<div ref={front} className="sealife sealife--front" aria-hidden="true" />, document.body)}
    </>
  );
}
