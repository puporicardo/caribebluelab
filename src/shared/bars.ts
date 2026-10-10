/** Barras de ecualizador con valores pseudoaleatorios estables (misma semilla = mismo dibujo). */
export interface Bar {
  h: number;
  d: number;
  dl: number;
}

export function makeBars(count: number, seed = 7, minH = 24, rangeH = 120): Bar[] {
  let s = seed;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  return Array.from({ length: count }, () => ({
    d: Math.round((0.7 + rnd() * 1.1) * 100) / 100,
    dl: Math.round(-rnd() * 1.5 * 100) / 100,
    h: Math.round(minH + rnd() * rangeH),
  }));
}

/** Generador pseudoaleatorio con semilla (para escenografía estable entre renders). */
export function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
