/**
 * Recorrido automático del kiosco: la misma película de la web, reproducida de corrido a velocidad
 * real (10 s por tramo, 60 s la vuelta), sin detenerse. Los textos de cada profundidad aparecen
 * mientras la cámara pasa por ella. Al final se funde y vuelve a empezar.
 */
export type StopKind = 'intro' | 'zone' | 'outro';

export interface Stop {
  /** Tiempo de película donde está la capa (0–6). */
  t: number;
  kind: StopKind;
  /** Zona 1–5 (solo kind 'zone'). */
  zone?: 1 | 2 | 3 | 4 | 5;
}

export const STOPS: Stop[] = [
  { t: 0, kind: 'intro' },
  { t: 1, kind: 'zone', zone: 1 },
  { t: 2, kind: 'zone', zone: 2 }, // con el mero 3D
  { t: 3, kind: 'zone', zone: 3 },
  { t: 4, kind: 'zone', zone: 4 },
  { t: 5.42, kind: 'zone', zone: 5 }, // subiendo hacia la luz
  { t: 6, kind: 'outro' }, // sobre el agua, al atardecer
];

/** Segundos por tramo de película: lo que dura cada clip, así el video corre a velocidad real. */
export const LEG_SECONDS = 10;
/** Último tiempo de película (seis tramos). */
const FILM_END = 6;
/** Fundido de cierre (dentro de los últimos segundos de la película) y de entrada al reiniciar. */
export const FADE = 1.6;

/** Duración de una vuelta: lo mismo que la película. */
export const TIMELINE = { total: FILM_END * LEG_SECONDS };

export interface KioskFrame {
  /** Tiempo de película. */
  film: number;
  /** 0–1: fundido (cierre al final de la vuelta, entrada al empezar). */
  fade: number;
}

/** Estado del recorrido en el segundo `clock` del bucle. */
export function frameAt(clock: number): KioskFrame {
  const { total } = TIMELINE;
  const c = ((clock % total) + total) % total;
  const film = Math.min(FILM_END, c / LEG_SECONDS);
  const fadeIn = c < FADE ? 1 - c / FADE : 0;
  const fadeOut = c > total - FADE ? (c - (total - FADE)) / FADE : 0;
  return { film, fade: Math.max(fadeIn, fadeOut) };
}

/** Segundo del bucle en que la cámara llega a la capa de la parada `i`. */
export const holdStart = (i: number) => Math.min(TIMELINE.total - FADE, STOPS[i].t * LEG_SECONDS);

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/**
 * Presencia de los textos de la parada `i` según la posición de la película (no según el reloj):
 * `enter` crece mientras la cámara se acerca a la capa (llega a 1 justo al pasar por ella), el
 * texto se queda un tramo corto mientras la cámara sigue avanzando y `leave` crece antes de que
 * empiece a entrar el de la capa siguiente. Así todo va pegado al movimiento, sin pausas.
 */
export function presence(i: number, T: number): { enter: number; leave: number } {
  const s = STOPS[i];
  const prev = STOPS[i - 1];
  const next = STOPS[i + 1];
  const approach = prev ? Math.min(0.5, (s.t - prev.t) * 0.55) : 0;
  const enter = approach ? clamp01((T - (s.t - approach)) / approach) : 1;
  const gap = next ? next.t - s.t : 1;
  const stay = Math.min(0.25, gap * 0.4);
  const away = Math.min(0.25, gap * 0.4);
  const leave = T > s.t + stay ? clamp01((T - s.t - stay) / away) : 0;
  return { enter, leave };
}
