import { useContent, type Content } from '../../content';
import { LINKS } from '../../content/links';
import { ArrowRight } from '../../shared/components/Icons';
import { Rich, plain } from '../../shared/components/Rich';
import { ExternalLink } from '../parts/ExternalLink';
import { ZoneHead } from '../parts/ZoneHead';
import { useGranFaro } from '../useGranFaro';

const ACCENT_INK = 'var(--c-accent-ink)';
const SERIES_W = 200;
const SERIES_H = 40;
/** Mientras carga o si la fuente falla: línea punteada plana. */
const SERIES_EMPTY = `M0 ${SERIES_H / 2} L${SERIES_W} ${SERIES_H / 2}`;

/** Trazo de la mini-serie en el viewBox 200×40; los huecos (null) se saltan. */
function seriesPath(values: (number | null)[]): string | null {
  const pts = values.flatMap((v, i) => (typeof v === 'number' ? [[i, v] as const] : []));
  if (pts.length < 2) return null;
  const ys = pts.map(([, v]) => v);
  const min = Math.min(...ys);
  const span = Math.max(...ys) - min || 1;
  const pad = 4;
  const x = (i: number) => (i / (values.length - 1)) * SERIES_W;
  const y = (v: number) => pad + (1 - (v - min) / span) * (SERIES_H - pad * 2);
  return pts.map(([i, v], k) => `${k ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
}

/** Fig. 5.1: los cuatro indicadores de Copernicus que muestra Gran Faro en su panel de monitoreo. */
function FaroTable({ t, mar, lluvia }: { t: Content } & ReturnType<typeof useGranFaro>) {
  const faro = t.web.faro;
  const fmt = (n: number | null | undefined, unit: string, digits = 1) =>
    typeof n === 'number'
      ? `${new Intl.NumberFormat(locale(t), { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n)} ${unit}`
      : null;
  const dias = mar.data?.disponible ? mar.data.dias : [];
  const hoy = dias[0];
  const rain = lluvia.data?.disponible ? lluvia.data : null;
  const rumbo = typeof hoy?.corriente_rumbo_grados === 'number' ? faro.bearings[Math.round(hoy.corriente_rumbo_grados / 45) % 8] : null;
  const corriente = fmt(hoy?.corriente_ms, 'm/s', 2);

  const rows: { value: string | null; series: (number | null)[]; loading: boolean }[] = [
    { value: fmt(hoy?.temperatura_c, '°C'), series: dias.map((d) => d.temperatura_c), loading: mar.loading },
    { value: fmt(hoy?.ola_m, 'm'), series: dias.map((d) => d.ola_m), loading: mar.loading },
    { value: corriente && rumbo ? `${corriente} · ${rumbo}` : corriente, series: dias.map((d) => d.corriente_ms), loading: mar.loading },
    { value: fmt(rain?.ultimos_30_dias_mm, 'mm', 0), series: rain?.meses.map((m) => m.total_mm) ?? [], loading: lluvia.loading },
  ];

  return (
    <div className="faro-table" aria-busy={mar.loading || lluvia.loading}>
      <div className="faro-grid stagger">
        <div className="faro-row faro-row--head">
          {faro.cols.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
        {faro.indicators.map((ind, i) => {
          const row = rows[i];
          const path = seriesPath(row.series);
          return (
            <div key={ind.name} className="faro-row">
              <span>
                <span className="disp faro-river">{ind.name}</span>
                <span className="faro-note">{ind.note}</span>
              </span>
              <span className="faro-live">{row.value ?? (row.loading ? faro.loading : faro.noData)}</span>
              <svg viewBox={`0 0 ${SERIES_W} ${SERIES_H}`} aria-hidden="true" className="faro-series draw-wipe">
                <path
                  d={path ?? SERIES_EMPTY}
                  fill="none"
                  stroke="#0B1B33"
                  strokeWidth={path ? 1.6 : 1.2}
                  strokeDasharray={path ? undefined : '3 5'}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Zona 5 · Ascenso (Monitorear y actuar): Gran Faro, Caribe Blue Challenge y cierre con IncubAzul. */
export function AscensoPage() {
  const t = useContent();
  const faro = t.web.faro;
  const challenge = t.web.challenge;
  const close = t.web.close;
  const { mar, lluvia } = useGranFaro();
  const updated = mar.data?.actualizado_en
    ? new Intl.DateTimeFormat(locale(t), { dateStyle: 'medium', timeStyle: 'short' }).format(
        new Date(mar.data.actualizado_en),
      )
    : null;

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
            <FaroTable t={t} mar={mar} lluvia={lluvia} />
            <p className="figcap" style={{ color: '#3A4A5E' }}>
              <b style={{ color: ACCENT_INK }}>{t.ui.fig} 5.1</b>
              {faro.fig(updated)}
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
            {challenge.winners.map((w) => (
              <li key={w.project}>
                <span className="challenge-place">{challenge.place}</span>
                <span className="disp challenge-project">{w.project}</span>
                <p className="challenge-desc">{w.description}</p>
                <span className="challenge-team">{w.team}</span>
                <span className="challenge-status">{w.status}</span>
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

const locale = (t: Content) => (t.lang === 'es' ? 'es-CO' : 'en-US');
