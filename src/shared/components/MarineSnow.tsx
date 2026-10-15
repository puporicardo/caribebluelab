import { useEffect, useRef } from 'react';
import type { Box } from '../ocean/types';

interface MarineSnowProps {
  /** Tiempo de la película (0–6): decide la luz y el color de las partículas. */
  film: Box<number>;
  /** Qué mueve la cámara: el scroll (web) o la película (kiosco). */
  drive?: 'scroll' | 'film';
}

interface Speck {
  /** Posición normalizada 0–1 (se envuelve en los bordes). */
  x: number;
  y: number;
  /** Profundidad 0 (cerca) – 1 (lejos): tamaño, velocidad, paralaje. */
  z: number;
  r: number;
  ph: number;
  tw: number;
  /** Copo irregular (sprite desenfocado) en lugar de punto. */
  flake: number;
  rot: number;
  spin: number;
}

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, v: number) => {
  const x = clamp((v - a) / (b - a));
  return x * x * (3 - 2 * x);
};

/** Copos de materia en suspensión: manchas irregulares, alargadas y desenfocadas. */
function makeFlakes(n: number): HTMLCanvasElement[] {
  const out: HTMLCanvasElement[] = [];
  for (let k = 0; k < n; k++) {
    const s = 64;
    const c = document.createElement('canvas');
    c.width = c.height = s;
    const g = c.getContext('2d');
    if (!g) continue;
    g.translate(s / 2, s / 2);
    g.rotate(Math.random() * Math.PI);
    g.scale(1, 0.35 + Math.random() * 0.5);
    g.filter = `blur(${(1.5 + Math.random() * 2.5).toFixed(1)}px)`;
    g.beginPath();
    const pts = 7 + Math.floor(Math.random() * 5);
    for (let i = 0; i <= pts; i++) {
      const a = (i / pts) * Math.PI * 2;
      const rr = 9 + Math.random() * 12;
      const x = Math.cos(a) * rr;
      const y = Math.sin(a) * rr;
      if (i === 0) g.moveTo(x, y);
      else g.quadraticCurveTo(x * 1.2, y * 1.2, x, y);
    }
    const grad = g.createRadialGradient(0, 0, 0, 0, 0, 20);
    grad.addColorStop(0, 'rgba(255,255,255,0.9)');
    grad.addColorStop(0.6, 'rgba(255,255,255,0.35)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fill();
    out.push(c);
  }
  return out;
}

/**
 * Polvo y arena en suspensión, en un canvas 2D: un centenar de motas diminutas que revolotean con
 * la corriente (ruido suave, sin dirección fija), algunas que destellan al cruzar la luz, y
 * pocos copos irregulares desenfocados muy cerca de la cámara. Al bajar con el scroll suben,
 * en el ascenso caen (la cámara sube entre ellas). Arena cálida arriba, nieve marina azulada
 * en lo profundo, motas doradas al subir hacia el sol. Nada sobre el agua.
 */
export function MarineSnow({ film, drive = 'scroll' }: MarineSnowProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const small = window.innerWidth < 760;

    const N = small ? 50 : 110;
    const specks: Speck[] = Array.from({ length: N }, (_, i) => {
      const flake = i < (small ? 2 : 4) ? 1 : 0;
      const z = flake ? Math.random() * 0.25 : Math.random();
      return {
        x: Math.random(),
        y: Math.random(),
        z,
        r: flake ? 10 + Math.random() * 18 : lerp(1.9, 0.55, z) * (0.6 + Math.random() * 0.8),
        ph: Math.random() * 1000,
        tw: Math.random(),
        flake,
        rot: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.4,
      };
    });
    const flakes = makeFlakes(6);

    let W = 0;
    let H = 0;
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const size = () => {
      W = cv.clientWidth;
      H = cv.clientHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    window.addEventListener('resize', size);

    let raf = 0;
    let last = performance.now();
    let lastY = window.scrollY;
    let lastT = film.current;
    let cam = 0;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (document.hidden) return;
      const t = film.current;

      // Bajo el agua entre la zambullida y la salida a la superficie.
      const under = smooth(0.34, 0.5, t) * (1 - smooth(5.7, 5.78, t));
      ctx.clearRect(0, 0, W, H);
      if (under < 0.01) {
        lastY = window.scrollY;
        lastT = t;
        return;
      }

      // Movimiento vertical de la cámara: el scroll al bajar; el tiempo de película al subir.
      const sy = window.scrollY;
      let dy = (sy - lastY) / (H || 800);
      if (Math.abs(dy) > 0.35) dy = 0;
      lastY = sy;
      const dT = t - lastT;
      lastT = t;
      const camV = t >= 5 ? -dT * 2.6 : drive === 'film' ? (Math.abs(dT) < 0.2 ? dT * 1.4 : 0) : dy * 0.55;
      cam += (camV - cam) * 0.25;

      // Luz y color por profundidad.
      const deep = smooth(3.6, 4.6, t) * (1 - smooth(5.1, 5.5, t));
      const gold = smooth(5.15, 5.6, t);
      const light = lerp(1, 0.38, deep);
      const cr = Math.round(lerp(lerp(236, 170, deep), 255, gold));
      const cg = Math.round(lerp(lerp(226, 214, deep), 214, gold));
      const cb = Math.round(lerp(lerp(200, 255, deep), 150, gold));
      const time = now / 1000;

      for (const s of specks) {
        // Corriente: ruido de baja frecuencia (dos senos desfasados por mota), más lenta lejos.
        const sp = lerp(1, 0.35, s.z);
        const fx = Math.sin(time * 0.21 + s.ph) * 0.6 + Math.sin(time * 0.53 + s.ph * 1.7) * 0.4;
        const fy = Math.cos(time * 0.17 + s.ph * 1.3) * 0.5 + Math.sin(time * 0.41 + s.ph) * 0.3;
        s.x += (fx * 0.02 + 0.004) * sp * dt;
        s.y += (fy * 0.016 - 0.003) * sp * dt - cam * lerp(1.1, 0.25, s.z);
        s.rot += s.spin * dt;
        if (s.x < -0.05) s.x += 1.1;
        if (s.x > 1.05) s.x -= 1.1;
        if (s.y < -0.06) s.y += 1.12;
        if (s.y > 1.06) s.y -= 1.12;

        const px = s.x * W;
        const py = s.y * H;
        if (s.flake) {
          const img = flakes[Math.floor(s.ph) % flakes.length];
          const sz = s.r * (small ? 1.4 : 2);
          ctx.globalAlpha = 0.07 * light * under;
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(s.rot);
          ctx.drawImage(img, -sz / 2, -sz / 2, sz, sz);
          ctx.restore();
          continue;
        }
        // Destello: algunas motas captan la luz un instante al girar.
        const glint = Math.pow(Math.max(0, Math.sin(time * (0.6 + s.tw) + s.ph)), 12) * (1 - deep * 0.7);
        const a = (lerp(0.45, 0.15, s.z) + glint * 0.35) * light * under;
        ctx.globalAlpha = Math.min(0.85, a);
        ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
        ctx.beginPath();
        // Granos de arena: no siempre redondos.
        ctx.ellipse(px, py, s.r * (1 + glint * 0.6), s.r * (0.55 + s.tw * 0.45), s.rot, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', size);
    };
  }, [film, drive]);

  return <canvas ref={ref} className="marine-snow" aria-hidden="true" />;
}
