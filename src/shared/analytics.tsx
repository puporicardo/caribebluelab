/**
 * Medición con Vercel Web Analytics + Speed Insights.
 *
 * - Vistas de página: cada zona tiene su URL (/arrecife, /en/arrecife…) y se registra una vista
 *   cuando el visitante entra o llega a ella con el scroll. Funciona en el plan Hobby.
 * - Eventos personalizados (`trackEvent`): idioma elegido, uso del visor 3D, audio, enlaces y CTA.
 *   Vercel solo los guarda en planes Pro/Enterprise (máx. 2 propiedades por evento en Pro).
 * - Speed Insights: Core Web Vitals reales por ruta.
 *
 * Los datos se ven en el panel del proyecto en Vercel (Analytics / Speed Insights) y también
 * por la API: GET https://api.vercel.com/v1/query/web-analytics/visits/aggregate?by=requestPath…
 * En desarrollo no se envía nada: los eventos se muestran en la consola.
 */
import { Analytics, track } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

export type AnalyticsEvent =
  | 'idioma_elegido'
  | 'inicio_inmersion'
  | 'visor_3d'
  | 'especie_vista'
  | 'audio'
  | 'filminuto'
  | 'enlace_externo'
  | 'cta'
  | 'fin_del_recorrido';

type Props = Record<string, string | number | boolean | null>;

export function trackEvent(name: AnalyticsEvent, props?: Props) {
  if (import.meta.env.DEV) console.info('[analítica]', name, props ?? '');
  try {
    track(name, props);
  } catch {
    /* la analítica nunca debe romper la experiencia */
  }
}

interface SiteAnalyticsProps {
  /** Patrón de ruta (agrupa vistas): /arrecife, /en/arrecife, /kiosco/[idioma]… */
  route: string;
  /** Ruta real visitada. */
  path: string;
}

/** Monta la analítica con seguimiento manual de rutas (el scroll también cambia de “página”). */
export function SiteAnalytics({ route, path }: SiteAnalyticsProps) {
  return (
    <>
      <Analytics route={route} path={path} />
      <SpeedInsights route={route} />
    </>
  );
}
