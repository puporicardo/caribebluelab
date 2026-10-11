/**
 * Película del descenso (web): una sola toma continua dividida en tramos.
 * Generada con Magnific · Kling 3.0 (1080p, 10 s por tramo, sin audio). El primer fotograma
 * de cada tramo es el último fotograma real del anterior, así que las costuras encajan.
 *
 * El scroll no reproduce el video: lo recorre (currentTime sigue a la posición).
 * Fuentes en media-src/ (no se publican); encodes web en public/film/.
 */
export interface FilmLeg {
  /** Desde qué zona hasta cuál viaja la cámara (solo documentación). */
  from: string;
  to: string;
  /** 1080p, GOP 8 (escritorio). */
  src: string;
  /** 720p, GOP 4 (teléfonos): seek más barato. */
  srcMobile: string;
  /** Primer fotograma del tramo (póster y movimiento reducido). */
  poster: string;
  /** Película vertical nativa (9:16), su propia cadena: 1080×1920 y 720×1280 para teléfonos. */
  srcPortrait: string;
  srcPortraitMobile: string;
  posterPortrait: string;
}

const base = import.meta.env.BASE_URL;
const leg = (n: number, from: string, to: string): FilmLeg => ({
  from,
  to,
  src: `${base}film/leg${n}.mp4`,
  srcMobile: `${base}film/leg${n}-m.mp4`,
  poster: `${base}film/leg${n}.webp`,
  srcPortrait: `${base}film/leg${n}-v.mp4`,
  srcPortraitMobile: `${base}film/leg${n}-vm.mp4`,
  posterPortrait: `${base}film/leg${n}-v.webp`,
});

export const FILM_LEGS: FilmLeg[] = [
  leg(1, 'superficie', 'zona-de-luz'),
  leg(2, 'zona-de-luz', 'arrecife'),
  leg(3, 'arrecife', 'pradera-marina'),
  leg(4, 'pradera-marina', 'zona-oscura'),
  leg(5, 'zona-oscura', 'mirada-arriba'),
  leg(6, 'mirada-arriba', 'superficie-dorada'),
];

/**
 * Del avance del recorrido (g: zona + progreso, 0–6) al tiempo de la película (T: tramo + progreso, 0–6).
 * Puntos [g, T] interpolados linealmente. La cámara llega a cada capa poco después de que
 * su titular entra en pantalla y se queda casi quieta mientras se lee (meseta corta).
 */
export const FILM_KEYS: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [0.32, 0], // portada: superficie quieta
  [1.12, 1], // llega a la zona de luz
  [1.3, 1.06],
  [2.1, 2], // arrecife
  [2.3, 2.06],
  [3.1, 3], // pradera
  [3.3, 3.06],
  [4.1, 4], // zona oscura
  [4.4, 4.1],
  [4.96, 5], // lo más hondo, justo al final de la zona oscura
  [5.16, 5.42], // el ascenso arranca rápido: al entrar su titular ya hay luz azul
  [5.92, 6], // rompe la superficie al llegar al pie
  [6, 6],
];

export function filmTime(g: number): number {
  const k = FILM_KEYS;
  if (g <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) {
    if (g <= k[i][0]) {
      const [g0, t0] = k[i - 1];
      const [g1, t1] = k[i];
      return t0 + ((g - g0) / Math.max(1e-6, g1 - g0)) * (t1 - t0);
    }
  }
  return k[k.length - 1][1];
}
