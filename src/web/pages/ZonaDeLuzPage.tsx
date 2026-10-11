import { useState } from 'react';
import { useContent } from '../../content';
import { LINKS } from '../../content/links';
import { trackEvent } from '../../shared/analytics';
import { Ficha } from '../../shared/components/Ficha';
import { ArrowRight, PlayIcon } from '../../shared/components/Icons';
import { Rich, plain } from '../../shared/components/Rich';
import { cssVars } from '../../shared/css';
import { ExternalLink } from '../parts/ExternalLink';
import { ZoneHead } from '../parts/ZoneHead';

/** Zona 1 · Zona de luz (Mirar): Art Blue Lab y Festival de Filminutos Cine Al Mar. */
export function ZonaDeLuzPage() {
  const t = useContent();
  const art = t.web.art;
  const films = t.web.films;
  const [film, setFilm] = useState(1);
  const current = films.items[film];

  return (
    <section id="zona-de-luz" className="zone" aria-labelledby="titulo-zona-1">
      <div className="wrap">
        <ZoneHead index={1} />

        <article className="spread" aria-label={art.title}>
          <div className="stack" data-reveal="">
            <p className="eyebrow exp-eyebrow">
              <span className="n">01</span>
              {t.ui.experience(1, 2)}
            </p>
            <h3 className="disp exp-title">
              <Rich text={art.title} split />
            </h3>
            <p className="body">{art.body}</p>
            <Ficha rows={art.ficha} />
            <div className="links-row">
              <ExternalLink href={LINKS.artBlueLabGallery} name="art_blue_lab_galeria" className="link">
                {art.explore} <ArrowRight />
              </ExternalLink>
              <ExternalLink href={LINKS.artBlueLabAlliance} name="art_blue_lab_alianza" className="link link--muted">
                {art.alliance}
              </ExternalLink>
            </div>
          </div>
          <figure className="art-figs" data-reveal="" data-m="">
            <div>
              <div className="hatch frame frame--4x5">
                <span className="crop" />
                <span className="frame-label">{art.work}</span>
              </div>
              <p className="figcap">
                <b>{t.ui.fig} 1.1</b>
                {art.fig1}
              </p>
            </div>
            <div className="art-figs-side">
              <div className="hatch frame frame--3x4" style={cssVars({ '--hatch-bg': 'linear-gradient(200deg, #D2BB81, #2A4C72)' })}>
                <span className="crop" />
              </div>
              <p className="figcap">
                <b>{t.ui.fig} 1.2</b>
                {art.fig2}
              </p>
              <p className="eyebrow network-title">{art.network}</p>
              <svg viewBox="0 0 220 70" aria-hidden="true" className="network-arc draw-wipe">
                <path d="M10 56 Q110 -8 210 56" fill="none" stroke="#6FE3D6" strokeWidth="1.2" strokeDasharray="4 6" className="dash" />
                <circle cx="10" cy="56" r="3.5" fill="#F5F3F0" />
                <circle cx="210" cy="56" r="3.5" fill="#F5F3F0" />
              </svg>
              <div className="network-places">
                <span>{art.places[0]}</span>
                <span>{art.places[1]}</span>
              </div>
            </div>
          </figure>
        </article>

        <article className="spread rev" aria-label={plain(films.title)}>
          <div className="stack" data-reveal="">
            <p className="eyebrow exp-eyebrow">
              <span className="n">01</span>
              {t.ui.experience(2, 2)}
            </p>
            <h3 className="disp exp-title exp-title--sm">
              <Rich text={films.title} split />
            </h3>
            <p className="body">{films.body}</p>
            <Ficha rows={films.ficha} />
            <p className="note">{films.note}</p>
          </div>
          <figure className="films" data-reveal="" data-m="">
            <div className="films-screen">
              <span className="crop" />
              <p className="eyebrow films-count">{films.screen(current.n.slice(0, 2))}</p>
              <button
                type="button"
                className="play-circle"
                aria-label={t.ui.playTitle(current.title)}
                onClick={() => trackEvent('filminuto', { accion: 'reproducir', filminuto: current.n })}
              >
                <PlayIcon width={20} height={22} color="#F5F3F0" />
              </button>
              <p className="disp it films-title">{current.title}</p>
            </div>
            <ol className="films-list stagger">
              {films.items.map((item, i) => (
                <li key={item.n}>
                  <button type="button" aria-current={i === film ? 'true' : undefined} className={i === film ? 'is-on' : ''} onClick={() => setFilm(i)}>
                    <span className="disp it">{item.n}</span>
                    <span>{item.title}</span>
                    <span>{i === film ? t.ui.nowPlaying : films.duration}</span>
                  </button>
                </li>
              ))}
            </ol>
          </figure>
        </article>
      </div>
    </section>
  );
}
