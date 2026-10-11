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
 * Cada profundidad entra con su propia coreografía, ligada al scroll (ver motion.css):
 *  1 · luz       las palabras convergen desde los dos lados
 *  2 · arrecife  caen desde arriba, girando, como cosas que se hunden
 *  3 · pradera   llegan en ola desde la derecha, como la corriente sobre la hierba
 *  4 · oscura    emergen del desenfoque, con el tracking cerrándose
 *  5 · ascenso   suben desde abajo, creciendo hacia la luz
 */
const VARIANTS = ['', 'converge', 'drop', 'wave', 'focus', 'rise'] as const;

export function ZoneHead({ index, accent, numeralStroke }: ZoneHeadProps) {
  const t = useContent();
  const zone = t.zones[index];
  const accentStyle: CSSProperties = { color: accent ?? 'var(--c-accent)' };
  const parts = [zone.name, zone.verb];
  return (
    <>
      <div className={`zhead zhead--${VARIANTS[index]}`} data-m="">
        <svg className="num" viewBox="0 0 640 430" aria-hidden="true">
          <text x="630" y="352" textAnchor="end" style={numeralStroke ? { stroke: numeralStroke } : undefined}>
            0{index}
          </text>
        </svg>
        <p className="eyebrow" data-reveal="" style={accentStyle}>
          <span className="rule" />
          <span className="split type">
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

      {/* Franja gigante que corre de lado con el scroll (dirección alterna por zona). */}
      <div className={`band ${index % 2 ? 'band--l' : 'band--r'}`} data-m="" aria-hidden="true">
        <div className="band-track">
          {[0, 1, 2, 3].map((k) => (
            <span key={k} className="band-run">
              <span className="band-word">{parts[0]}</span>
              <span className="band-dot">✦</span>
              <span className="band-em">{parts[1]}</span>
              <span className="band-dot">✦</span>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
