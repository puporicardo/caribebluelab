import type { CSSProperties } from 'react';

/** Variables CSS personalizadas tipadas para `style` (p. ej. cssVars({ '--hatch-bg': '…' })). */
export const cssVars = (vars: Record<`--${string}`, string | number>, extra?: CSSProperties): CSSProperties =>
  ({ ...(vars as unknown as CSSProperties), ...extra });
