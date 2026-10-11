import type { FichaRow, SpeciesCopy } from '../types';
import type { Lang } from '../zones';

/**
 * Especies del visor 3D. Cada una tiene su ficha en esta carpeta (`<id>.json`, en español con
 * traducción al inglés, fuentes y estado UICN) y su modelo optimizado en `public/models/<id>.glb`.
 * Para sumar una especie: añade su JSON aquí, su GLB optimizado en public/models y su id en ORDER.
 */
interface SpeciesJson {
  id: string;
  name: string;
  latin: string;
  description: string;
  ficha: [string, string][];
  translations: { en: { name: string; latin: string; description: string; ficha: [string, string][] } };
  identification?: { requiresReview?: boolean };
  conservation?: { category?: string };
  optimization?: { version?: string };
}

/** Orden en el visor: el mero primero (el de la colección), luego de lo más amenazado a lo menos. */
const ORDER = ['mero-guasa', 'pargo', 'tiburon-enano', 'pez-dorado', 'atun', 'medregal', 'robalo', 'cojinua', 'mojarra'] as const;

const files = import.meta.glob<SpeciesJson>('./*.json', { eager: true, import: 'default' });
const byId = new Map(Object.values(files).map((d) => [d.id, d]));

export interface Species {
  id: string;
  /** URL del GLB optimizado. */
  model: string;
  /** Categoría UICN (VU, NT, LC…). */
  status?: string;
  /** La identificación de la pieza está pendiente de confirmar (ya figura en su ficha). */
  review: boolean;
  copy: Record<Lang, SpeciesCopy>;
}

const base = import.meta.env.BASE_URL;
const rows = (r: [string, string][]): FichaRow[] => r.map(([a, b]) => [a, b] as const);

export const SPECIES: Species[] = ORDER.flatMap((id) => {
  const d = byId.get(id);
  if (!d) return [];
  return [
    {
      id,
      model: `${base}models/${id}.glb${d.optimization?.version ? `?v=${d.optimization.version}` : ''}`,
      status: d.conservation?.category,
      review: !!d.identification?.requiresReview,
      copy: {
        es: { name: d.name, latin: d.latin, description: d.description, ficha: rows(d.ficha) },
        en: {
          name: d.translations.en.name,
          latin: d.translations.en.latin,
          description: d.translations.en.description,
          ficha: rows(d.translations.en.ficha),
        },
      },
    },
  ];
});
