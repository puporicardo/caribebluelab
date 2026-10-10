import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router';
import { CONTENT, ContentContext } from '../content';
import { ZONE_COLORS, type Lang } from '../content/zones';
import { SiteAnalytics } from '../shared/analytics';
import { VideoStack } from '../shared/components/VideoStack';
import { WaterRipples } from '../shared/components/WaterRipples';
import { SPECIES_MODELS } from '../shared/components/species/models';
import { warmUpSpecies } from '../shared/components/species/SpeciesStage';
import { OceanCanvas } from '../shared/ocean/OceanCanvas';
import { createPointer, type OceanTarget } from '../shared/ocean/types';
import { BEATS, beatAt } from './beats';
import { oceanTargetAt, readKioskParams, SCENE_SECONDS, STAGE_H, STAGE_W, useFitScale, useLoopClock } from './hooks';
import { DepthGauge } from './parts/DepthGauge';
import { ReefModel } from './parts/ReefModel';
import { FishSchool, Lure, Reef, Seagrass } from './parts/SetPieces';
import './kiosk.css';

const OCEAN_RES: [number, number] = [960, 540];

/**
 * Modo kiosco (TV del stand): bucle de 6 minutos por las seis profundidades.
 * Ruta: /kiosco/es o /kiosco/en. Revisión: ?escena=0–5 &velocidad=x6|pausa &subtitulos=0
 * Teclado: F pantalla completa · ← → cambiar de zona · espacio pausa.
 */
export default function KioskApp({ lang }: { lang: Lang }) {
  const content = CONTENT[lang];
  const location = useLocation();
  const [search] = useSearchParams();
  const params = useMemo(() => readKioskParams(search), [search]);
  const [paused, setPaused] = useState(false);
  const [t, setT] = useLoopClock(params.scene * SCENE_SECONDS, paused ? 0 : params.speed);

  const scene = Math.min(5, Math.floor(t / SCENE_SECONDS));
  const local = t - scene * SCENE_SECONDS;
  const beat = beatAt(local);
  const light = scene === 5;
  const fit = useFitScale();

  const stageRef = useRef<HTMLDivElement>(null);
  const pointer = useRef(createPointer());
  const videoOk = useRef(false);
  const target = useRef<OceanTarget>(oceanTargetAt(t));
  useEffect(() => {
    target.current = oceanTargetAt(t);
  }, [t]);

  // Idioma, título y precarga del mero 3D desde el arranque.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = `Caribe Blue Lab · ${lang === 'en' ? 'Kiosk' : 'Kiosco'}`;
  }, [lang]);
  useEffect(() => {
    void warmUpSpecies(SPECIES_MODELS[0]);
  }, []);

  // Teclado para el montaje en el stand.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) void document.documentElement.requestFullscreen?.();
        else void document.exitFullscreen?.();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        setT((prev) => {
          const s = Math.floor(prev / SCENE_SECONDS) + (e.key === 'ArrowRight' ? 1 : -1);
          return ((s + 6) % 6) * SCENE_SECONDS;
        });
      } else if (e.key === ' ') {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setT]);

  // Videos: el activo se desplaza lento (baja en 0–4, sube en el Ascenso).
  const prevScene = (scene + 5) % 6;
  const videoStyle = (i: number) => {
    const startY = i === 5 ? -54 : 54;
    const endY = -startY;
    let y = startY;
    let dur = 0;
    if (i === scene) {
      y = startY + (endY - startY) * (local / SCENE_SECONDS);
      dur = 0.4;
    } else if (i === prevScene) {
      y = endY;
      dur = 0.4;
    }
    return {
      transform: `translate3d(0, ${Math.round(y * 10) / 10}px, 0) scale(1.12)`,
      transition: `opacity 3.5s ease, transform ${dur}s linear`,
    };
  };

  const Beat = BEATS[scene][beat];
  const caption = content.kiosk.captions[scene][beat];

  return (
    <ContentContext.Provider value={content}>
      <div className="kiosk-viewport">
        <div
          ref={stageRef}
          className={`kiosk ${light ? 'is-light' : ''}`}
          style={{
            width: STAGE_W,
            height: STAGE_H,
            transform: `translate(${fit.x}px, ${fit.y}px) scale(${fit.s})`,
          }}
        >
          {/* Fondo: video real + tinte + lavado dorado */}
          <div className="k-bg" aria-hidden="true">
            <VideoStack active={scene} playing={videoOk} layerStyle={videoStyle} />
            <div className="k-grade" style={{ background: ZONE_COLORS[scene] }} />
            <div className="k-wash" style={{ opacity: light ? 0.74 : 0 }} />
          </div>
          <OceanCanvas target={target} pointer={pointer} overlay={videoOk} ease={0.035} resolution={OCEAN_RES} className="k-ocean" />

          {/* Escenografía por zona */}
          {scene === 1 && <FishSchool />}
          {scene === 2 && <Reef />}
          {scene === 3 && <Seagrass />}
          {scene === 4 && <Lure />}

          {/* Velos de lectura */}
          <div className="k-scrim" aria-hidden="true" />
          <div className="k-scrim-bottom" aria-hidden="true" />

          <header className="k-header">
            <div className="k-header-brand">
              <span className="disp k-brand">
                Caribe <em>Blue</em> Lab
              </span>
              <span className="k-header-sep" />
              <span className="eyebrow k-kicker">{content.brand.kicker}</span>
            </div>
            <span className="eyebrow k-partners">{content.brand.partners}</span>
          </header>

          {scene === 2 && <ReefModel shown={beat >= 1} />}

          <Beat key={`${scene}-${beat}-${lang}`} />

          <DepthGauge t={t} scene={scene} light={light} onJump={(i) => setT(i * SCENE_SECONDS)} />

          <aside aria-label={content.kiosk.qr.label} className="k-qr">
            <span className="eyebrow">{content.kiosk.qr.label}</span>
            <svg width="140" height="140" viewBox="0 0 150 150" role="img" aria-label={content.kiosk.qr.aria}>
              <rect width="150" height="150" fill="#FFFFFF" />
              <rect x="10" y="10" width="38" height="38" fill="none" stroke="#0B1B33" strokeWidth="7" />
              <rect x="22" y="22" width="14" height="14" fill="#0B1B33" />
              <rect x="102" y="10" width="38" height="38" fill="none" stroke="#0B1B33" strokeWidth="7" />
              <rect x="114" y="22" width="14" height="14" fill="#0B1B33" />
              <rect x="10" y="102" width="38" height="38" fill="none" stroke="#0B1B33" strokeWidth="7" />
              <rect x="22" y="114" width="14" height="14" fill="#0B1B33" />
              <text x="96" y="104" textAnchor="middle" fontFamily="IBM Plex Sans, sans-serif" fontSize="20" fontWeight="600" fill="#3A4A5E">
                QR
              </text>
            </svg>
            <span className="k-qr-url">{content.kiosk.qr.url}</span>
          </aside>

          {params.captions && (
            <p role="region" aria-live="polite" aria-label={lang === 'en' ? 'Captions' : 'Subtítulos'} className="k-sub" key={caption}>
              {caption}
            </p>
          )}

          <WaterRipples pointer={pointer} size={200} stage={{ ref: stageRef, width: STAGE_W, height: STAGE_H }} />
        </div>
      </div>
      <SiteAnalytics route="/kiosco/[idioma]" path={location.pathname} />
    </ContentContext.Provider>
  );
}
