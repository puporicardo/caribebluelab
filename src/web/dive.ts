import { createContext, useContext } from 'react';
import { zoneIndexOf, type Lang, type ZoneIndex } from '../content/zones';

export interface DiveState {
  lang: Lang;
  /** Zona visible según el scroll (0–5). */
  zone: ZoneIndex;
  /** Cambia el idioma conservando la zona y la posición. */
  switchLang: (lang: Lang, source: 'superficie' | 'cabecera' | 'pie') => void;
}

export const DiveContext = createContext<DiveState>({
  lang: 'es',
  zone: 0,
  switchLang: () => undefined,
});

export const useDive = () => useContext(DiveContext);

/** /arrecife → { lang: 'es', zone: 2 } · /en/ascenso → { lang: 'en', zone: 5 } */
export function parseWebPath(pathname: string): { lang: Lang; zone: ZoneIndex } {
  const segs = pathname.split('/').filter(Boolean);
  let lang: Lang = 'es';
  if (segs[0] === 'en') {
    lang = 'en';
    segs.shift();
  }
  return { lang, zone: zoneIndexOf(segs[0]) };
}

/** Estado que viaja con la navegación para no mover el scroll (cambios hechos por el propio scroll o por el idioma). */
export interface NavState {
  keepScroll?: boolean;
}

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const smooth = (v: number) => v * v * (3 - 2 * v);
