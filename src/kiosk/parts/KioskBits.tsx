import type { CSSProperties, ReactNode } from 'react';
import { useContent } from '../../content';
import { Rich } from '../../shared/components/Rich';

/** Bloque que entra con desenfoque y desplazamiento (cada momento del bucle se monta de nuevo). */
export function Ani({ as: Tag = 'div', delay = 0, className, style, children }: {
  as?: 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'ol' | 'figure' | 'dl';
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <Tag className={['ani', className].filter(Boolean).join(' ')} style={{ animationDelay: `${delay}s`, ...style }}>
      {children}
    </Tag>
  );
}

/** Eyebrow de experiencia: “02 · Tocar y crear · Experiencia 1 de 2”. */
export function ExpEyebrow({ n, text, color, delay = 0 }: { n: string; text: string; color?: string; delay?: number }) {
  return (
    <p className="eyebrow ani k-exp" style={{ color, animationDelay: `${delay}s` }}>
      <span className="n">{n}</span>
      {text}
    </p>
  );
}

/** Apertura de zona: numeral gigante, eyebrow, titular y verbo. */
export function KioskZoneHead({
  index,
  accent,
  ink,
  stroke,
  delays = [1.2, 1.4, 1.7],
  top = 262,
  titleSize = 124,
}: {
  index: 1 | 2 | 3 | 4 | 5;
  accent?: string;
  ink?: string;
  stroke?: string;
  delays?: [number, number, number];
  top?: number;
  titleSize?: number;
}) {
  const t = useContent();
  const z = t.zones[index];
  const accentStyle = accent ? { color: accent } : undefined;
  return (
    <section aria-label={z.name} className="k-beat" style={{ color: ink }}>
      <p className="num" aria-hidden="true" style={{ left: index === 1 ? 900 : 860, top: 190, WebkitTextStrokeColor: stroke, animationDelay: index === 5 ? '5s' : undefined }}>
        0{index}
      </p>
      <div className="k-head" style={{ top }}>
        <p className="eyebrow ani" style={{ ...accentStyle, animationDelay: `${delays[0]}s` }}>
          <span className="rule" style={accent ? { background: accent } : { background: 'currentColor' }} />
          {t.ui.zoneEyebrow(index, z.name)}
        </p>
        <h2 className="disp ani" style={{ fontSize: titleSize, lineHeight: 0.98, animationDelay: `${delays[1]}s` }}>
          <Rich text={z.title} emStyle={accentStyle} />
        </h2>
        <p className="disp ani k-verb" style={{ ...accentStyle, animationDelay: `${delays[2]}s` }}>
          <span className="rule" style={accent ? { background: accent } : { background: 'currentColor' }} />
          {z.verb}
        </p>
      </div>
    </section>
  );
}

/** Columna izquierda de texto de cada experiencia. */
export function KioskColumn({ width = 660, top = 186, children }: { width?: number; top?: number; children: ReactNode }) {
  return (
    <div className="k-col" style={{ width, top }}>
      {children}
    </div>
  );
}
