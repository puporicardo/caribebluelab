import { Fragment, type CSSProperties, type ReactNode } from 'react';

interface RichProps {
  text: string;
  /** Estilo para las partes en cursiva (p. ej. color del acento de la zona). */
  emStyle?: CSSProperties;
  /**
   * Parte el texto en palabras enmascaradas (.w > .wi) para que entren una a una
   * cuando su contenedor recibe .is-in. El orden va en --i (retardo escalonado).
   */
  split?: boolean;
}

/** Convierte *texto* en <em>texto</em>. Sin HTML arbitrario: solo cursivas. */
export function Rich({ text, emStyle, split = false }: RichProps) {
  const parts = text.split('*');
  let n = 0;
  const words = (part: string): ReactNode =>
    part.split(/(\s+)/).map((w, k) => {
      if (!w) return null;
      if (/^\s+$/.test(w)) return ' ';
      const i = n++;
      return (
        <span key={k} className="w" style={{ '--i': i } as CSSProperties}>
          <span className="wi">{w}</span>
        </span>
      );
    });

  return (
    <>
      {parts.map((part, i) => {
        const body = split ? words(part) : part;
        return i % 2 === 1 ? (
          <em key={i} style={emStyle}>
            {body}
          </em>
        ) : (
          <Fragment key={i}>{body}</Fragment>
        );
      })}
    </>
  );
}

/** Texto plano sin marcas (para atributos aria, títulos de documento…). */
export const plain = (text: string) => text.replace(/\*/g, '');
