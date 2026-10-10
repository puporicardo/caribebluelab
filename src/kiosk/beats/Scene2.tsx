import { useContent } from '../../content';
import { Ficha } from '../../shared/components/Ficha';
import { ArrowLong } from '../../shared/components/Icons';
import { Rich } from '../../shared/components/Rich';
import { Ani, ExpEyebrow, KioskColumn, KioskZoneHead } from '../parts/KioskBits';

const GOLD = '#D2BB81';

/** 2:00 · Arrecife */
export function S2Head() {
  return <KioskZoneHead index={2} accent={GOLD} />;
}

/** 2:12 · Del modelo 3D a la pieza que se toca (el mero 3D gira a la derecha, ver ReefModel) */
export function S2Model() {
  const t = useContent();
  const k = t.kiosk.reef1;
  const sp = t.species.items[0];
  return (
    <section aria-label={k.title.replace(/\*/g, '')} className="k-beat">
      <KioskColumn width={640}>
        <ExpEyebrow n="02" text={k.eyebrow} color={GOLD} />
        <Ani as="h3" className="disp" delay={0.15} style={{ fontSize: 80, lineHeight: 1.02 }}>
          <Rich text={k.title} />
        </Ani>
        <Ani className="k-species" delay={0.35}>
          <p className="eyebrow" style={{ color: GOLD }}>
            <span className="rule" />
            {k.speciesLabel}
          </p>
          <p className="disp k-species-name">{sp.name}</p>
          <p className="disp it k-species-latin">{sp.latin}</p>
        </Ani>
      </KioskColumn>
    </section>
  );
}

/** 2:36 · Tócalo en el mostrador */
export function S2Counter() {
  const t = useContent();
  const k = t.kiosk.reef2;
  return (
    <section aria-label={k.title.replace(/\*/g, '')} className="k-beat">
      <KioskColumn width={640}>
        <ExpEyebrow n="02" text={k.eyebrow} color={GOLD} />
        <Ani as="h3" className="disp" delay={0.15} style={{ fontSize: 96 }}>
          <Rich text={k.title} />
        </Ani>
        <Ani as="p" className="body" delay={0.3}>
          {k.body}
        </Ani>
        <Ani delay={0.45}>
          <Ficha rows={k.ficha} style={{ marginTop: 8 }} />
        </Ani>
      </KioskColumn>
      <Ani className="k-card" delay={0.6}>
        <div>
          <p className="eyebrow" style={{ color: GOLD }}>
            {k.card.eyebrow}
          </p>
          <p className="disp k-card-title">{k.card.title}</p>
          <p className="k-card-meta">{k.card.meta}</p>
        </div>
        <span className="k-card-counter">
          {k.card.counter}
          <ArrowLong color="#6FE3D6" />
        </span>
      </Ani>
    </section>
  );
}
