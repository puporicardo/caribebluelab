import { useContent } from '../../content';
import { LINKS } from '../../content/links';
import { ArrowRight, RIVER_SERIES } from '../../shared/components/Icons';
import { Rich, plain } from '../../shared/components/Rich';
import { ExternalLink } from '../parts/ExternalLink';
import { ZoneHead } from '../parts/ZoneHead';

const ACCENT_INK = 'var(--c-accent-ink)';
const NUMERALS = ['I', 'II', 'III'];

/** Zona 5 · Ascenso (Monitorear y actuar): Gran Faro, Caribe Blue Challenge y cierre con IncubAzul. */
export function AscensoPage() {
  const t = useContent();
  const faro = t.web.faro;
  const challenge = t.web.challenge;
  const close = t.web.close;

  return (
    <section id="ascenso" className="zone zone--ascent lt" aria-labelledby="titulo-zona-5">
      <div className="wrap">
        <ZoneHead index={5} />

        <article className="spread" aria-label={plain(faro.title)}>
          <div className="stack" data-reveal="">
            <p className="eyebrow exp-eyebrow" style={{ color: ACCENT_INK }}>
              <span className="n">05</span>
              {t.ui.experience(1, 2)}
            </p>
            <h3 className="disp exp-title exp-title--xl">
              <Rich text={faro.title} split />
            </h3>
            <p className="body">{faro.body}</p>
            <ExternalLink href={LINKS.granFaro} name="gran_faro" className="link link--start">
              {faro.link} <ArrowRight />
            </ExternalLink>
          </div>
          <figure className="faro" data-reveal="" data-m="">
            <p className="eyebrow faro-panel" style={{ color: ACCENT_INK }}>
              {faro.panel}
            </p>
            <div className="faro-table">
              <div className="faro-grid stagger">
                <div className="faro-row faro-row--head">
                  {faro.cols.map((c) => (
                    <span key={c}>{c}</span>
                  ))}
                </div>
                {faro.rivers.map((river, i) => (
                  <div key={river} className="faro-row">
                    <span className="disp faro-river">{river}</span>
                    <span className="faro-live">{faro.live}</span>
                    <svg viewBox="0 0 200 40" aria-hidden="true" className="faro-series draw-wipe">
                      <path d={RIVER_SERIES[i]} fill="none" stroke="#0B1B33" strokeWidth="1.2" strokeDasharray="3 5" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
            <p className="figcap" style={{ color: '#3A4A5E' }}>
              <b style={{ color: ACCENT_INK }}>{t.ui.fig} 5.1</b>
              {faro.fig}
            </p>
          </figure>
        </article>

        <article className="challenge" aria-label={plain(challenge.title)} data-reveal="">
          <p className="eyebrow exp-eyebrow" style={{ color: ACCENT_INK }}>
            <span className="n">05</span>
            {t.ui.experience(2, 2)}
          </p>
          <div className="challenge-head">
            <h3 className="disp exp-title">
              <Rich text={challenge.title} split />
            </h3>
            <span className="challenge-note">{challenge.note}</span>
          </div>
          <ol className="challenge-grid stagger">
            {NUMERALS.map((n) => (
              <li key={n}>
                <span className="disp it challenge-n">{n}</span>
                <span className="disp challenge-project">{challenge.project}</span>
                <span className="challenge-team">{challenge.team}</span>
                <span className="challenge-status">{challenge.status}</span>
                <span className="link link--start is-pending">{challenge.contact}</span>
              </li>
            ))}
          </ol>
        </article>

        <div id="incubazul" className="close" data-reveal="">
          <div>
            <p className="eyebrow" style={{ color: ACCENT_INK }}>
              {close.eyebrow}
            </p>
            <p className="disp close-title">
              <Rich text={close.title} split />
            </p>
          </div>
          <ExternalLink href={LINKS.incubAzul} name="incubazul" className="btn btn--ink">
            {close.cta} <ArrowRight color="#F5F3F0" />
          </ExternalLink>
        </div>
      </div>
    </section>
  );
}
