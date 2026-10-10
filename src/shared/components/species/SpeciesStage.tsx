import { lazy, Suspense } from 'react';
import type { Content } from '../../../content/types';
import type { ViewerAction } from './SpeciesViewer';
import './species.css';

const SpeciesViewer = lazy(() => import('./SpeciesViewer'));

/** Descarga anticipada del código del visor y del modelo (sin mostrar nada). */
export const warmUpSpecies = (url: string | null) =>
  import('./SpeciesViewer').then((m) => {
    if (url) m.preloadSpeciesModel(url);
  });

interface SpeciesStageProps {
  /** URL del GLB o null si la especie aún no tiene modelo. */
  url: string | null;
  label: string;
  labels: Content['viewer'];
  mode: 'interactive' | 'showcase';
  active?: boolean;
  onAction?: (action: ViewerAction) => void;
}

/** Marco del visor: modelo 3D si existe, o aviso de “en preparación”. */
export function SpeciesStage({ url, label, labels, mode, active, onAction }: SpeciesStageProps) {
  if (!url) {
    return (
      <div className={`viewer viewer--${mode}`}>
        <div className="viewer-canvas">
          <div className="viewer-empty hatch" role="status">
            <p className="disp">{labels.pendingTitle}</p>
            <p>{labels.pendingBody}</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <Suspense
      fallback={
        <div className={`viewer viewer--${mode}`}>
          <div className="viewer-canvas">
            <p className="viewer-loading viewer-loading--static">{labels.loading(0)}</p>
          </div>
        </div>
      }
    >
      <SpeciesViewer url={url} label={label} labels={labels} mode={mode} active={active} onAction={onAction} />
    </Suspense>
  );
}

export type { ViewerAction };
