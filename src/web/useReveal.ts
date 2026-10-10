import { useEffect, type RefObject } from 'react';

/**
 * Aparición suave al entrar en pantalla para todo elemento con [data-reveal] dentro de `root`.
 * Sin JavaScript (o sin IntersectionObserver) el contenido se ve igual, solo sin animación.
 */
export function useReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const host = root.current;
    if (!host) return;
    document.documentElement.classList.add('cbl-js');
    const els = Array.from(host.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('is-in');
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [root]);
}
