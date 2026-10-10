import { useMemo } from 'react';
import { useContent } from '../../content';
import { makeBars } from '../../shared/bars';
import { Ficha } from '../../shared/components/Ficha';
import { Rich } from '../../shared/components/Rich';
import { Ani, ExpEyebrow, KioskColumn, KioskZoneHead } from '../parts/KioskBits';

const GOLD = '#D2BB81';

const COVERS: { bg: string; frame: string; label?: string; ink?: string }[] = [
  { bg: 'linear-gradient(165deg, #4C86AE, #1D3256)', frame: 'rgba(245,243,240,.32)' },
  { bg: 'linear-gradient(165deg, #D2BB81, #2A4C72)', frame: 'rgba(245,243,240,.4)', label: '#0B1B33' },
  { bg: 'linear-gradient(165deg, #35668B, #0B1B33)', frame: 'rgba(245,243,240,.32)' },
  { bg: 'linear-gradient(165deg, #2A4C72, #0B1B33)', frame: 'rgba(245,243,240,.32)' },
  { bg: 'linear-gradient(165deg, #D2BB81, #4C86AE)', frame: 'rgba(11,27,51,.25)', ink: '#0B1B33' },
  { bg: 'linear-gradient(165deg, #1D3256, #0B1B33)', frame: 'rgba(111,227,214,.35)', label: '#6FE3D6' },
];

/** 3:00 · Pradera marina */
export function S3Head() {
  return <KioskZoneHead index={3} accent={GOLD} top={236} titleSize={116} />;
}

/** 3:12 · Colección CUBI y sus Super-Amigos */
export function S3Shelf() {
  const t = useContent();
  const k = t.kiosk.shelf;
  return (
    <section aria-label={t.web.shelf.title.replace(/\*/g, '')} className="k-beat">
      <KioskColumn width={640}>
        <ExpEyebrow n="03" text={k.eyebrow} color={GOLD} />
        <Ani as="h3" className="disp" delay={0.15} style={{ fontSize: 88, lineHeight: 1.02 }}>
          <Rich text={t.web.shelf.title} />
        </Ani>
        <Ani as="p" className="body" delay={0.3}>
          {k.body}
        </Ani>
        <Ani delay={0.45}>
          <Ficha rows={k.ficha} style={{ marginTop: 8 }} />
        </Ani>
      </KioskColumn>
      <div className="k-shelf">
        {t.web.shelf.books.slice(0, 6).map((b, i) => {
          const c = COVERS[i];
          return (
            <div key={b.title} className="ani k-book" style={{ background: c.bg, color: c.ink, animationDelay: `${0.3 + i * 0.1}s` }}>
              <span className="k-book-frame" style={{ boxShadow: `inset 0 0 0 1px ${c.frame}` }} />
              <span className="eyebrow k-book-label" style={c.label ? { color: c.label } : undefined}>
                {b.label}
              </span>
              <span className="disp k-book-title">{b.title}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const NOTES: [number, number, number?][] = [
  [60, 164], [170, 128], [250, 140, 300], [410, 176], [520, 104], [600, 152],
  [740, 164], [850, 128], [930, 140, 980], [1090, 176], [1200, 104], [1280, 152],
];

/** 3:36 · Rubik Musical STEAM+G */
export function S3Songs() {
  const t = useContent();
  const k = t.kiosk.songs;
  const bars = useMemo(() => makeBars(40, 5, 30, 80), []);
  return (
    <section aria-label={t.web.corner.title.replace(/\*/g, '')} className="k-beat">
      <KioskColumn width={660}>
        <ExpEyebrow n="03" text={k.eyebrow} color={GOLD} />
        <Ani as="h3" className="disp" delay={0.15} style={{ fontSize: 92, lineHeight: 1.02 }}>
          <Rich text={t.web.corner.title} />
        </Ani>
        <Ani delay={0.3}>
          <Ficha rows={k.ficha} style={{ marginTop: 8 }} />
        </Ani>
      </KioskColumn>
      <Ani as="figure" className="k-fig" delay={0.35} style={{ left: 880, top: 250, width: 660 }}>
        <div className="k-staff">
          {[80, 104, 128, 152, 176].map((y) => (
            <span key={y} style={{ top: y }} />
          ))}
          <svg width="1360" height="260" viewBox="0 0 1360 260" aria-hidden="true" className="k-notes">
            <g fill={GOLD} stroke={GOLD} strokeWidth="2">
              {NOTES.map(([x, y, x2]) =>
                x2 ? (
                  <g key={x}>
                    <ellipse cx={x} cy={y} rx="11" ry="8" transform={`rotate(-20 ${x} ${y})`} />
                    <ellipse cx={x2} cy={y - 24} rx="11" ry="8" transform={`rotate(-20 ${x2} ${y - 24})`} />
                    <path d={`M${x + 10} ${y - 2} V${y - 60} L${x2 + 10} ${y - 74} V${y - 26}`} fill="none" />
                  </g>
                ) : (
                  <g key={x}>
                    <ellipse cx={x} cy={y} rx="11" ry="8" transform={`rotate(-20 ${x} ${y})`} />
                    <path d={`M${x + 10} ${y - 2} V${y - 64}`} fill="none" />
                  </g>
                ),
              )}
            </g>
          </svg>
        </div>
        <div className="k-eq">
          {bars.map((b, i) => (
            <span key={i} style={{ height: b.h, background: GOLD, opacity: 0.8, animationDuration: `${b.d}s`, animationDelay: `${b.dl}s` }} />
          ))}
        </div>
        <figcaption className="figcap">
          <b>{t.ui.fig} 3.2</b>
          {k.fig}
        </figcaption>
      </Ani>
    </section>
  );
}
