import { useCallback, useEffect, useRef, useState } from 'react';
import { useContent } from '../../content';
import { SPECIES, type Species } from '../../content/species';
import type { Lang } from '../../content/zones';
import { trackEvent } from '../../shared/analytics';
import { Ficha } from '../../shared/components/Ficha';
import { Rich } from '../../shared/components/Rich';
import { SpeciesStage, type ViewerAction } from '../../shared/components/species/SpeciesStage';
import { useDive } from '../dive';
import { ZoneHead } from '../parts/ZoneHead';

const ACCENT = 'var(--c-accent)';
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Zona 2 · Arrecife (Tocar y crear): nueve especies del Caribe, una tras otra con el scroll.
 * El fondo se queda en el arrecife; cada pez entra nadando desde su lado (alternando) y su ficha
 * llega desde el lado opuesto. Cada visor 3D solo existe cerca de la pantalla.
 */
export function ArrecifePage() {
  const t = useContent();
  const { lang } = useDive();

  return (
    <section id="arrecife" className="zone" aria-labelledby="titulo-zona-2">
      <div className="wrap">
        <ZoneHead index={2} accent={ACCENT} />
        <div className="specimens" aria-label={t.web.reef.viewerLabel}>
          {SPECIES.map((s, i) => (
            <Specimen key={s.id} species={s} index={i} total={SPECIES.length} lang={lang} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Specimen({ species, index, total, lang }: { species: Species; index: number; total: number; lang: Lang }) {
  const t = useContent();
  const copy = species.copy[lang];
  const { ref, visible, near } = useViewport<HTMLDivElement>();
  const seen = useRef(false);

  const onAction = useCallback((action: ViewerAction) => trackEvent('visor_3d', { accion: action, especie: species.id }), [species.id]);

  // Cuenta como “vista” la primera vez que el pez está en pantalla.
  useEffect(() => {
    if (visible && !seen.current) {
      seen.current = true;
      trackEvent('especie_vista', { especie: species.id });
    }
  }, [visible, species.id]);

  return (
    <article className={`specimen ${index % 2 ? 'specimen--right' : 'specimen--left'}`} data-m="" aria-label={copy.name}>
      <span className="specimen-n" aria-hidden="true">
        {pad(index + 1)}
      </span>

      <figure className="specimen-fig" data-m="">
        <div ref={ref} className="reef-viewer-frame">
          <span className="reef-viewer-light" aria-hidden="true" />
          {near ? <SpeciesStage url={species.model} label={copy.name} labels={t.viewer} mode="interactive" active={visible} onAction={onAction} /> : null}
        </div>
      </figure>

      <div className="stack specimen-copy" data-reveal="">
        <p className="eyebrow exp-eyebrow" style={{ color: ACCENT }}>
          <span className="n">{pad(index + 1)}</span>
          {t.species.eyebrow}
          <span className="species-count">{t.species.count(index + 1, total)}</span>
        </p>
        <h3 className="disp exp-title">
          <Rich text={copy.name} split />
        </h3>
        <p className="disp it species-latin">{copy.latin}</p>
        {copy.description ? <p className="body species-desc">{copy.description}</p> : null}
        <Ficha rows={copy.ficha} />
      </div>
    </article>
  );
}

/**
 * near: el visor está cerca (se monta; se desmonta al alejarse, así nunca hay más de dos o tres
 * contextos WebGL vivos). visible: está en pantalla (se renderiza).
 */
function useViewport<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setNear(true);
      setVisible(true);
      return;
    }
    const nearIo = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: '700px 0px' });
    const visIo = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.01 });
    nearIo.observe(el);
    visIo.observe(el);
    return () => {
      nearIo.disconnect();
      visIo.disconnect();
    };
  }, []);
  return { ref, near, visible };
}
