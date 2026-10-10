import type { RefObject } from 'react';
import { Link } from 'react-router';
import { useContent } from '../../content';
import { zonePath } from '../../content/zones';
import { useDive } from '../dive';

const STEP = 90;

/**
 * Medidor de profundidad (escritorio): regla con un indicador que baja de forma continua
 * con el scroll (--d lo escribe el layout). Cada marca es un enlace a la URL de su zona.
 */
export function DepthRail({ railRef, hidden }: { railRef: RefObject<HTMLDivElement | null>; hidden: boolean }) {
  const t = useContent();
  const { lang, zone } = useDive();

  return (
    <div ref={railRef} className={`rail ${hidden ? 'is-hidden' : ''}`}>
      <nav aria-label={t.ui.depth}>
        <span className="eyebrow rail-title">{t.ui.depth}</span>
        <span className="rail-line" aria-hidden="true" />
        <span className="rail-ticks" aria-hidden="true" />
        {t.zones.map((z, i) => (
          <Link
            key={i}
            to={zonePath(lang, i)}
            aria-current={i === zone ? 'location' : undefined}
            className={`rail-stop ${i === zone ? 'is-on' : ''}`}
            style={{ top: 34 + i * STEP }}
          >
            <span className="rail-major" aria-hidden="true" />
            <span className="rail-label">
              <span className="rail-n">0{i}</span>
              <span className="rail-name">{z.name}</span>
            </span>
          </Link>
        ))}
        <span className="rail-marker" aria-hidden="true">
          <span />
        </span>
      </nav>
    </div>
  );
}

/** Móvil y tableta: una línea fina en el borde con el mismo indicador continuo. */
export function MobileDepthLine({ lineRef, hidden }: { lineRef: RefObject<HTMLDivElement | null>; hidden: boolean }) {
  return (
    <div ref={lineRef} className={`mline ${hidden ? 'is-hidden' : ''}`} aria-hidden="true">
      <span />
    </div>
  );
}
