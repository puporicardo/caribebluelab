import { useState } from 'react';
import { FILMINUTOS } from '../../content/filminutos';
import { useContent } from '../../content';
import { LINKS } from '../../content/links';
import { trackEvent } from '../../shared/analytics';
import { Ficha } from '../../shared/components/Ficha';
import { ArrowRight } from '../../shared/components/Icons';
import { Rich, plain } from '../../shared/components/Rich';
import { ExternalLink } from '../parts/ExternalLink';
import { Lightbox } from '../parts/Lightbox';
import { ZoneHead } from '../parts/ZoneHead';

/** Festival de filminutos visible en la zona de luz; pónlo en false para ocultarlo. */
const SHOW_FILMS = true;

/** Fotos de Art Blue Lab (public/fotos/art-blue-lab), en el visor con miniaturas. */
const ART_PHOTOS = Array.from({ length: 16 }, (_, i) => `art-${String(i + 1).padStart(2, '0')}.jpg`);

/** Zona 1 · Zona de luz (Mirar): Art Blue Lab y Festival de Filminutos Cine al Mar. */
export function ZonaDeLuzPage() {
  const t = useContent();
  const art = t.web.art;
  const films = t.web.films;
  const [film, setFilm] = useState(0);
  const [slide, setSlide] = useState(0);
  const [zoom, setZoom] = useState(false);
  const go = (d: number) => setSlide((i) => (i + d + ART_PHOTOS.length) % ART_PHOTOS.length);
  const current = FILMINUTOS[film];
  const base = import.meta.env.BASE_URL;
  const total = SHOW_FILMS ? 2 : 1;

  return (
    <section id="zona-de-luz" className="zone" aria-labelledby="titulo-zona-1">
      <div className="wrap">
        <ZoneHead index={1} />

        <article className="spread" aria-label={art.title}>
          <div className="stack" data-reveal="">
            <p className="eyebrow exp-eyebrow">
              <span className="n">01</span>
              {t.ui.experience(1, total)}
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
          <figure className="art-viewer" data-reveal="" data-m="" aria-roledescription="carrusel" aria-label={art.title}>
            <div className="art-viewer-main">
              {ART_PHOTOS.map((name, i) => (
                <img
                  key={name}
                  src={`${base}fotos/art-blue-lab/${name}`}
                  alt={`${art.title} · ${i + 1} / ${ART_PHOTOS.length}`}
                  className={i === slide ? 'is-on' : ''}
                  aria-hidden={i !== slide}
                  onClick={() => setZoom(true)}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                />
              ))}
              <button type="button" className="art-viewer-arrow art-viewer-arrow--prev" aria-label="Anterior" onClick={() => go(-1)}>
                <ArrowRight />
              </button>
              <button type="button" className="art-viewer-arrow art-viewer-arrow--next" aria-label="Siguiente" onClick={() => go(1)}>
                <ArrowRight />
              </button>
              <span className="art-viewer-count" aria-live="polite">
                {String(slide + 1).padStart(2, '0')} / {String(ART_PHOTOS.length).padStart(2, '0')}
              </span>
            </div>
            <div className="art-thumbs" role="tablist" aria-label={art.title}>
              {ART_PHOTOS.map((name, i) => (
                <button
                  key={name}
                  type="button"
                  role="tab"
                  aria-selected={i === slide}
                  aria-label={`${i + 1}`}
                  className={i === slide ? 'is-on' : ''}
                  onClick={() => setSlide(i)}
                >
                  <img src={`${base}fotos/art-blue-lab/${name}`} alt="" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
            <div className="art-network">
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
          {zoom && (
            <Lightbox
              images={ART_PHOTOS.map((name, i) => ({ src: `${base}fotos/art-blue-lab/${name}`, alt: `${art.title} · ${i + 1}` }))}
              index={slide}
              onIndex={setSlide}
              onClose={() => setZoom(false)}
            />
          )}
        </article>

        {SHOW_FILMS && (
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
            </div>
            <figure className="films" data-reveal="" data-m="">
              <div className="films-screen">
                <video
                  key={current.slug}
                  className="films-video"
                  src={`${base}filminutos/${current.slug}.mp4`}
                  poster={`${base}filminutos/${current.slug}.jpg`}
                  controls
                  playsInline
                  preload="none"
                  onPlay={() => trackEvent('filminuto', { accion: 'reproducir', filminuto: current.n })}
                  aria-label={t.ui.playTitle(current.title)}
                />
              </div>
              <p className="disp it films-caption">{current.title}</p>
              <p className="films-meta">
                {current.duration} · {current.year} · {current.curador}
              </p>
              <ol className="films-list stagger">
                {FILMINUTOS.map((item, i) => (
                  <li key={item.slug}>
                    <button type="button" aria-current={i === film ? 'true' : undefined} className={i === film ? 'is-on' : ''} onClick={() => setFilm(i)}>
                      <span className="disp it">{item.n}</span>
                      <span>{item.title}</span>
                      <span>{i === film ? t.ui.nowPlaying : item.duration}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </figure>
          </article>
        )}
      </div>
    </section>
  );
}
