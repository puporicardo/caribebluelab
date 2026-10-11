/**
 * Fauna que acompaña el descenso. Fotos realistas generadas con Magnific (Seedream 5 Pro)
 * y recortadas sin fondo; se animan por encima de la película, no dentro de ella
 * (un pez dentro de un video recorrido con el scroll nada hacia atrás al subir).
 */
export type CreatureKind = 'fish' | 'turtle' | 'ray' | 'jelly';

export interface Species {
  id: string;
  src: string;
  kind: CreatureKind;
  /** Alto / ancho de la imagen. */
  aspect: number;
  /** Ancho en vw: [lejos, cerca]. */
  size: [number, number];
  /** Velocidad en vw/s: [mín, máx]. */
  speed: [number, number];
  /** Peces: fracción del ancho (desde la cola, a la izquierda) que bate como aleta caudal. */
  tail?: number;
  /** Cardumen: cuántos salen juntos [mín, máx]. */
  school?: [number, number];
}

const base = import.meta.env.BASE_URL;
const img = (n: string) => `${base}sea/${n}.webp`;

export const SPECIES = {
  sargento: { id: 'sargento', src: img('sergeant-major'), kind: 'fish', aspect: 0.494, size: [2.2, 6], speed: [3.2, 4.6], tail: 0.34, school: [3, 5] },
  cirujano: { id: 'cirujano', src: img('blue-tang'), kind: 'fish', aspect: 0.568, size: [2.4, 7], speed: [2.8, 4.2], tail: 0.3, school: [1, 2] },
  angel: { id: 'angel', src: img('queen-angelfish'), kind: 'fish', aspect: 0.7, size: [2.8, 8], speed: [2.2, 3.2], tail: 0.28 },
  loro: { id: 'loro', src: img('parrotfish'), kind: 'fish', aspect: 0.486, size: [3.2, 9.5], speed: [2.4, 3.4], tail: 0.3 },
  barracuda: { id: 'barracuda', src: img('barracuda'), kind: 'fish', aspect: 0.274, size: [6, 17], speed: [3.6, 6], tail: 0.22 },
  mero: { id: 'mero', src: img('goliath-grouper'), kind: 'fish', aspect: 0.434, size: [7, 19], speed: [1.1, 1.7], tail: 0.24 },
  carey: { id: 'carey', src: img('hawksbill'), kind: 'turtle', aspect: 0.649, size: [6, 17], speed: [1.5, 2.3] },
  raya: { id: 'raya', src: img('eagle-ray'), kind: 'ray', aspect: 0.747, size: [8, 22], speed: [2, 3] },
  medusa: { id: 'medusa', src: img('jellyfish'), kind: 'jelly', aspect: 1.453, size: [3, 8.5], speed: [0.5, 0.9] },
} satisfies Record<string, Species>;

export interface Habitat {
  /** Tramo de la película donde vive (T, 0–6). */
  from: number;
  to: number;
  /** Especies con su peso de aparición. */
  pool: [Species, number][];
  /** Máximo de animales en pantalla. */
  max: number;
  /** Segundos entre apariciones [mín, máx]. */
  every: [number, number];
  /** Luz ambiente sobre la fauna (1 = superficie). */
  light: number;
  /** Color del agua que vela a los animales lejanos. */
  water: string;
  /** Solo siluetas a contraluz (ascenso). */
  silhouette?: boolean;
}

export const HABITATS: Habitat[] = [
  {
    from: 0.5,
    to: 1.55,
    pool: [
      [SPECIES.sargento, 4],
      [SPECIES.barracuda, 2],
      [SPECIES.carey, 1],
    ],
    max: 6,
    every: [8, 14],
    light: 1,
    water: '#5cb3ad',
  },
  {
    from: 1.55,
    to: 2.6,
    pool: [
      [SPECIES.cirujano, 4],
      [SPECIES.angel, 2],
      [SPECIES.loro, 3],
      [SPECIES.sargento, 2],
    ],
    max: 7,
    every: [7, 12],
    light: 0.95,
    water: '#3f93a3',
  },
  {
    from: 2.6,
    to: 3.65,
    pool: [
      [SPECIES.raya, 2],
      [SPECIES.carey, 2],
      [SPECIES.mero, 2],
      [SPECIES.loro, 1],
    ],
    max: 2,
    every: [10, 16],
    light: 0.85,
    water: '#2f7590',
  },
  {
    from: 3.65,
    to: 4.2,
    pool: [
      [SPECIES.barracuda, 2],
      [SPECIES.raya, 1],
    ],
    max: 1,
    every: [12, 18],
    light: 0.55,
    water: '#173d5c',
  },
  {
    from: 4.2,
    to: 5.05,
    pool: [[SPECIES.medusa, 1]],
    max: 2,
    every: [8, 13],
    light: 0.35,
    water: '#071a2e',
  },
  // Ascenso: solo siluetas a contraluz al principio; después la cámara las deja abajo.
  {
    from: 5.05,
    to: 5.42,
    pool: [
      [SPECIES.sargento, 3],
      [SPECIES.barracuda, 1],
    ],
    max: 4,
    every: [7, 11],
    light: 0.3,
    water: '#24425a',
    silhouette: true,
  },
];

export const habitatAt = (t: number): Habitat | null => HABITATS.find((h) => t >= h.from && t < h.to) ?? null;
