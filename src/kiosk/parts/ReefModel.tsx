import { useContent } from '../../content';
import { SPECIES_MODELS } from '../../shared/components/species/models';
import { SpeciesStage } from '../../shared/components/species/SpeciesStage';

/**
 * El mero guasa en 3D, girando solo, a la derecha del Arrecife.
 * Se monta al entrar a la escena (oculto en la apertura) y permanece entre los dos momentos
 * de la zona para que el modelo no se reinicie al cambiar el texto.
 */
export function ReefModel({ shown }: { shown: boolean }) {
  const t = useContent();
  return (
    <div className={`k-model ${shown ? 'is-on' : ''}`} aria-hidden={!shown}>
      <svg width="760" height="260" viewBox="0 0 760 260" aria-hidden="true" className="k-model-orbit">
        <ellipse cx="380" cy="130" rx="360" ry="96" fill="none" stroke="rgba(245,243,240,.35)" strokeWidth="1" strokeDasharray="3 9" className="dash" />
      </svg>
      <div className="k-model-shadow" aria-hidden="true" />
      <div className="k-model-stage">
        <SpeciesStage url={SPECIES_MODELS[0]} label={t.species.items[0].name} labels={t.viewer} mode="showcase" active={shown} />
      </div>
    </div>
  );
}
