import { useMemo, useState, type PointerEvent } from 'react';
import { useContent } from '../../content';
import { trackEvent } from '../../shared/analytics';
import { Ficha } from '../../shared/components/Ficha';
import { PauseIcon, PlayIcon } from '../../shared/components/Icons';
import { Rich, plain } from '../../shared/components/Rich';
import { makeBars } from '../../shared/bars';
import { cssVars } from '../../shared/css';
import { ZoneHead } from '../parts/ZoneHead';

/** Acento coral de todo el sitio; la bioluminiscencia (cian) queda en lo que brilla: marcas, onda, linterna. */
const ACCENT = 'var(--c-accent)';

const PLATES = [
  { left: '4%', top: '7%', width: '42%', height: '46%', bg: 'linear-gradient(140deg, #1D3256, #0B1B33)' },
  { left: '52%', top: '12%', width: '44%', height: '52%', bg: 'linear-gradient(200deg, #2A4C72, #0B1B33)' },
  { left: '12%', top: '60%', width: '34%', height: '33%', bg: 'linear-gradient(100deg, #1D3256, #0B1B33)' },
  { left: '56%', top: '70%', width: '30%', height: '24%', bg: 'linear-gradient(60deg, #2A4C72, #0B1B33)' },
];

/** Zona 4 · Zona oscura (Escuchar y descubrir): paisajes sonoros y exposición que se ilumina con el puntero. */
export function ZonaOscuraPage() {
  const t = useContent();
  const sounds = t.web.sounds;
  const creatures = t.web.creatures;
  const [track, setTrack] = useState(0);
  const [playing, setPlaying] = useState(true);
  const bars = useMemo(() => makeBars(48, 11), []);
  const [spot, setSpot] = useState({ x: 300, y: 220 });

  const light = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setSpot({ x: Math.round(e.clientX - r.left), y: Math.round(e.clientY - r.top) });
  };

  const togglePlay = () => {
    trackEvent('audio', { accion: playing ? 'pausar' : 'reproducir', pista: sounds.tracks[track] });
    setPlaying(!playing);
  };

  return (
    <section id="zona-oscura" className="zone" aria-labelledby="titulo-zona-4">
      <div className="wrap">
        <ZoneHead index={4} accent={ACCENT} numeralStroke="rgba(111,227,214,.25)" />

        <article className="spread" aria-label={plain(sounds.title)}>
          <div className="stack" data-reveal="">
            <p className="eyebrow exp-eyebrow" style={{ color: ACCENT }}>
              <span className="n">04</span>
              {t.ui.experience(1, 2)}
            </p>
            <h3 className="disp exp-title">
              <Rich text={sounds.title} split />
            </h3>
            <p className="body">{sounds.body}</p>
            <Ficha rows={sounds.ficha} />
          </div>
          <figure className="sound" data-reveal="" data-m="">
            <div role="tablist" aria-label={sounds.tracksLabel} className="tabs">
              {sounds.tracks.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  role="tab"
                  aria-selected={i === track}
                  className={`tab ${i === track ? 'is-on' : ''}`}
                  style={i === track ? { boxShadow: `inset 0 -2px 0 ${ACCENT}` } : undefined}
                  onClick={() => setTrack(i)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className={`sound-wave ${playing ? '' : 'is-paused'}`} aria-hidden="true">
              <span className="crop" style={{ color: 'rgba(111,227,214,.6)' }} />
              {bars.map((b, i) => (
                <span key={i} style={cssVars({ '--bi': i }, { height: b.h, animationDuration: `${b.d}s`, animationDelay: `${b.dl}s` })} />
              ))}
            </div>
            <div className="sound-controls">
              <button type="button" className="sound-play" aria-label={playing ? t.ui.pause : t.ui.play} onClick={togglePlay}>
                {playing ? <PauseIcon color="#0B1B33" /> : <PlayIcon color="#0B1B33" />}
              </button>
              <div className="sound-progress">
                <span />
              </div>
              <button type="button" className="link link--button">
                {t.ui.fullscreen}
              </button>
            </div>
            <p className="figcap">
              <b>{t.ui.fig} 4.1</b>
              {sounds.fig}
            </p>
          </figure>
        </article>

        <article className="spread rev" aria-label={plain(creatures.title)}>
          <div className="stack" data-reveal="">
            <p className="eyebrow exp-eyebrow" style={{ color: ACCENT }}>
              <span className="n">04</span>
              {t.ui.experience(2, 2)}
            </p>
            <h3 className="disp exp-title">
              <Rich text={creatures.title} split />
            </h3>
            <p className="body">{creatures.body}</p>
            <Ficha rows={creatures.ficha} />
          </div>
          <figure className="creatures" data-reveal="" data-m="">
            <div className="creatures-box" onPointerMove={light} onPointerDown={light}>
              {PLATES.map((p, i) => (
                <div
                  key={i}
                  className="plate"
                  style={{
                    left: p.left,
                    top: p.top,
                    width: p.width,
                    height: p.height,
                    backgroundImage: `repeating-linear-gradient(135deg, rgba(245,243,240,.06) 0 1px, rgba(245,243,240,0) 1px 13px), ${p.bg}`,
                  }}
                >
                  {creatures.plates[i]}
                </div>
              ))}
              <div
                className="creatures-dark"
                aria-hidden="true"
                style={{
                  background: `radial-gradient(circle 190px at ${spot.x}px ${spot.y}px, rgba(111,227,214,.08) 0, rgba(11,27,51,0) 120px, rgba(11,27,51,.72) 200px, rgba(11,27,51,.97) 300px)`,
                }}
              />
              <span className="crop" style={{ inset: 0, color: 'rgba(111,227,214,.6)' }} />
            </div>
            <p className="figcap">
              <b>{t.ui.fig} 4.2</b>
              {creatures.fig}
            </p>
          </figure>
        </article>
      </div>
    </section>
  );
}
