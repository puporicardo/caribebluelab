import { useEffect, type RefObject } from 'react';

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * Motion ligado al scroll. Cada elemento con [data-m] recibe dos variables CSS que se
 * actualizan en cada cuadro de scroll (sin renders de React):
 *   --v  recorrido por la pantalla: 0 cuando su borde superior asoma abajo, 1 cuando
 *        su borde inferior sale por arriba (0,5 ≈ centrado).
 *   --e  entrada: 0 al asomar, 1 cuando su borde superior llega al 45 % de la pantalla.
 * El CSS decide qué hacer con ellas (parallax, trazos que se dibujan, máscaras…).
 * Con movimiento reducido todo queda en su estado final (--v: .5, --e: 1).
 */
export function useScrollMotion(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const host = root.current;
    if (!host) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    let els: HTMLElement[] = [];
    const last = new WeakMap<HTMLElement, [number, number]>();
    const collect = () => {
      els = Array.from(host.querySelectorAll<HTMLElement>('[data-m]'));
      if (reduce)
        els.forEach((el) => {
          el.style.setProperty('--v', '0.5');
          el.style.setProperty('--e', '1');
        });
    };
    collect();
    if (reduce) return;

    let raf = 0;
    const measure = () => {
      raf = 0;
      const vh = window.innerHeight || 800;
      // Primero se leen todas las posiciones, después se escriben (un solo layout).
      const rects = els.map((el) => el.getBoundingClientRect());
      for (let k = 0; k < els.length; k++) {
        const r = rects[k];
        const v = clamp01((vh - r.top) / (vh + r.height));
        const e = clamp01((vh - r.top) / (vh * 0.55));
        const prev = last.get(els[k]);
        if (prev && Math.abs(prev[0] - v) < 0.0015 && Math.abs(prev[1] - e) < 0.0015) continue;
        last.set(els[k], [v, e]);
        els[k].style.setProperty('--v', v.toFixed(4));
        els[k].style.setProperty('--e', e.toFixed(4));
      }
    };
    const request = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    // Las páginas cambian por dentro (especie elegida, idioma): se vuelve a buscar.
    let mt = 0;
    const mo = new MutationObserver(() => {
      window.clearTimeout(mt);
      mt = window.setTimeout(() => {
        collect();
        request();
      }, 120);
    });
    mo.observe(host, { childList: true, subtree: true });

    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    document.fonts?.ready.then(request);
    request();
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(mt);
      mo.disconnect();
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
    };
  }, [root]);
}
