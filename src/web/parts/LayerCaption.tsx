import { useEffect, useRef } from 'react';
import { useContent } from '../../content';
import type { Box } from '../../shared/ocean/types';

/** Cuánto (en tramos de película) dura el rótulo alrededor de cada llegada. */
const SPAN = 0.16;

/**
 * Rótulo de capítulo, como en un documental: cuando la cámara llega a una profundidad,
 * aparece abajo y al centro su número y su nombre, y se va mientras la página sigue.
 * Lee el tiempo de la película sin provocar renders.
 */
export function LayerCaption({ film }: { film: Box<number> }) {
  const t = useContent();
  const refs = useRef<(HTMLParagraphElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    let cur = film.current;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      // Un salto (menú, enlace) no recorre todas las capas: no se muestran rótulos de paso.
      if (Math.abs(film.current - cur) > 0.5) cur = film.current;
      else cur += (film.current - cur) * 0.12;
      refs.current.forEach((el, k) => {
        if (!el) return;
        // Zona k+1 llega al final del tramo k+1 (T = k+1).
        const x = (cur - (k + 1)) / SPAN;
        const o = Math.max(0, 1 - x * x);
        el.style.opacity = (o * o).toFixed(3);
        el.style.setProperty('--x', x.toFixed(3));
      });
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [film]);

  return (
    <div className="caption" aria-hidden="true">
      {t.zones.slice(1).map((z, k) => (
        <p
          key={z.name}
          ref={(el) => {
            refs.current[k] = el;
          }}
          className="caption-card"
        >
          <span className="caption-n">0{k + 1}</span>
          <span className="caption-name">{z.name}</span>
          <span className="caption-verb">{z.verb}</span>
        </p>
      ))}
    </div>
  );
}
