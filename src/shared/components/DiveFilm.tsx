import { useEffect, useRef } from 'react';
import './film.css';
import { FILM_LEGS } from '../config/film';
import type { Box } from '../ocean/types';

interface DiveFilmProps {
  /** Tiempo de la película que pide el scroll: tramo + progreso (0 … FILM_LEGS.length). */
  film: Box<number>;
  /** Se pone en true cuando el primer tramo pinta (el océano WebGL pasa a capa de partículas). */
  playing: Box<boolean>;
}

/** Ancho (en tramos) del fundido de seguridad en cada costura. Los fotogramas ya coinciden. */
const SEAM = 0.012;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smoothstep = (a: number, b: number, v: number) => {
  const x = clamp((v - a) / (b - a));
  return x * x * (3 - 2 * x);
};

/**
 * Película del descenso recorrida con el scroll (técnica scroll-world).
 * - Cada tramo se descarga como Blob: siempre se puede buscar (seek) aunque el host no sirva rangos.
 * - Solo se cargan el tramo activo y sus vecinos; el resto llega en segundo plano.
 * - Nunca se encola un seek mientras el decodificador sigue buscando (los teléfonos no se congelan).
 * - Cada fotograma buscado se copia a un <canvas>: se pinta igual en todos los navegadores
 *   (iOS no pinta un video silenciado que nunca se reprodujo) y la composición es estable.
 * - El póster queda debajo hasta que llega el primer fotograma.
 * - Con movimiento reducido solo se ven los pósteres, con fundido.
 */
export function DiveFilm({ film, playing }: DiveFilmProps) {
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const root = rootRef.current;
    const coarse = window.matchMedia?.('(hover: none) and (pointer: coarse)').matches ?? false;
    const small = window.matchMedia?.('(max-width: 860px)');
    const isMobile = () => coarse || !!small?.matches;

    type Leg = { el: HTMLDivElement; video: HTMLVideoElement | null; url: string | null; loading: boolean; ready: boolean; painted: boolean };
    const legs: Leg[] = FILM_LEGS.map((_, i) => ({ el: layers.current[i]!, video: null, url: null, loading: false, ready: false, painted: false }));
    const N = legs.length;
    let cur = film.current;
    let raf = 0;
    let alive = true;
    let userReady = false;

    const prime = (v: HTMLVideoElement | null) => {
      if (!v || !isMobile()) return;
      const p = v.play();
      if (p) p.then(() => v.pause()).catch(() => undefined);
    };

    const load = (i: number) => {
      const L = legs[i];
      if (!L || reduce || L.loading) return;
      L.loading = true;
      const meta = FILM_LEGS[i];
      const src = isMobile() ? meta.srcMobile : meta.src;
      fetch(src)
        .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
        .then((blob) => {
          if (!alive) return;
          const v = document.createElement('video');
          v.className = 'film-source';
          v.muted = true;
          v.playsInline = true;
          v.preload = 'auto';
          v.setAttribute('muted', '');
          v.setAttribute('playsinline', '');
          v.setAttribute('aria-hidden', 'true');
          v.tabIndex = -1;
          L.url = URL.createObjectURL(blob);
          v.src = L.url;
          v.addEventListener('loadedmetadata', () => {
            L.ready = true;
          });
          const c = document.createElement('canvas');
          c.className = 'film-video';
          const ctx = c.getContext('2d', { alpha: false, willReadFrequently: false });
          let tries = 0;
          const draw = () => {
            if (!ctx || !v.videoWidth) return;
            if (c.width !== v.videoWidth) {
              c.width = v.videoWidth;
              c.height = v.videoHeight;
            }
            ctx.drawImage(v, 0, 0, c.width, c.height);
            if (!L.painted) {
              // El póster solo se retira cuando el canvas ya tiene imagen (no un cuadro negro).
              const px = ctx.getImageData(c.width >> 1, c.height >> 1, 1, 1).data;
              if (px[0] + px[1] + px[2] < 6 && ++tries < 4) return;
              L.painted = true;
              L.el.classList.add('has-clip');
              playing.current = true;
            }
          };
          v.addEventListener('seeked', () => {
            if ('requestVideoFrameCallback' in v) v.requestVideoFrameCallback(() => draw());
            draw();
          });
          v.addEventListener('loadeddata', () => {
            v.pause();
            if (userReady) prime(v);
          });
          L.el.appendChild(v);
          L.el.appendChild(c);
          L.video = v;
        })
        .catch(() => {
          // Sin video: queda el póster (y el océano WebGL debajo si tampoco hay póster).
        });
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const target = clamp(film.current, 0, N);
      // Saltos grandes (menú, enlace): corte directo, sin recorrer ni descargar los tramos de paso.
      if (Math.abs(target - cur) > 0.6) cur = target;
      else cur += (target - cur) * (reduce ? 1 : 0.14);
      if (Math.abs(target - cur) < 0.0004) cur = target;
      const a = Math.min(N - 1, Math.floor(cur));

      // Al romper la superficie (tramo 6, ~78 %): destello y lente mojada un instante.
      const f = reduce ? 0 : Math.exp(-(((cur - 5.785) / 0.028) ** 2));
      if (root) root.style.filter = f > 0.01 ? `brightness(${(1 + f * 0.55).toFixed(3)}) blur(${(f * 5).toFixed(2)}px)` : '';

      // Carga perezosa: activo y vecinos ya; los siguientes en cola.
      load(a);
      load(a + 1);
      if (a > 0) load(a - 1);

      for (let i = 0; i < N; i++) {
        const L = legs[i];
        // Cada tramo aparece al llegar su costura (los de abajo quedan tapados).
        const op = i === 0 ? 1 : reduce ? smoothstep(i - 0.18, i + 0.18, cur) : smoothstep(i - SEAM, i + SEAM, cur);
        const near = i >= a - 1 && i <= a + 1;
        L.el.style.opacity = op.toFixed(3);
        L.el.style.visibility = near && op > 0.001 ? 'visible' : 'hidden';
        if (!near || !L.video || !L.ready || L.video.seeking) continue;
        const dur = L.video.duration || 10;
        const t = clamp(cur - i, 0, 0.9995) * dur;
        const eps = isMobile() ? 1 / 24 : 1 / 48;
        // El primer seek fuerza a pintar un fotograma (iOS y Safari no lo hacen solos).
        if (!L.painted || Math.abs(L.video.currentTime - t) > eps) {
          if (!L.painted && Math.abs(L.video.currentTime - t) <= eps) {
            L.video.currentTime = t + 0.001;
            continue;
          }
          try {
            L.video.currentTime = t;
          } catch {
            /* algunos navegadores lanzan si aún no hay datos */
          }
        }
      }
    };

    const onFirstGesture = () => {
      if (userReady) return;
      userReady = true;
      legs.forEach((L) => prime(L.video));
    };
    window.addEventListener('pointerdown', onFirstGesture, { once: true, passive: true });
    window.addEventListener('touchstart', onFirstGesture, { once: true, passive: true });

    // Escritorio: precarga el resto pasado un rato. En teléfonos solo se cargan los vecinos.
    const idle = window.setTimeout(() => {
      if (!reduce && !isMobile()) legs.forEach((_, i) => load(i));
    }, 6000);

    raf = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(idle);
      window.removeEventListener('pointerdown', onFirstGesture);
      window.removeEventListener('touchstart', onFirstGesture);
      legs.forEach((L) => {
        L.video?.remove();
        L.el?.querySelector('canvas')?.remove();
        L.el?.classList.remove('has-clip');
        if (L.url) URL.revokeObjectURL(L.url);
      });
    };
  }, [film, playing]);

  return (
    <div ref={rootRef} className="film" aria-hidden="true">
      {FILM_LEGS.map((leg, i) => (
        <div
          key={leg.src}
          ref={(el) => {
            layers.current[i] = el;
          }}
          className="film-leg"
          style={{ opacity: i === 0 ? 1 : 0 }}
        >
          <img
            className="film-poster"
            src={leg.poster}
            alt=""
            decoding="async"
            loading={i < 2 ? 'eager' : 'lazy'}
            onLoad={
              i === 0
                ? () => {
                    // Con el póster a la vista el océano WebGL pasa a ser solo luz y partículas.
                    playing.current = true;
                  }
                : undefined
            }
          />
        </div>
      ))}
    </div>
  );
}
