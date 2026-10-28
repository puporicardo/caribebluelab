import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
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

/** Posiciones de las seis láminas (fotos de public/fotos/criaturas), en mosaico. */
const PLATES = [
  { left: '2%', top: '4%', width: '30%', height: '44%' },
  { left: '35%', top: '2%', width: '30%', height: '44%' },
  { left: '68%', top: '6%', width: '30%', height: '40%' },
  { left: '6%', top: '54%', width: '28%', height: '40%' },
  { left: '38%', top: '52%', width: '28%', height: '42%' },
  { left: '70%', top: '54%', width: '28%', height: '40%' },
];

/** Grabaciones de ballenas (public/audio/naturaleza), en el mismo orden que las pestañas de la zona. */
const TRACK_FILES = [
  'ballena-jorobada-llamado.mp3',
  'ballena-jorobada-canto.mp3',
  'ballena-azul-pacifico.mp3',
  'ballena-azul-atlantico.mp3',
  'ballena-jorobada-sonido.mp3',
];

/** Atribuciones de cada grabación (Wikimedia Commons), en el mismo orden que TRACK_FILES. */
const TRACK_CREDITS = [
  'Humpback whale moo · National Park Service (Glacier Bay) · dominio público',
  'Humpback whale song · Stimpert et al. (2012), PLOS ONE · CC BY 2.5',
  'Blue whale, NE Pacific · NOAA PMEL · CC0',
  'Blue whale, Atlantic · NOAA PMEL · CC0',
  'Sound Effect Humpback Whale · copyright-free sound effect · CC BY 3.0',
];

/** Zona 4 · Zona oscura (Escuchar y descubrir): grabaciones de ballenas y exposición que se ilumina con el puntero. */
export function ZonaOscuraPage() {
  const t = useContent();
  const sounds = t.web.sounds;
  const creatures = t.web.creatures;
  const base = import.meta.env.BASE_URL;
  const [track, setTrack] = useState(0);
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const bars = useMemo(() => makeBars(48, 11), []);
  const [spot, setSpot] = useState({ x: 300, y: 220 });

  const light = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setSpot({ x: Math.round(e.clientX - r.left), y: Math.round(e.clientY - r.top) });
  };

  /** Al cambiar de pista, sigue sonando si ya estaba reproduciéndose. */
  useEffect(() => {
    if (playing) audio.current?.play().catch(() => setPlaying(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);

  const togglePlay = () => {
    const el = audio.current;
    if (!el) return;
    trackEvent('audio', { accion: playing ? 'pausar' : 'reproducir', pista: sounds.tracks[track] });
    if (playing) {
      el.pause();
    } else {
      el.play().catch(() => setPlaying(false));
    }
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
            <audio
              ref={audio}
              src={`${base}audio/naturaleza/${TRACK_FILES[track]}`}
              preload="none"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
            />
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
            </div>
            <p className="figcap">
              <b>{t.ui.fig} 4.1</b>
              {sounds.fig}
            </p>
            <ul className="audio-credits">
              {TRACK_CREDITS.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
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
                  className="plate plate--photo"
                  style={{
                    left: p.left,
                    top: p.top,
                    width: p.width,
                    height: p.height,
                    backgroundImage: `url(${base}fotos/criaturas/criatura-${i + 1}.jpg)`,
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
