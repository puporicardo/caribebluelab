import { useEffect, type RefObject } from 'react';

/**
 * Aparición al entrar en pantalla para todo elemento con [data-reveal] dentro de `root`:
 * recibe .is-in una vez y el CSS hace el resto (palabras que suben, filetes que se dibujan,
 * listas escalonadas, enfoque desde el desenfoque del agua).
 * También observa los que se montan después (cambio de especie, de idioma…).
 * Sin JavaScript (o sin IntersectionObserver) el contenido se ve igual, solo sin animación.
 */
export function useReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const host = root.current;
    if (!host) return;
    document.documentElement.classList.add('cbl-js');
    const pending = () => Array.from(host.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)'));
    if (!('IntersectionObserver' in window)) {
      pending().forEach((el) => el.classList.add('is-in'));
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
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    const watch = () => pending().forEach((el) => io.observe(el));
    watch();
    const mo = new MutationObserver(watch);
    mo.observe(host, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [root]);
}
