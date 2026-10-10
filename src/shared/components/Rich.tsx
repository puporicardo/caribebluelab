import { Fragment, type CSSProperties } from 'react';

interface RichProps {
  text: string;
  /** Estilo para las partes en cursiva (p. ej. color del acento de la zona). */
  emStyle?: CSSProperties;
}

/** Convierte *texto* en <em>texto</em>. Sin HTML arbitrario: solo cursivas. */
export function Rich({ text, emStyle }: RichProps) {
  const parts = text.split('*');
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <em key={i} style={emStyle}>
            {part}
          </em>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/** Texto plano sin marcas (para atributos aria, títulos de documento…). */
export const plain = (text: string) => text.replace(/\*/g, '');
