import { useState } from 'react';
import { useContent } from '../../content';

interface DepthGaugeProps {
  /** Segundo del bucle (0–360). */
  t: number;
  scene: number;
  light: boolean;
  onJump: (scene: number) => void;
}

/**
 * Regla de profundidad: el indicador baja de forma continua (100 px por minuto).
 * No hay barra de reproducción: el tiempo se lee como profundidad.
 */
export function DepthGauge({ t, scene, light, onJump }: DepthGaugeProps) {
  const c = useContent();
  const top = Math.round((40 + (t / 60) * 100) * 10) / 10;
  // Si el indicador salta (cambio de escena manual o vuelta a la superficie), se anima más lento.
  const [prevTop, setPrevTop] = useState(top);
  const [bigUntil, setBigUntil] = useState(() => Date.now() + 1600);
  if (top !== prevTop) {
    if (Math.abs(top - prevTop) > 30) setBigUntil(Date.now() + 1600);
    setPrevTop(top);
  }
  const big = Date.now() < bigUntil;
  const marker = light ? '#0B1B33' : '#6FE3D6';

  return (
    <nav aria-label={c.ui.depth} className={`k-gauge ${light ? 'is-light' : ''}`}>
      <span className="eyebrow k-gauge-title">{c.ui.depth}</span>
      <span className="k-gauge-line" />
      <span className="k-gauge-ticks" />
      {c.zones.map((z, i) => (
        <button
          key={i}
          type="button"
          className={`k-stop ${i === scene ? 'is-on' : ''}`}
          aria-current={i === scene ? 'step' : undefined}
          style={{ top: 40 + i * 100 }}
          onClick={() => onJump(i)}
        >
          <span className="k-stop-major" />
          <span className="k-stop-label">
            <span className="k-stop-n">0{i}</span>
            <span className="k-stop-name">{z.name}</span>
          </span>
        </button>
      ))}
      <span
        className="k-marker"
        style={{
          top,
          background: marker,
          boxShadow: `0 0 12px ${marker}`,
          transition: big ? 'top 1.5s cubic-bezier(.45,.05,.2,1), background 3s' : 'top .4s linear, background 3s',
        }}
      >
        <span style={{ background: marker }} />
      </span>
    </nav>
  );
}
