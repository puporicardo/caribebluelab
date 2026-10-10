import { useMemo } from 'react';
import { useContent } from '../../content';
import { makeBars } from '../../shared/bars';
import { Ficha } from '../../shared/components/Ficha';
import { Rich } from '../../shared/components/Rich';
import { Ani, ExpEyebrow, KioskColumn, KioskZoneHead } from '../parts/KioskBits';

const BIO = '#6FE3D6';

/** 4:00 · Zona oscura */
export function S4Head() {
  return <KioskZoneHead index={4} accent={BIO} stroke="rgba(111,227,214,.28)" delays={[1.6, 1.9, 2.2]} top={250} titleSize={120} />;
}

/** 4:12 · Sonidos de la naturaleza (sonar) */
export function S4Sounds() {
  const t = useContent();
  const k = t.kiosk.sounds;
  const s = t.web.sounds;
  const bars = useMemo(() => makeBars(20, 9, 30, 66), []);
  return (
    <section aria-label={s.title.replace(/\*/g, '')} className="k-beat">
      <KioskColumn width={660}>
        <ExpEyebrow n="04" text={k.eyebrow} color={BIO} />
        <Ani as="h3" className="disp" delay={0.15} style={{ fontSize: 92, lineHeight: 1.02 }}>
          <Rich text={s.title} />
        </Ani>
        <Ani as="p" className="body" delay={0.3}>
          {k.body}
        </Ani>
        <Ani delay={0.45}>
          <Ficha rows={s.ficha} style={{ marginTop: 8 }} />
        </Ani>
      </KioskColumn>
      <Ani as="figure" className="k-fig" delay={0.35} style={{ left: 900, top: 176, width: 620 }}>
        <div className="k-sonar">
          <span className="k-ring" style={{ left: 200, top: 170, width: 220, height: 220, opacity: 0.22 }} />
          <span className="k-ring" style={{ left: 120, top: 90, width: 380, height: 380, opacity: 0.18 }} />
          <span className="k-ring" style={{ left: 40, top: 10, width: 540, height: 540, opacity: 0.14 }} />
          {[0, -1.5, -3].map((d) => (
            <span key={d} className="k-ring k-ring--ping" style={{ animationDelay: `${d}s` }} />
          ))}
          <span className="eyebrow k-sonar-label" style={{ top: 156 }}>
            {s.tracks[0]}
          </span>
          <span className="eyebrow k-sonar-label" style={{ top: 76 }}>
            {s.tracks[1]}
          </span>
          <span className="eyebrow k-sonar-label" style={{ top: -4 }}>
            {s.tracks[2]}
          </span>
          <div className="k-sonar-eq">
            {bars.map((b, i) => (
              <span key={i} style={{ height: b.h, animationDuration: `${b.d}s`, animationDelay: `${b.dl}s` }} />
            ))}
          </div>
        </div>
        <figcaption className="figcap">
          <b>{t.ui.fig} 4.1</b>
          {k.fig}
        </figcaption>
      </Ani>
    </section>
  );
}

const PLATES = [
  { left: 30, top: 30, width: 300, height: 230, bg: 'linear-gradient(140deg, #1D3256, #0B1B33)' },
  { left: 360, top: 60, width: 290, height: 280, bg: 'linear-gradient(200deg, #2A4C72, #0B1B33)' },
  { left: 90, top: 290, width: 340, height: 200, bg: 'linear-gradient(100deg, #1D3256, #0B1B33)' },
  { left: 460, top: 370, width: 190, height: 120, bg: 'linear-gradient(60deg, #2A4C72, #0B1B33)' },
];

/** 4:36 · Criaturas en la Oscuridad (un haz de luz recorre las láminas) */
export function S4Creatures() {
  const t = useContent();
  const c = t.web.creatures;
  return (
    <section aria-label={c.title.replace(/\*/g, '')} className="k-beat">
      <KioskColumn width={620}>
        <ExpEyebrow n="04" text={t.kiosk.creatures.eyebrow} color={BIO} />
        <Ani as="h3" className="disp" delay={0.15} style={{ fontSize: 92, lineHeight: 1.02 }}>
          <Rich text={c.title} />
        </Ani>
        <Ani as="p" className="body" delay={0.3}>
          {t.kiosk.creatures.body}
        </Ani>
        <Ani delay={0.45}>
          <Ficha rows={c.ficha} style={{ marginTop: 8 }} />
        </Ani>
      </KioskColumn>
      <Ani as="figure" className="k-fig" delay={0.35} style={{ left: 860, top: 186, width: 680 }}>
        <div className="k-gallery">
          {PLATES.map((p, i) => (
            <div
              key={i}
              className="k-plate"
              style={{
                left: p.left,
                top: p.top,
                width: p.width,
                height: p.height,
                backgroundImage: `repeating-linear-gradient(135deg, rgba(245,243,240,.06) 0 1px, rgba(245,243,240,0) 1px 13px), ${p.bg}`,
              }}
            >
              {c.plates[i]}
            </div>
          ))}
          <div className="k-roam" aria-hidden="true" />
          <span className="crop" style={{ inset: 0, color: 'rgba(111,227,214,.6)' }} />
        </div>
        <figcaption className="figcap">
          <b>{t.ui.fig} 4.2</b>
          {c.fig}
        </figcaption>
      </Ani>
    </section>
  );
}
