import { forwardRef } from 'react';
import { Link } from 'react-router';
import { CONTENT, useContent } from '../../content';
import { LINKS } from '../../content/links';
import { LANGS, zonePath } from '../../content/zones';
import { trackEvent } from '../../shared/analytics';
import { BrandLogo } from '../../shared/components/BrandLogo';
import { ArrowRight, ArrowUp } from '../../shared/components/Icons';
import { Rich } from '../../shared/components/Rich';
import { useDive } from '../dive';
import { ExternalLink } from './ExternalLink';

/** Pie del sitio: vuelta a la superficie, recorrido, ecosistema, evento, contacto y créditos. */
export const Footer = forwardRef<HTMLElement>(function Footer(_, ref) {
  const t = useContent();
  const f = t.footer;
  const { lang, switchLang } = useDive();

  return (
    <footer ref={ref} className="site-footer">
      <div className="wrap">
        <div className="ft-top">
          <div>
            <p className="ft-mark">
              <BrandLogo variant="stacked" />
            </p>
            <p className="disp it ft-tagline">{t.brand.tagline}</p>
          </div>
          <Link to={zonePath(lang, 0)} className="ft-up" onClick={() => trackEvent('cta', { nombre: 'volver_superficie' })}>
            <ArrowUp />
            {f.backToTop}
          </Link>
        </div>

        <div className="ft-grid">
          <nav aria-label={f.journey} className="ft-col">
            <h2 className="eyebrow ft-h">{f.journey}</h2>
            <ol className="ft-journey">
              {t.zones.map((z, i) => (
                <li key={i}>
                  <Link to={zonePath(lang, i)}>
                    <span className="disp it">0{i}</span>
                    {z.name}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>

          <section className="ft-col ft-col--wide" aria-label={f.ecosystemTitle.replace(/\*/g, '')}>
            <h2 className="eyebrow ft-h">
              <Rich text={f.ecosystemTitle} />
            </h2>
            <ul className="ft-eco">
              {f.ecosystem.map((e) =>
                e.current ? (
                  <li key={e.host} aria-current="page" className="is-here">
                    <span className="disp">{e.name}</span>
                    <span>{e.host}</span>
                    <span className="ft-here">{f.here}</span>
                  </li>
                ) : (
                  <li key={e.host}>
                    <a href={e.url} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('enlace_externo', { destino: e.host })}>
                      <span className="disp">{e.name}</span>
                      <span>{e.host}</span>
                      <ArrowRight width={22} height={10} />
                    </a>
                  </li>
                ),
              )}
            </ul>
            <p className="ft-small">{f.agreement}</p>
          </section>

          <section className="ft-col" aria-label={f.eventTitle}>
            <h2 className="eyebrow ft-h">{f.eventTitle}</h2>
            <p className="ft-event">
              {f.event.map((line, i) => (
                <span key={i} className={i === 0 ? 'disp' : undefined}>
                  {line}
                </span>
              ))}
            </p>
          </section>

          <section className="ft-col" aria-label={f.connectTitle}>
            <h2 className="eyebrow ft-h">{f.connectTitle}</h2>
            <p className="ft-connect">{f.connectBody}</p>
            <ExternalLink href={LINKS.incubAzul} name="incubazul_pie" className="link link--start">
              {f.connectCta} <ArrowRight />
            </ExternalLink>
          </section>
        </div>

        <p className="ft-partners">
          <span className="ft-partners-label">{f.partnersLabel}</span>
          {f.partners.map((p) => (
            <span key={p}>{p}</span>
          ))}
        </p>

        <div className="ft-bottom">
          <span>{f.rights}</span>
          <div role="group" aria-label={t.ui.languageGroup} className="ft-lang">
            {LANGS.map((l) => (
              <button key={l} type="button" lang={l} aria-pressed={lang === l} className={lang === l ? 'is-on' : ''} onClick={() => switchLang(l, 'pie')}>
                {CONTENT[l].langName}
              </button>
            ))}
          </div>
          <span>{f.domainNote}</span>
        </div>
      </div>
    </footer>
  );
});
