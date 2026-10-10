/** Caja mutable compartida entre efectos sin provocar renders de React. */
export interface Box<T> {
  current: T;
}

/** Hacia dónde debe ir el océano: 0 = superficie, 1 = fondo; ascent 0–1 = subida a la luz. */
export interface OceanTarget {
  depth: number;
  ascent: number;
}

/** Puntero normalizado al espacio de la escena (0–1, y hacia abajo). */
export interface PointerState {
  nx: number;
  ny: number;
  active: boolean;
  /** performance.now() del último movimiento. */
  seen: number;
}

export const createPointer = (): PointerState => ({ nx: 0.5, ny: 0.5, active: false, seen: 0 });
