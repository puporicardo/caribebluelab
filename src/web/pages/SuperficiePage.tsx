import { Link } from 'react-router';
import { CONTENT, useContent } from '../../content';
import { LANGS, ZONE_COLORS, zonePath } from '../../content/zones';
import { trackEvent } from '../../shared/analytics';
import { ArrowDown } from '../../shared/components/Icons';
import { useDive } from '../dive';

/** Zona 0 · Superficie: portada, elección de idioma y manifiesto con el índice de profundidades. */
export function SuperficiePage() {
  const t = useContent();
  const { lang, switchLang } = useDive();

  const startDive = () => {
    trackEvent('inicio_inmersion', { idioma: lang });
    document.getElementById('como-recorrer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <section id="superficie" className="hero" aria-label={t.zones[0].name}>
        <div className="wrap hero-inner">
          <p className="eyebrow" data-reveal="">
            <span className="rule" />
            {t.brand.kicker}
          </p>
          <h1 className="disp hero-title" data-reveal="">
            Caribe <em>Blue</em> Lab
          </h1>
          <p className="disp hero-tagline" data-reveal="">
            {t.brand.tagline}
          </p>

          <div className="hero-actions" data-reveal="">
            <div role="group" aria-labelledby="cbl-idioma" className="hero-lang">
              <span id="cbl-idioma" className="hero-lang-label">
                {t.ui.chooseLanguage}
              </span>
              {LANGS.map((l) => (
                <button
                  key={l}
                  type="button"
                  lang={l}
                  aria-pressed={lang === l}
                  className={`btn btn--outline ${lang === l ? 'is-on' : ''}`}
                  onClick={() => switchLang(l, 'superficie')}
                >
                  {CONTENT[l].langName}
                </button>
              ))}
            </div>
            <button type="button" className="btn btn--cream" onClick={startDive}>
              {t.ui.start}
              <ArrowDown />
            </button>
          </div>

          <div className="hero-foot">
            <span className="hero-partners">{t.brand.partners}</span>
            <span className="hero-cue">
              {t.ui.descend} <span className="cue" />
            </span>
          </div>
        </div>
      </section>

      <section id="como-recorrer" className="howto" aria-label={t.web.howTo.eyebrow}>
        <div className="wrap">
          <p className="eyebrow" data-reveal="">
            <span className="rule" />
            {t.web.howTo.eyebrow}
          </p>
          <p className="disp howto-quote" data-reveal="">
            {t.web.howTo.quote}
          </p>
          <p className="body howto-body" data-reveal="">
            {t.web.howTo.body}
          </p>
          <ol aria-label={t.web.howTo.indexLabel} className="howto-index" data-reveal="">
            {t.zones.slice(1).map((z, k) => {
              const i = k + 1;
              return (
                <li key={i}>
                  <Link to={zonePath(lang, i)}>
                    <span className="disp it howto-n">0{i}</span>
                    <span className="disp howto-name">{z.name}</span>
                    <span className="howto-verb">{z.verb}</span>
                    <span className="howto-swatch" style={{ background: ZONE_COLORS[i], boxShadow: i === 5 ? 'none' : undefined }} />
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </>
  );
}
