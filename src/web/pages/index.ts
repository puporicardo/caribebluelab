import type { ComponentType } from 'react';
import { ArrecifePage } from './ArrecifePage';
import { AscensoPage } from './AscensoPage';
import { PraderaMarinaPage } from './PraderaMarinaPage';
import { SuperficiePage } from './SuperficiePage';
import { ZonaDeLuzPage } from './ZonaDeLuzPage';
import { ZonaOscuraPage } from './ZonaOscuraPage';

/**
 * Una página por zona, en el orden del recorrido (mismo orden que ZONE_SLUGS).
 * El layout las dibuja seguidas para que el scroll sea continuo.
 */
export const ZONE_PAGES: readonly ComponentType[] = [
  SuperficiePage,
  ZonaDeLuzPage,
  ArrecifePage,
  PraderaMarinaPage,
  ZonaOscuraPage,
  AscensoPage,
];
