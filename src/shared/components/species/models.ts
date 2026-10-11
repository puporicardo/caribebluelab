const base = import.meta.env.BASE_URL;

/**
 * Modelos 3D por especie, en el mismo orden que `content.species.items`.
 * El primero es el mero guasa (mero-guasa.glb en public/models/, textura completa y compresión Meshopt).
 * null = especie aún sin modelo (el visor muestra “en preparación”).
 */
export const SPECIES_MODELS: readonly (string | null)[] = [`${base}models/mero-guasa.glb?v=a1a062209172`, null, null];

export const SPECIES_IDS = ['mero-guasa', 'especie-2', 'especie-3'] as const;
