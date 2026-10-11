import type { RefObject } from 'react';
import { ZONE_COLORS } from '../../content/zones';
import { DiveFilm } from '../../shared/components/DiveFilm';
import { MarineSnow } from '../../shared/components/MarineSnow';
import { SeaLife } from '../../shared/components/SeaLife';
import { OceanCanvas } from '../../shared/ocean/OceanCanvas';
import type { Box, OceanTarget, PointerState } from '../../shared/ocean/types';

interface StageProps {
  zone: number;
  stageRef: RefObject<HTMLDivElement | null>;
  target: Box<OceanTarget>;
  pointer: Box<PointerState>;
  videoOk: Box<boolean>;
  /** Tiempo de la película que pide el scroll (0–6). */
  film: Box<number>;
}

/**
 * Escenario fijo detrás de todo el sitio:
 *  1. la película del descenso, recorrida con el scroll (una sola toma, sin cortes);
 *  2. la fauna viva encima (peces, tortuga, raya, medusas) velada por el agua;
 *  3. polvo, arena y copos en suspensión que revolotean con la corriente;
 *  4. un leve tinte de la paleta; en el Ascenso, el sol que crece arriba y un velo claro
 *     solo donde va el texto (el resto deja ver la subida);
 *  5. la óptica del agua en WebGL (rayos, cáusticas, bioluminiscencia);
 *  6. el velo de lectura y una viñeta de lente.
 * Si la película no carga, el océano WebGL dibuja el fondo completo.
 */
export function Stage({ zone, stageRef, target, pointer, videoOk, film }: StageProps) {
  const light = zone === 5;
  return (
    <div ref={stageRef} className="stage" aria-hidden="true">
      <DiveFilm film={film} playing={videoOk} />
      <SeaLife film={film} pointer={pointer} />
      <MarineSnow film={film} />
      <div className="stage-grade" style={{ background: ZONE_COLORS[zone] }} />
      <div className="stage-sun" />
      <div className="stage-wash" />
      <OceanCanvas target={target} pointer={pointer} overlay={videoOk} ease={0.06} className="stage-ocean" />
      <div className={`stage-scrim ${light ? 'is-light' : ''}`} />
      <div className="stage-lens" />
    </div>
  );
}
