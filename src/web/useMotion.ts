import { useEffect, type RefObject } from 'react';

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

const TARGETS = [
  '[data-m]',
  '.spread > *',
  '.songs > li',
  '.films-list > li',
  '.faro-row',
  '.challenge-grid > li',
  '.howto-index > li',
  '.close',
  '.shelf',
].join(',');

/**
 * Motion ligado al scroll. Cada elemento con [data-m] recibe dos variables CSS que se
 * actualizan en cada cuadro de scroll (sin renders de React):
 *   --v  recorrido por la pantalla: 0 cuando su borde superior asoma abajo, 1 cuando
 *        su borde inferior sale por arriba (0,5 ≈ centrado).
 *   --e  entrada: 0 al asomar, 1 cuando su borde superior llega al 64 % de la pantalla
 *        (todo termina de entrar mientras aún sube por el tercio inferior).
 * El CSS decide qué hacer con ellas (parallax, trazos que se dibujan, máscaras…).
 * Además de [data-m], reciben sus variables los bloques de las secciones (entran por su lado),
 * las filas de tablas y listas, y las tarjetas; y la raíz recibe --vel: la velocidad del
 * scroll suavizada (-1 a 1) para inclinar lo que corre de lado.
 * Todo sigue a un scroll suavizado (inercia), no a la posición cruda: la rueda del ratón avanza
 * a saltos de ~100 px y eso se vería fotograma a fotograma.
 * Con movimiento reducido todo queda en su estado final (--v: .5, --e: 1).
 */
export function useScrollMotion(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const host = root.current;
    if (!host) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    type Item = { el: HTMLElement; top: number; h: number; v: number; e: number };
    let items: Item[] = [];
    /** Posición en el documento sin transformaciones (offsetTop no ve los translate). */
    const docTop = (el: HTMLElement) => {
      let y = 0;
      let n: HTMLElement | null = el;
      while (n) {
        y += n.offsetTop;
        n = n.offsetParent as HTMLElement | null;
      }
      return y;
    };
    const collect = () => {
      items = Array.from(host.querySelectorAll<HTMLElement>(TARGETS)).map((el) => ({
        el,
        top: docTop(el),
        h: el.offsetHeight,
        v: -1,
        e: -1,
      }));
      if (reduce)
        items.forEach(({ el }) => {
          el.style.setProperty('--v', '0.5');
          el.style.setProperty('--e', '1');
        });
    };
    collect();
    if (reduce) return;

    // Scroll suavizado: las animaciones siguen a un valor con inercia, no a los saltos de la rueda.
    let sy = window.scrollY;
    let raf = 0;
    let last = performance.now();
    let vel = 0;
    // En <html>: la cabecera y el logo (fuera de <main>) también leen --vel.
    const docEl = document.documentElement;

    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const target = window.scrollY;
      const vh = window.innerHeight || 800;
      // Un salto grande (menú, enlace) no se anima: llega directo.
      const k = Math.abs(target - sy) > vh * 2.5 ? 1 : 1 - Math.exp(-dt * 9);
      const prev = sy;
      sy += (target - sy) * k;
      if (Math.abs(target - sy) < 0.3) sy = target;
      const inst = k === 1 ? 0 : (sy - prev) / Math.max(0.001, dt) / 2400; // ~2400 px/s = tope
      vel += (Math.max(-1, Math.min(1, inst)) - vel) * 0.25;
      docEl.style.setProperty('--vel', Math.abs(vel) < 0.003 ? '0' : vel.toFixed(3));
      host.style.setProperty('--sy', Math.min(3, sy / vh).toFixed(4));

      for (const it of items) {
        const top = it.top - sy;
        const v = clamp01((vh - top) / (vh + it.h));
        // La entrada termina cuando el borde superior llega al 64 % de la pantalla (tercio inferior).
        const e = clamp01((vh * 0.98 - top) / (vh * 0.34));
        if (Math.abs(it.v - v) < 0.0008 && Math.abs(it.e - e) < 0.0008) continue;
        it.v = v;
        it.e = e;
        it.el.style.setProperty('--v', v.toFixed(4));
        it.el.style.setProperty('--e', e.toFixed(4));
      }
      if (sy !== target || Math.abs(vel) > 0.003) raf = requestAnimationFrame(frame);
    };
    const request = () => {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const relayout = () => {
      collect();
      request();
    };

    // Las páginas cambian por dentro (especie, idioma, imágenes que cargan): se vuelve a medir.
    let mt = 0;
    const mo = new MutationObserver(() => {
      window.clearTimeout(mt);
      mt = window.setTimeout(relayout, 120);
    });
    mo.observe(host, { childList: true, subtree: true });
    const ro = new ResizeObserver(() => {
      window.clearTimeout(mt);
      mt = window.setTimeout(relayout, 120);
    });
    ro.observe(host);

    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', relayout);
    document.fonts?.ready.then(relayout);
    request();
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(mt);
      mo.disconnect();
      ro.disconnect();
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', relayout);
    };
  }, [root]);
}
