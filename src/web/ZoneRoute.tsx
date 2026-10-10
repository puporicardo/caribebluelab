import { Navigate, useLocation, useParams } from 'react-router';
import { ZONE_SLUGS, type ZoneSlug } from '../content/zones';

/**
 * Elemento de cada ruta de zona. Las seis páginas se dibujan siempre juntas en el layout
 * (scroll continuo); esta ruta solo valida la URL. El layout lleva el scroll a la zona pedida
 * y actualiza la URL mientras el visitante baja.
 */
export function ZoneRoute() {
  const { zona } = useParams();
  const { pathname } = useLocation();
  if (zona !== undefined && !ZONE_SLUGS.includes(zona as ZoneSlug)) {
    return <Navigate to={pathname.startsWith('/en') ? '/en' : '/'} replace />;
  }
  return null;
}
