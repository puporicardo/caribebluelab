import { useEffect, useRef, type RefObject } from 'react';
import type { Box, PointerState } from '../ocean/types';

interface WaterRipplesProps {
  pointer: Box<PointerState>;
  /** Cantidad de ondas reutilizables. */
  count?: number;
  /** Diámetro base de cada onda en px. */
  size?: number;
  /**
   * Kiosco: escena de tamaño fijo (p. ej. 1920×1080) escalada a la pantalla.
   * Las coordenadas del puntero se convierten a ese espacio. Sin esto, se usa la ventana.
   */
  stage?: { ref: RefObject<HTMLElement | null>; width: number; height: number };
}

/**
 * Sensación de moverse dentro del agua: el puntero deja ondas suaves al desplazarse
 * y al tocar. No hay burbujas ni nada que siga al cursor.
 */
export function WaterRipples({ pointer, count = 10, size = 170, stage }: WaterRipplesProps) {
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const st = { tx: Number.NaN, ty: Number.NaN, acc: 0, last: 0, next: 0 };

    const toLocal = (e: PointerEvent) => {
      if (stage?.ref.current) {
        const r = stage.ref.current.getBoundingClientRect();
        const k = r.width / stage.width || 1;
        const x = (e.clientX - r.left) / k;
        const y = (e.clientY - r.top) / k;
        return { x, y, nx: x / stage.width, ny: y / stage.height };
      }
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      return { x: e.clientX, y: e.clientY, nx: e.clientX / w, ny: e.clientY / h };
    };

    const ripple = (x: number, y: number, k: number) => {
      const spans = layer.current?.children;
      if (!spans || !spans.length) return;
      const el = spans[st.next++ % spans.length] as HTMLElement;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.setProperty('--k', String(k));
      el.style.animation = 'none';
      void el.offsetWidth; // reinicia la animación
      el.style.animation = `cbl-ripple ${(0.9 + k * 0.5).toFixed(2)}s cubic-bezier(.2,.6,.3,1) forwards`;
    };

    const onMove = (e: PointerEvent) => {
      const p = toLocal(e);
      const d = Number.isNaN(st.tx) ? 0 : Math.hypot(p.x - st.tx, p.y - st.ty);
      st.tx = p.x;
      st.ty = p.y;
      const now = performance.now();
      pointer.current.nx = p.nx;
      pointer.current.ny = p.ny;
      pointer.current.active = true;
      pointer.current.seen = now;
      if (reduce) return;
      st.acc += Math.min(d, 300);
      if (st.acc > 340 && now - st.last > 280) {
        st.acc = 0;
        st.last = now;
        ripple(p.x, p.y, 0.9);
      }
    };

    const onDown = (e: PointerEvent) => {
      if (reduce) return;
      const p = toLocal(e);
      ripple(p.x, p.y, 1.7);
      window.setTimeout(() => ripple(p.x, p.y, 1.1), 140);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [pointer, stage?.ref, stage?.width, stage?.height]);

  return (
    <div ref={layer} className="ripples" aria-hidden="true" style={stage ? { position: 'absolute' } : undefined}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="ripple" style={{ width: size, height: size }} />
      ))}
    </div>
  );
}
