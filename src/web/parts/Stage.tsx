import type { RefObject } from 'react';
import { ZONE_COLORS } from '../../content/zones';
import { VideoStack } from '../../shared/components/VideoStack';
import { OceanCanvas } from '../../shared/ocean/OceanCanvas';
import type { Box, OceanTarget, PointerState } from '../../shared/ocean/types';

interface StageProps {
  zone: number;
  stageRef: RefObject<HTMLDivElement | null>;
  target: Box<OceanTarget>;
  pointer: Box<PointerState>;
  videoOk: Box<boolean>;
}

/**
 * Escenario fijo detrás de todo el sitio: video real de la zona activa (con fundido),
 * tinte de la paleta, lavado dorado del Ascenso, océano WebGL y velo de lectura.
 * El video se desplaza lento con el scroll (--p lo escribe el layout sin re-render).
 */
export function Stage({ zone, stageRef, target, pointer, videoOk }: StageProps) {
  const light = zone === 5;
  return (
    <div ref={stageRef} className="stage" aria-hidden="true">
      <VideoStack
        active={zone}
        playing={videoOk}
        layerStyle={(i) => ({
          transform:
            i === 5
              ? 'translate3d(0, calc(-4% + var(--p, 0) * 8%), 0) scale(1.12)'
              : 'translate3d(0, calc(4% - var(--p, 0) * 8%), 0) scale(1.12)',
          transition: 'opacity 2.5s ease',
        })}
      />
      <div className="stage-grade" style={{ background: ZONE_COLORS[zone] }} />
      <div className="stage-wash" style={{ opacity: light ? 0.78 : 0 }} />
      <OceanCanvas target={target} pointer={pointer} overlay={videoOk} ease={0.06} className="stage-ocean" />
      <div className={`stage-scrim ${light ? 'is-light' : ''}`} />
    </div>
  );
}
