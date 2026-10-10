import { useCallback, useEffect, useRef, useState } from 'react';
import { useContent } from '../../content';
import { trackEvent } from '../../shared/analytics';
import { Ficha } from '../../shared/components/Ficha';
import { SPECIES_IDS, SPECIES_MODELS } from '../../shared/components/species/models';
import { SpeciesStage, type ViewerAction } from '../../shared/components/species/SpeciesStage';
import { ZoneHead } from '../parts/ZoneHead';

const GOLD = '#D2BB81';

/** Zona 2 · Arrecife (Tocar y crear): visor 3D de especies con su ficha científica. */
export function ArrecifePage() {
  const t = useContent();
  const [pick, setPick] = useState(0);
  const species = t.species.items[pick];
  const { ref, visible, near } = useViewport<HTMLDivElement>();

  const onAction = useCallback(
    (action: ViewerAction) => trackEvent('visor_3d', { accion: action, especie: SPECIES_IDS[pick] }),
    [pick],
  );

  const choose = (i: number) => {
    setPick(i);
    trackEvent('especie_vista', { especie: SPECIES_IDS[i] });
  };

  return (
    <section id="arrecife" className="zone" aria-labelledby="titulo-zona-2">
      <div className="wrap">
        <ZoneHead index={2} accent={GOLD} />

        <article className="spread spread--viewer" aria-label={t.web.reef.viewerLabel}>
          <figure className="reef-viewer" data-reveal="">
            <div ref={ref} className="reef-viewer-frame">
              <span className="crop" />
              {near ? (
                <SpeciesStage
                  url={SPECIES_MODELS[pick]}
                  label={species.name}
                  labels={t.viewer}
                  mode="interactive"
                  active={visible}
                  onAction={onAction}
                />
              ) : null}
            </div>
          </figure>

          <div className="stack" data-reveal="">
            <div role="tablist" aria-label={t.species.tabs} className="tabs">
              {t.species.items.map((s, i) => (
                <button
                  key={SPECIES_IDS[i]}
                  type="button"
                  role="tab"
                  aria-selected={i === pick}
                  className={`tab ${i === pick ? 'is-on' : ''}`}
                  style={i === pick ? { boxShadow: `inset 0 -2px 0 ${GOLD}` } : undefined}
                  onClick={() => choose(i)}
                >
                  {s.name}
                </button>
              ))}
            </div>
            <p className="eyebrow exp-eyebrow" style={{ color: GOLD, marginTop: 14 }}>
              <span className="n">02</span>
              {t.species.eyebrow}
            </p>
            <h3 className="disp exp-title">{species.name}</h3>
            <p className="disp it species-latin">{species.latin}</p>
            <Ficha rows={species.ficha} />
          </div>
        </article>
      </div>
    </section>
  );
}

/** near: el visor está cerca (se monta y descarga). visible: está en pantalla (se renderiza). */
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
    const nearIo = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '900px 0px' });
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
