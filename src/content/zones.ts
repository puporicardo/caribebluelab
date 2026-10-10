/** Las seis profundidades del recorrido. El orden es el del descenso (y el ascenso final). */
export const ZONE_SLUGS = [
  'superficie',
  'zona-de-luz',
  'arrecife',
  'pradera-marina',
  'zona-oscura',
  'ascenso',
] as const;

export type ZoneSlug = (typeof ZONE_SLUGS)[number];
export type ZoneIndex = 0 | 1 | 2 | 3 | 4 | 5;

export const LANGS = ['es', 'en'] as const;
export type Lang = (typeof LANGS)[number];

export const isLang = (v: unknown): v is Lang => v === 'es' || v === 'en';

/** Color de cada profundidad (paleta de la diapositiva de identidad). */
export const ZONE_COLORS = ['#4C86AE', '#35668B', '#2A4C72', '#1D3256', '#0B1B33', '#D2BB81'] as const;

export const zoneIndexOf = (slug: string | undefined): ZoneIndex => {
  const i = ZONE_SLUGS.indexOf((slug ?? 'superficie') as ZoneSlug);
  return (i < 0 ? 0 : i) as ZoneIndex;
};

/**
 * Ruta pública de una zona.
 * Español sin prefijo (/arrecife), inglés con /en (/en/arrecife). La Superficie es la raíz.
 */
export const zonePath = (lang: Lang, zone: number): string => {
  const slug = ZONE_SLUGS[zone] ?? 'superficie';
  const base = lang === 'en' ? '/en' : '';
  if (slug === 'superficie') return base || '/';
  return `${base}/${slug}`;
};

/** Patrón de ruta para la analítica (agrupa /arrecife y /en/arrecife bajo la misma zona). */
export const zoneRoute = (lang: Lang, zone: number): string => {
  const slug = ZONE_SLUGS[zone] ?? 'superficie';
  return lang === 'en' ? `/en/${slug}` : `/${slug}`;
};

export const kioskPath = (lang: Lang) => `/kiosco/${lang}`;
