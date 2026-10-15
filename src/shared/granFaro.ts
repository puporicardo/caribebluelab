/**
 * Datos abiertos de Copernicus que publica Gran Faro (granfaro.innovazul.co/dashboard/copernicus).
 *
 * Endpoints públicos (sin token) del backend de Gran Faro:
 *   GET https://gran-faro-cmee.vercel.app/api/v1/copernicus/mar/     → temperatura, oleaje y corriente (hoy + 9 días)
 *   GET https://gran-faro-cmee.vercel.app/api/v1/copernicus/lluvia/  → lluvia de 30 días y de los últimos 12 meses
 *
 * El backend solo permite CORS a su propio dominio, así que el micrositio los pide por un
 * proxy del mismo origen: /api/granfaro/mar y /api/granfaro/lluvia (vite.config.ts en
 * desarrollo, vercel.json en producción).
 */

export interface DiaMar {
  fecha: string;
  temperatura_c: number | null;
  /** Altura significativa de ola a las 13:00 de Santa Marta. */
  ola_m: number | null;
  corriente_ms: number | null;
  /** Hacia dónde va la corriente: grados desde el norte, sentido horario. */
  corriente_rumbo_grados: number | null;
  pronostico: boolean;
}

export interface EstadoMar {
  disponible: boolean;
  dias: DiaMar[];
  fuente: string;
  actualizado_en: string;
}

export interface MesLluvia {
  /** AAAA-MM */
  mes: string;
  total_mm: number | null;
  normal_mm: number;
  completo: boolean;
}

export interface LluviaMensual {
  disponible: boolean;
  meses: MesLluvia[];
  ultimos_30_dias_mm: number | null;
  normal_30_dias_mm: number;
  datos_hasta: string | null;
  fuente: string;
  referencia_normal: string;
  actualizado_en: string;
}

export const GRAN_FARO_API = {
  mar: '/api/granfaro/mar',
  lluvia: '/api/granfaro/lluvia',
} as const;

async function pedir<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Gran Faro HTTP ${res.status}`);
  return (await res.json()) as T;
}

export const getEstadoMar = (signal?: AbortSignal) => pedir<EstadoMar>(GRAN_FARO_API.mar, signal);
export const getLluviaMensual = (signal?: AbortSignal) => pedir<LluviaMensual>(GRAN_FARO_API.lluvia, signal);
