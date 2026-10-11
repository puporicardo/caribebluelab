import { useMemo, useState } from 'react';
import { useContent } from '../../content';
import { trackEvent } from '../../shared/analytics';
import { PauseIcon, PlayIcon } from '../../shared/components/Icons';
import { Rich } from '../../shared/components/Rich';
import { cssVars } from '../../shared/css';
import { makeBars } from '../../shared/bars';
import { ZoneHead } from '../parts/ZoneHead';

const GOLD = '#D2BB81';

/** Colores de portada (paleta) para cada libro de la estantería, en orden. */
const BOOK_TONES: { bg: string; ink?: string; frame: string; label?: string }[] = [
  { bg: 'linear-gradient(165deg, #4C86AE, #1D3256)', frame: 'rgba(245,243,240,.3)' },
  { bg: 'linear-gradient(165deg, #D2BB81, #2A4C72)', frame: 'rgba(245,243,240,.4)', label: '#0B1B33' },
  { bg: 'linear-gradient(165deg, #35668B, #0B1B33)', frame: 'rgba(245,243,240,.3)' },
  { bg: 'linear-gradient(165deg, #2A4C72, #0B1B33)', frame: 'rgba(245,243,240,.3)' },
  { bg: 'linear-gradient(165deg, #D2BB81, #4C86AE)', frame: 'rgba(11,27,51,.25)', ink: '#0B1B33' },
  { bg: 'linear-gradient(165deg, #1D3256, #0B1B33)', frame: 'rgba(111,227,214,.35)', label: '#6FE3D6' },
  { bg: 'linear-gradient(165deg, #F5F3F0, #D2BB81)', frame: 'rgba(11,27,51,.2)', ink: '#0B1B33', label: '#7A5C16' },
  { bg: 'linear-gradient(165deg, #35668B, #1D3256)', frame: 'rgba(245,243,240,.3)' },
  { bg: 'linear-gradient(165deg, #0B1B33, #1D3256)', frame: 'rgba(210,187,129,.4)', label: '#D2BB81' },
];

/** Zona 3 · Pradera marina (Leer y cantar): estantería CUBI y rincón de escucha. */
export function PraderaMarinaPage() {
  const t = useContent();
  const shelf = t.web.shelf;
  const corner = t.web.corner;
  const [song, setSong] = useState(0);
  const [playing, setPlaying] = useState(false);
  const bars = useMemo(() => makeBars(24, 11), []);

  const toggle = (i: number) => {
    const willPlay = i === song ? !playing : true;
    setSong(i);
    setPlaying(willPlay);
    trackEvent('audio', { accion: willPlay ? 'reproducir' : 'pausar', pista: `cubi_${i + 1}` });
  };

  return (
    <section id="pradera-marina" className="zone" aria-labelledby="titulo-zona-3">
      <div className="wrap">
        <ZoneHead index={3} accent={GOLD} />

        <article aria-label={shelf.title.replace(/\*/g, '')} data-reveal="">
          <div className="shelf-head">
            <h3 className="disp shelf-title">
              <Rich text={shelf.title} split />
            </h3>
            <span className="shelf-note">{shelf.note}</span>
          </div>
          <ul className="shelf stagger">
            {shelf.books.map((b, i) => {
              const tone = BOOK_TONES[i % BOOK_TONES.length];
              return (
                <li key={b.title}>
                  <div className="book" style={cssVars({ '--frame': tone.frame }, { background: tone.bg, color: tone.ink })}>
                    <span className="eyebrow book-label" style={tone.label ? { color: tone.label } : undefined}>
                      {b.label}
                    </span>
                    <span className="disp book-title">{b.title}</span>
                  </div>
                </li>
              );
            })}
            <li>
              <div className="book book--kit">
                <span>{shelf.kit}</span>
              </div>
            </li>
          </ul>
        </article>

        <article className="spread" aria-label={corner.eyebrow}>
          <div className="stack" data-reveal="">
            <p className="eyebrow exp-eyebrow" style={{ color: GOLD }}>
              <span className="n">03</span>
              {corner.eyebrow}
            </p>
            <h3 className="disp exp-title">
              <Rich text={corner.title} split />
            </h3>
            <p className="note">{corner.sources}</p>
          </div>
          <div data-reveal="">
            <ol className="songs stagger">
              {corner.songs.map((s, i) => {
                const on = i === song && playing;
                return (
                  <li key={s}>
                    <button type="button" aria-pressed={on} className={on ? 'is-on' : ''} onClick={() => toggle(i)}>
                      {on ? <PauseIcon color="#6FE3D6" /> : <PlayIcon color="#F5F3F0" />}
                      <span>{s}</span>
                      <span className="songs-meta">{on ? t.ui.nowPlaying : corner.duration}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <div className={`eq ${playing ? '' : 'is-paused'}`} aria-hidden="true">
              {bars.map((b, i) => (
                <span key={i} style={cssVars({ '--bi': i }, { height: b.h, background: GOLD, opacity: 0.8, animationDuration: `${b.d}s`, animationDelay: `${b.dl}s` })} />
              ))}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
