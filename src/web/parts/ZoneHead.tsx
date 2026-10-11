import type { CSSProperties } from 'react';
import { useContent } from '../../content';
import { Rich } from '../../shared/components/Rich';

interface ZoneHeadProps {
  index: 1 | 2 | 3 | 4 | 5;
  /** Color de acento de la zona para eyebrow, cursivas y verbo. */
  accent?: string;
  /** Color del contorno del numeral gigante. */
  numeralStroke?: string;
}

/**
 * Apertura editorial de cada zona. Con el scroll: el numeral gigante se dibuja trazo a trazo
 * y flota más lento que el texto (parallax), el titular entra palabra por palabra desde una
 * máscara y los filetes se extienden.
 */
export function ZoneHead({ index, accent, numeralStroke }: ZoneHeadProps) {
  const t = useContent();
  const zone = t.zones[index];
  const accentStyle: CSSProperties | undefined = accent ? { color: accent } : undefined;
  return (
    <div className="zhead" data-m="">
      <svg className="num" viewBox="0 0 640 430" aria-hidden="true">
        <text x="630" y="352" textAnchor="end" style={numeralStroke ? { stroke: numeralStroke } : undefined}>
          0{index}
        </text>
      </svg>
      <p className="eyebrow" data-reveal="" style={accentStyle}>
        <span className="rule" />
        <span className="split">
          <Rich text={t.ui.zoneEyebrow(index, zone.name)} split />
        </span>
      </p>
      <h2 id={`titulo-zona-${index}`} className="disp zhead-title" data-reveal="">
        <Rich text={zone.title} emStyle={accentStyle} split />
      </h2>
      <p className="disp zhead-verb" data-reveal="" style={accentStyle}>
        <span className="rule" />
        <span className="split">
          <Rich text={zone.verb} split />
        </span>
      </p>
    </div>
  );
}
