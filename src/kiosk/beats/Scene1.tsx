import { useContent } from '../../content';
import { Ficha } from '../../shared/components/Ficha';
import { Rich } from '../../shared/components/Rich';
import { cssVars } from '../../shared/css';
import { Ani, ExpEyebrow, KioskColumn, KioskZoneHead } from '../parts/KioskBits';

/** 1:00 · Zona de luz */
export function S1Head() {
  return <KioskZoneHead index={1} />;
}

/** 1:12 · Art Blue Lab */
export function S1Art() {
  const t = useContent();
  const k = t.kiosk.art;
  return (
    <section aria-label={t.web.art.title} className="k-beat">
      <KioskColumn>
        <ExpEyebrow n="01" text={k.eyebrow} />
        <Ani as="h3" className="disp" delay={0.15} style={{ fontSize: 108 }}>
          {t.web.art.title}
        </Ani>
        <Ani as="p" className="body" delay={0.3}>
          {k.body}
        </Ani>
        <Ani delay={0.45}>
          <Ficha rows={k.ficha} style={{ marginTop: 8 }} />
        </Ani>
      </KioskColumn>
      <Ani as="figure" className="k-fig" delay={0.35} style={{ left: 880, top: 196, width: 360 }}>
        <div className="hatch k-frame" style={{ height: 460 }}>
          <span className="crop k-crop" />
          <span className="k-frame-label">{k.work}</span>
        </div>
        <figcaption className="figcap">
          <b>{t.ui.fig} 1.1</b>
          {k.fig1}
        </figcaption>
      </Ani>
      <Ani as="figure" className="k-fig" delay={0.55} style={{ left: 1290, top: 250, width: 250 }}>
        <div className="hatch k-frame" style={cssVars({ '--hatch-bg': 'linear-gradient(200deg, #D2BB81, #2A4C72)' }, { height: 320 })}>
          <span className="crop k-crop" />
          <span className="k-frame-label">{k.work2}</span>
        </div>
        <figcaption className="figcap">
          <b>{t.ui.fig} 1.2</b>
          {k.fig2}
        </figcaption>
      </Ani>
      <Ani className="k-network" delay={0.75}>
        <p className="eyebrow">{t.web.art.network}</p>
        <svg width="250" height="90" viewBox="0 0 250 90" aria-hidden="true" style={{ marginTop: 10 }}>
          <path d="M14 70 Q125 -10 236 70" fill="none" stroke="#6FE3D6" strokeWidth="1.2" strokeDasharray="4 6" className="dash" />
          <circle cx="14" cy="70" r="4" fill="#F5F3F0" />
          <circle cx="236" cy="70" r="4" fill="#F5F3F0" />
        </svg>
        <div className="k-network-places">
          <span>{t.web.art.places[0]}</span>
          <span>{t.web.art.places[1]}</span>
        </div>
      </Ani>
    </section>
  );
}

const THUMBS = [
  'linear-gradient(135deg, #2A4C72, #0B1B33)',
  'linear-gradient(135deg, #35668B, #0B1B33)',
  'linear-gradient(135deg, #1D3256, #0B1B33)',
  'linear-gradient(135deg, #2A4C72, #1D3256)',
  'linear-gradient(135deg, #35668B, #1D3256)',
  'linear-gradient(135deg, #1D3256, #0B1B33)',
];

/** 1:36 · Festival de Filminutos Cine Al Mar */
export function S1Films() {
  const t = useContent();
  const k = t.kiosk.films;
  const films = t.web.films;
  return (
    <section aria-label={films.title.replace(/\*/g, '')} className="k-beat">
      <KioskColumn width={640}>
        <ExpEyebrow n="01" text={k.eyebrow} />
        <Ani as="h3" className="disp" delay={0.15} style={{ fontSize: 84, lineHeight: 1.02 }}>
          <Rich text={films.title} />
        </Ani>
        <Ani as="p" className="body" delay={0.3}>
          {k.body}
        </Ani>
        <Ani delay={0.45}>
          <Ficha rows={films.ficha} style={{ marginTop: 8 }} />
        </Ani>
      </KioskColumn>
      <Ani as="figure" className="k-fig" delay={0.35} style={{ left: 860, top: 196, width: 680 }}>
        <div className="k-screen">
          <span className="crop k-crop" />
          <p className="eyebrow k-screen-count">{k.screen}</p>
          <svg width="86" height="86" viewBox="0 0 86 86" aria-hidden="true" className="k-screen-play">
            <circle cx="43" cy="43" r="42" fill="none" stroke="rgba(245,243,240,.7)" strokeWidth="1" />
            <path d="M36 29 L58 43 L36 57 Z" fill="#F5F3F0" />
          </svg>
          <p className="disp it k-screen-title">{films.items[1].title}</p>
          <p className="k-screen-note">{k.pending}</p>
        </div>
        <div className="k-thumbs">
          {THUMBS.map((bg, i) => (
            <div key={i} style={{ background: bg }} className={i === 1 ? 'is-on' : ''}>
              0{i + 1}
            </div>
          ))}
        </div>
        <figcaption className="figcap">
          <b>{t.ui.next}</b>
          {films.items[0].title}
        </figcaption>
      </Ani>
    </section>
  );
}
