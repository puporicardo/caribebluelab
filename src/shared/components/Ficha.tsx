import { Fragment, type CSSProperties } from 'react';
import type { FichaRow } from '../../content/types';
import { Rich } from './Rich';

interface FichaProps {
  rows: readonly FichaRow[];
  className?: string;
  style?: CSSProperties;
}

/** Ficha técnica editorial: etiqueta en versalitas y valor, separados por filetes. */
export function Ficha({ rows, className, style }: FichaProps) {
  return (
    <dl className={['ficha', className].filter(Boolean).join(' ')} style={style}>
      {rows.map(([label, value]) => (
        <Fragment key={label}>
          <dt>{label}</dt>
          <dd>
            <Rich text={value} />
          </dd>
        </Fragment>
      ))}
    </dl>
  );
}
