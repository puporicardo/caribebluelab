import { CONTENT, useContent } from '../../content';
import { ZONE_COLORS } from '../../content/zones';
import { Rich } from '../../shared/components/Rich';
import { Ani } from '../parts/KioskBits';

/** 0:00–0:12 · Bienvenida */
export function S0Welcome() {
  const t = useContent();
  return (
    <section aria-label={t.zones[0].name} className="k-beat k-hero">
      <Ani as="p" className="eyebrow" delay={0.4}>
        <span className="rule" style={{ background: '#F5F3F0' }} />
        {t.brand.kicker}
      </Ani>
      <Ani as="h1" className="disp k-hero-title" delay={0.6}>
        Caribe <em>Blue</em> Lab
      </Ani>
      <Ani as="p" className="disp k-hero-tagline" delay={1}>
        {t.brand.tagline}
      </Ani>
    </section>
  );
}

/** 0:12–0:36 · Cómo recorrer: las cinco profundidades */
export function S0HowTo() {
  const t = useContent();
  return (
    <section aria-label={t.kiosk.howTo.eyebrow} className="k-beat k-howto">
      <Ani as="p" className="eyebrow">
        <span className="rule" style={{ background: '#F5F3F0' }} />
        {t.kiosk.howTo.eyebrow}
      </Ani>
      <Ani as="h2" className="disp k-howto-title" delay={0.15}>
        <Rich text={t.kiosk.howTo.title} />
      </Ani>
      <ol className="k-howto-list">
        {t.zones.slice(1).map((z, k) => (
          <li key={k} className="ani" style={{ animationDelay: `${0.35 + k * 0.2}s` }}>
            <span className="disp it k-howto-n">0{k + 1}</span>
            <span className="disp k-howto-name">{z.name}</span>
            <span className="k-howto-verb">{z.verb}</span>
            <span className="k-howto-swatch" style={{ background: ZONE_COLORS[k + 1], boxShadow: k === 4 ? 'none' : undefined }} />
          </li>
        ))}
      </ol>
    </section>
  );
}

/** 0:36–1:00 · Manifiesto y QR */
export function S0Manifesto() {
  const t = useContent();
  return (
    <section aria-label={t.kiosk.manifesto.eyebrow} className="k-beat k-manifesto">
      <Ani as="p" className="eyebrow">
        <span className="rule" style={{ background: '#F5F3F0' }} />
        {t.kiosk.manifesto.eyebrow}
      </Ani>
      <Ani as="p" className="disp k-manifesto-quote" delay={0.15}>
        {t.kiosk.manifesto.quote}
      </Ani>
      <Ani className="k-scan" delay={0.5}>
        <span className="k-scan-text">{t.kiosk.manifesto.scan}</span>
        <span className="k-chip">{CONTENT.es.langName}</span>
        <span className="k-chip">{CONTENT.en.langName}</span>
        <svg width="250" height="120" viewBox="0 0 250 120" aria-hidden="true" style={{ marginLeft: 8 }}>
          <path d="M2 14 H190 Q230 14 236 60 L240 112 M226 98 L240 114 L252 96" fill="none" stroke="#6FE3D6" strokeWidth="1.5" />
        </svg>
      </Ani>
    </section>
  );
}
