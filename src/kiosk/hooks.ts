import { useEffect, useRef, useState } from 'react';

export const STAGE_W = 1920;
export const STAGE_H = 1080;
export const LOOP_SECONDS = 360;
export const SCENE_SECONDS = 60;

/** Escala la escena de 1920×1080 para llenar la pantalla (TV o navegador), centrada. */
export function useFitScale() {
  const calc = () => {
    const w = window.innerWidth || STAGE_W;
    const h = window.innerHeight || STAGE_H;
    const s = Math.min(w / STAGE_W, h / STAGE_H);
    return { s, x: (w - STAGE_W * s) / 2, y: (h - STAGE_H * s) / 2 };
  };
  const [fit, setFit] = useState(calc);
  useEffect(() => {
    const onResize = () => setFit(calc());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return fit;
}

/**
 * Reloj del bucle: t en segundos (0–360), avanza en tiempo real × velocidad.
 * Se actualiza cada 250 ms; al llegar a 6 minutos vuelve a la Superficie.
 */
export function useLoopClock(start: number, speed: number) {
  const [t, setT] = useState(start);
  const last = useRef(Date.now());

  useEffect(() => setT(start), [start]);

  useEffect(() => {
    last.current = Date.now();
    const iv = window.setInterval(() => {
      const now = Date.now();
      const dt = Math.min(2, (now - last.current) / 1000);
      last.current = now;
      if (!speed) return;
      setT((prev) => {
        const next = prev + dt * speed;
        return next >= LOOP_SECONDS ? next - LOOP_SECONDS : next;
      });
    }, 250);
    return () => window.clearInterval(iv);
  }, [speed]);

  return [t, setT] as const;
}

/** Profundidad del océano según el minuto: baja de 0 a 1 en cinco minutos y en el sexto asciende a la luz. */
export function oceanTargetAt(t: number) {
  if (t < 300) return { depth: t / 300, ascent: 0 };
  const a = Math.min(1, (t - 300) / 9);
  const e = a * a * (3 - 2 * a);
  return { depth: 1 - e, ascent: Math.max(0, Math.min(1, (e - 0.35) / 0.65)) };
}

/** Parámetros de revisión por URL: ?escena=0–5 &velocidad=x6|pausa &subtitulos=0 */
export function readKioskParams(search: URLSearchParams) {
  const scene = Math.max(0, Math.min(5, parseInt(search.get('escena') ?? '0', 10) || 0));
  const v = (search.get('velocidad') ?? '').toLowerCase();
  const speed = v.startsWith('pausa') ? 0 : v.includes('6') ? 6 : 1;
  const captions = search.get('subtitulos') !== '0';
  return { scene, speed, captions };
}
