import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { VIDEO_RATE, ZONE_VIDEOS } from '../config/media';
import type { Box } from '../ocean/types';

interface VideoStackProps {
  /** Zona activa (su video se ve; los demás quedan en opacidad 0). */
  active: number;
  /** Se pone en true cuando algún video empieza a sonar (el océano pasa a capa de partículas). */
  playing: Box<boolean>;
  /** Estilo por video (posición/transición de cada capa). */
  layerStyle: (index: number, isActive: boolean) => CSSProperties;
  /** Cuántas zonas vecinas se precargan alrededor de la activa. */
  preloadRadius?: number;
}

type Source = 'local' | 'remote' | 'none';

/** Seis videos superpuestos con fundido entre profundidades. Cada uno intenta la copia local y luego la remota. */
export function VideoStack({ active, playing, layerStyle, preloadRadius = 1 }: VideoStackProps) {
  const [sources, setSources] = useState<Source[]>(() => ZONE_VIDEOS.map(() => 'local'));
  const refs = useRef<(HTMLVideoElement | null)[]>([]);

  const fallback = (i: number) =>
    setSources((prev) => prev.map((s, j) => (j !== i ? s : s === 'local' ? 'remote' : 'none')));

  // Mantiene en reproducción solo la activa y sus vecinas (ahorra batería y ancho de banda).
  useEffect(() => {
    // Sin video para la zona activa: el océano WebGL vuelve a dibujar el fondo completo.
    if (sources[active] === 'none') playing.current = false;
    refs.current.forEach((v, i) => {
      if (!v) return;
      const near = Math.abs(i - active) <= preloadRadius;
      if (near) {
        v.muted = true;
        const p = v.play();
        if (p) p.catch(() => undefined);
      } else if (!v.paused) {
        v.pause();
      }
    });
  }, [active, preloadRadius, sources, playing]);

  return (
    <>
      {ZONE_VIDEOS.map((video, i) => {
        const src = sources[i] === 'local' ? video.local : sources[i] === 'remote' ? video.remote : undefined;
        if (!src) return null;
        const near = Math.abs(i - active) <= preloadRadius;
        return (
          <video
            key={`${i}-${sources[i]}`}
            ref={(el) => {
              refs.current[i] = el;
            }}
            src={src}
            muted
            loop
            playsInline
            autoPlay={near}
            preload={near ? 'auto' : 'metadata'}
            aria-hidden="true"
            tabIndex={-1}
            onError={() => fallback(i)}
            onPlaying={(e) => {
              playing.current = true;
              e.currentTarget.playbackRate = VIDEO_RATE;
            }}
            onLoadedMetadata={(e) => {
              e.currentTarget.playbackRate = VIDEO_RATE;
            }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: i === active ? 1 : 0,
              ...layerStyle(i, i === active),
            }}
          />
        );
      })}
    </>
  );
}
