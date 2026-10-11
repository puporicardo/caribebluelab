/**
 * Recorrido automático del kiosco: la misma película de la web, pero la mueve un reloj.
 * Se detiene en cada profundidad (la cámara apenas deriva) y viaja entre ellas con
 * aceleración y frenada suaves. Al final se funde y vuelve a empezar.
 */
export type StopKind = 'intro' | 'zone' | 'outro';

export interface Stop {
  /** Tiempo de película donde se detiene (0–6). */
  t: number;
  /** Segundos de pausa en este nivel. */
  hold: number;
  kind: StopKind;
  /** Zona 1–5 (solo kind 'zone'). */
  zone?: 1 | 2 | 3 | 4 | 5;
}

export const STOPS: Stop[] = [
  { t: 0, hold: 9, kind: 'intro' },
  { t: 1, hold: 12, kind: 'zone', zone: 1 },
  { t: 2, hold: 15, kind: 'zone', zone: 2 }, // con el mero 3D
  { t: 3, hold: 12, kind: 'zone', zone: 3 },
  { t: 4, hold: 12, kind: 'zone', zone: 4 },
  { t: 5.42, hold: 12, kind: 'zone', zone: 5 }, // subiendo hacia la luz
  { t: 6, hold: 11, kind: 'outro' }, // sobre el agua, al atardecer
];

/** Segundos de viaje por cada tramo completo de película (los clips duran 10 s). */
export const TRAVEL_PER_LEG = 11;
/** Deriva de la cámara durante la pausa (en tramos). 0: la toma queda quieta (el agua, la fauna
 *  y las partículas siguen moviéndose); así nunca se ve avanzar a saltos. */
const DRIFT = 0;
/** Fundido de cierre antes de volver a la superficie. */
export const FADE = 2.4;

interface Segment {
  start: number;
  end: number;
  from: number;
  to: number;
  /** Índice de parada (pausa) o -1 (viaje). */
  stop: number;
  ease: boolean;
}

/** Arranca y frena suave, pero nunca desde velocidad cero (el video siempre puede reproducirse). */
const ease = (x: number) => 0.45 * x + 0.55 * x * x * (3 - 2 * x);

function build(): { segments: Segment[]; total: number } {
  const segments: Segment[] = [];
  let clock = 0;
  STOPS.forEach((s, i) => {
    const drift = i === STOPS.length - 1 ? 0 : DRIFT;
    segments.push({ start: clock, end: clock + s.hold, from: s.t, to: s.t + drift, stop: i, ease: false });
    clock += s.hold;
    const next = STOPS[i + 1];
    if (next) {
      const dur = Math.max(5, (next.t - (s.t + drift)) * TRAVEL_PER_LEG);
      segments.push({ start: clock, end: clock + dur, from: s.t + drift, to: next.t, stop: -1, ease: true });
      clock += dur;
    }
  });
  return { segments, total: clock + FADE };
}

export const TIMELINE = build();

export interface KioskFrame {
  /** Tiempo de película. */
  film: number;
  /** Parada en la que está (o -1 viajando). */
  stop: number;
  /** Segundos desde que empezó la pausa actual y segundos que le quedan. */
  inHold: number;
  leftHold: number;
  /** 0–1: fundido de cierre. */
  fade: number;
}

/** Estado del recorrido en el segundo `clock` del bucle. */
export function frameAt(clock: number): KioskFrame {
  const { segments, total } = TIMELINE;
  const c = ((clock % total) + total) % total;
  const lastEnd = segments[segments.length - 1].end;
  if (c >= lastEnd) {
    return { film: STOPS[STOPS.length - 1].t, stop: STOPS.length - 1, inHold: c - segments[segments.length - 1].start, leftHold: 0, fade: (c - lastEnd) / FADE };
  }
  const seg = segments.find((s) => c >= s.start && c < s.end) ?? segments[0];
  const k = (c - seg.start) / Math.max(1e-6, seg.end - seg.start);
  const film = seg.from + (seg.to - seg.from) * (seg.ease ? ease(k) : k);
  // Fundido de entrada al reiniciar (primeros segundos sobre la superficie).
  const fadeIn = c < 1.6 ? 1 - c / 1.6 : 0;
  return { film, stop: seg.stop, inHold: c - seg.start, leftHold: seg.end - c, fade: fadeIn };
}

/** Segundo del bucle en que empieza la pausa de la parada `i`. */
export const holdStart = (i: number) => TIMELINE.segments.find((s) => s.stop === i)?.start ?? 0;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/**
 * Presencia de los textos de la parada `i` según la posición de la película (no según el reloj):
 * `enter` crece mientras la cámara se acerca a la capa (llega a 1 justo cuando se asienta) y
 * `leave` crece en cuanto la cámara reanuda la marcha. Así todo va pegado al movimiento.
 */
export function presence(i: number, T: number): { enter: number; leave: number } {
  const s = STOPS[i];
  const prev = STOPS[i - 1];
  const next = STOPS[i + 1];
  const approach = prev ? Math.min(0.5, (s.t - prev.t) * 0.55) : 0;
  const enter = approach ? clamp01((T - (s.t - approach)) / approach) : T <= s.t + 1e-4 ? 1 : 0;
  const away = next ? Math.min(0.35, (next.t - s.t) * 0.4) : 1;
  const leave = T > s.t ? clamp01((T - s.t) / away) : 0;
  return { enter, leave };
}
