import { useContent } from '../../content';
import { ArrowLong, RIVER_SERIES } from '../../shared/components/Icons';
import { Rich } from '../../shared/components/Rich';
import { Ani, ExpEyebrow, KioskColumn, KioskZoneHead } from '../parts/KioskBits';

const GOLD_INK = '#7A5C16';
const INK = '#0B1B33';

/** 5:00 · Ascenso (entra cuando la luz ya subió) */
export function S5Head() {
  return <KioskZoneHead index={5} accent={GOLD_INK} ink={INK} stroke="rgba(11,27,51,.16)" delays={[5, 5.3, 5.6]} titleSize={128} />;
}

/** 5:12 · Gran Faro */
export function S5Faro() {
  const t = useContent();
  const f = t.web.faro;
  return (
    <section aria-label={f.title.replace(/\*/g, '')} className="k-beat" style={{ color: INK }}>
      <KioskColumn width={620}>
        <ExpEyebrow n="05" text={t.kiosk.faro.eyebrow} color={GOLD_INK} />
        <Ani as="h3" className="disp" delay={0.15} style={{ fontSize: 120 }}>
          <Rich text={f.title} />
        </Ani>
        <Ani as="p" className="body" delay={0.3} style={{ color: INK }}>
          {f.body}
        </Ani>
        <Ani as="p" className="k-faro-link" delay={0.45}>
          {f.link}
          <ArrowLong color={INK} />
        </Ani>
      </KioskColumn>
      <Ani as="figure" className="k-fig" delay={0.35} style={{ left: 860, top: 196, width: 680 }}>
        <p className="eyebrow" style={{ fontSize: 11, color: GOLD_INK }}>
          {f.panel}
        </p>
        <div className="k-faro">
          <div className="k-faro-row k-faro-row--head">
            {f.cols.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
          {f.rivers.map((r, i) => (
            <div key={r} className="k-faro-row">
              <span className="disp" style={{ fontSize: 36 }}>
                {r}
              </span>
              <span style={{ fontSize: 20, fontWeight: 600 }}>{f.live}</span>
              <svg width="200" height="40" viewBox="0 0 200 40" aria-hidden="true">
                <path d={RIVER_SERIES[i]} fill="none" stroke={INK} strokeWidth="1.2" strokeDasharray="3 5" />
              </svg>
            </div>
          ))}
        </div>
        <figcaption className="figcap" style={{ color: '#3A4A5E' }}>
          <b style={{ color: GOLD_INK }}>{t.ui.fig} 5.1</b>
          {f.fig}
        </figcaption>
      </Ani>
    </section>
  );
}

/** 5:36 · Caribe Blue Challenge 2026 + IncubAzul */
export function S5Challenge() {
  const t = useContent();
  const c = t.web.challenge;
  const close = t.web.close;
  return (
    <section aria-label={c.title.replace(/\*/g, '')} className="k-beat" style={{ color: INK }}>
      <div className="k-col" style={{ top: 176, width: 1420, display: 'block' }}>
        <ExpEyebrow n="05" text={t.kiosk.challenge.eyebrow} color={GOLD_INK} />
        <Ani as="h3" className="disp" delay={0.15} style={{ marginTop: 22, fontSize: 92 }}>
          <Rich text={c.title} />
        </Ani>
        <Ani as="p" className="body" delay={0.3} style={{ marginTop: 18, color: INK }}>
          {t.kiosk.challenge.body}
        </Ani>
        <div className="k-challenge">
          {['I', 'II', 'III'].map((n, i) => (
            <div key={n} className="ani" style={{ animationDelay: `${0.4 + i * 0.15}s` }}>
              <span className="disp it" style={{ fontSize: 52, color: GOLD_INK }}>
                {n}
              </span>
              <span className="disp" style={{ fontSize: 32 }}>
                {c.project}
              </span>
              <span style={{ fontSize: 18, color: '#3A4A5E' }}>{c.team}</span>
            </div>
          ))}
        </div>
        <Ani className="k-close" delay={1.2}>
          <div>
            <p className="eyebrow" style={{ fontSize: 12, color: GOLD_INK }}>
              {close.eyebrow}
            </p>
            <p className="disp" style={{ marginTop: 12, fontSize: 56 }}>
              <Rich text={close.title} />
            </p>
          </div>
          <span className="k-close-cta">
            {close.cta}
            <svg width="56" height="16" viewBox="0 0 56 16" aria-hidden="true">
              <path d="M0 8 H54 M46 1 L54 8 L46 15" fill="none" stroke={INK} strokeWidth="1.5" />
            </svg>
          </span>
        </Ani>
      </div>
    </section>
  );
}
