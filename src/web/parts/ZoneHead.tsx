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

/** Apertura editorial de cada zona: numeral gigante en contorno, eyebrow, titular y verbo. */
export function ZoneHead({ index, accent, numeralStroke }: ZoneHeadProps) {
  const t = useContent();
  const zone = t.zones[index];
  const accentStyle: CSSProperties | undefined = accent ? { color: accent } : undefined;
  return (
    <div className="zhead">
      <p className="num" aria-hidden="true" style={numeralStroke ? { WebkitTextStrokeColor: numeralStroke } : undefined}>
        0{index}
      </p>
      <p className="eyebrow" data-reveal="" style={accentStyle}>
        <span className="rule" />
        {t.ui.zoneEyebrow(index, zone.name)}
      </p>
      <h2 id={`titulo-zona-${index}`} className="disp zhead-title" data-reveal="">
        <Rich text={zone.title} emStyle={accentStyle} />
      </h2>
      <p className="disp zhead-verb" data-reveal="" style={accentStyle}>
        <span className="rule" />
        {zone.verb}
      </p>
    </div>
  );
}
