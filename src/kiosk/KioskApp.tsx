import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useSearchParams } from 'react-router';
import { CONTENT, ContentContext } from '../content';
import { ZONE_COLORS, type Lang } from '../content/zones';
import { SiteAnalytics } from '../shared/analytics';
import { BrandLogo } from '../shared/components/BrandLogo';
import { DiveFilm } from '../shared/components/DiveFilm';
import { MarineSnow } from '../shared/components/MarineSnow';
import { Rich } from '../shared/components/Rich';
import { SeaLife } from '../shared/components/SeaLife';
import { SPECIES_MODELS } from '../shared/components/species/models';
import { SpeciesStage, warmUpSpecies } from '../shared/components/species/SpeciesStage';
import { OceanCanvas } from '../shared/ocean/OceanCanvas';
import { createPointer, type OceanTarget } from '../shared/ocean/types';
import { frameAt, holdStart, presence, STOPS, TIMELINE } from './timeline';
import './kiosk.css';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => v * v * (3 - 2 * v);
const VARIANTS = ['', 'converge', 'drop', 'wave', 'focus', 'rise'] as const;
/** Parada del arrecife: ahí aparece el mero 3D. */
const REEF = STOPS.findIndex((s) => s.zone === 2);

/**
 * Kiosco del stand (TV): el mismo descenso de la web, automático y en bucle.
 * La película la mueve un reloj, y TODO lo demás (titulares, franjas, logo, mero 3D) se calcula
 * en cada cuadro a partir de la posición de la película, como en la web con el scroll: los textos
 * empiezan a entrar mientras la cámara llega a cada capa y salen arrastrados cuando reanuda.
 * Un clic o toque en cualquier parte pone la pantalla completa (sin avisos en pantalla) y
 * mantiene la pantalla encendida. El cursor se esconde solo.
 * Ruta: /kiosco/es · /kiosco/en. Revisión: ?escena=0–6 (parada inicial) &velocidad=x2|x6|pausa.
 * Teclado (montaje): F pantalla completa · ← → parada anterior/siguiente · espacio pausa.
 */
export default function KioskApp({ lang }: { lang: Lang }) {
  const content = CONTENT[lang];
  const [search] = useSearchParams();
  const speedParam = search.get('velocidad');
  const speed = speedParam === 'pausa' ? 0 : Number(speedParam?.replace('x', '')) || 1;
  const startStop = Math.max(0, Math.min(STOPS.length - 1, Number(search.get('escena')) || 0));

  const film = useRef(STOPS[startStop].t);
  const videoOk = useRef(false);
  const pointer = useRef(createPointer());
  const target = useRef<OceanTarget>({ depth: 0, ascent: 0, under: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const bandRefs = useRef<(HTMLElement | null)[]>([]);
  const meroRef = useRef<HTMLDivElement>(null);
  const clock = useRef(holdStart(startStop));
  const paused = useRef(speed === 0);
  /** El visor 3D solo se monta cerca del arrecife (ahorra GPU el resto del bucle). */
  const [near3d, setNear3d] = useState(startStop === REEF);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = `Caribe Blue Lab · ${lang === 'en' ? 'Kiosk' : 'Kiosco'}`;
    void warmUpSpecies(SPECIES_MODELS[0]);
  }, [lang]);

  /* ---------- Reloj: mueve la película; todo lo demás sale de la película ---------- */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let mounted3d = near3d;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!paused.current) clock.current += dt * (speed || 1);
      const f = frameAt(clock.current);
      const T = f.film;
      film.current = T;

      target.current.depth = clamp01(T / 5);
      target.current.ascent = smooth(clamp01(T - 5));
      target.current.under = smooth(clamp01((T - 0.3) / 0.12)) * (1 - smooth(clamp01((T - 5.7) / 0.1)));

      const root = rootRef.current;
      if (root) {
        root.style.setProperty('--asc', (smooth(clamp01((T - 5.05) / 0.68)) * (1 - 0.45 * smooth(clamp01((T - 5.8) / 0.15)))).toFixed(4));
        root.style.setProperty('--depth', (T / 6).toFixed(4));
      }
      if (fadeRef.current) fadeRef.current.style.opacity = f.fade.toFixed(3);

      // Loop: segundos desde que empezó la vuelta (la portada entra con el reloj, no hay movimiento aún).
      const loopT = ((clock.current % TIMELINE.total) + TIMELINE.total) % TIMELINE.total;
      let brand = 0;
      STOPS.forEach((s, i) => {
        let { enter, leave } = presence(i, T);
        if (i === 0) enter = clamp01((loopT - 0.3) / 2.4); // portada: el logo se arma al empezar
        if (i === STOPS.length - 1) leave = f.fade > 0 && loopT > 2 ? f.fade : 0; // cierre: se va con el fundido
        const vis = enter > 0 && leave < 1;
        if (s.kind !== 'zone') brand = Math.max(brand, vis ? Math.min(enter, 1 - leave) : 0);
        const el = cardRefs.current[i];
        if (el) {
          el.style.visibility = vis ? 'visible' : 'hidden';
          if (vis) {
            el.style.setProperty('--in', enter.toFixed(4));
            el.style.setProperty('--out', leave.toFixed(4));
          }
        }
        const band = bandRefs.current[i];
        if (band) {
          band.style.visibility = vis ? 'visible' : 'hidden';
          if (vis) {
            band.style.setProperty('--pres', (smooth(enter) * (1 - smooth(leave))).toFixed(4));
            band.style.setProperty('--rel', (T - s.t).toFixed(4));
          }
        }
        if (i === REEF) {
          const m = meroRef.current;
          if (m) {
            m.style.setProperty('--in', smooth(enter).toFixed(4));
            m.style.setProperty('--out', smooth(leave).toFixed(4));
          }
          const want = vis || (T > s.t - 0.7 && T < s.t + 0.5);
          if (want !== mounted3d) {
            mounted3d = want;
            setNear3d(want);
          }
        }
      });
      // El logo pequeño de la cabecera cede ante el logo grande de portada y cierre.
      root?.style.setProperty('--brand', brand.toFixed(3));
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // near3d solo da el valor inicial.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed]);

  /* ---------- Pantalla completa con un clic o toque; pantalla siempre encendida ---------- */
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    const keepAwake = async () => {
      try {
        const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } };
        lock = (await nav.wakeLock?.request('screen')) ?? null;
      } catch {
        /* sin permiso: no pasa nada */
      }
    };
    const onPress = () => {
      if (!document.fullscreenElement) void document.documentElement.requestFullscreen?.({ navigationUI: 'hide' }).catch(() => undefined);
      void keepAwake();
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible' && lock === null) void keepAwake();
    };
    window.addEventListener('pointerdown', onPress);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('pointerdown', onPress);
      document.removeEventListener('visibilitychange', onVisible);
      void lock?.release();
    };
  }, []);

  /* ---------- Cursor: se esconde si nadie lo mueve ---------- */
  useEffect(() => {
    const root = rootRef.current;
    let timer = 0;
    const wake = () => {
      root?.classList.remove('is-idle');
      window.clearTimeout(timer);
      timer = window.setTimeout(() => root?.classList.add('is-idle'), 2200);
    };
    wake();
    window.addEventListener('pointermove', wake);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pointermove', wake);
    };
  }, []);

  /* ---------- Teclado (solo montaje; no se anuncia en pantalla) ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) void document.documentElement.requestFullscreen?.();
        else void document.exitFullscreen?.();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const loop = clock.current % TIMELINE.total;
        let current = 0;
        STOPS.forEach((_, i) => {
          if (holdStart(i) <= loop + 0.01) current = i;
        });
        const next = (current + (e.key === 'ArrowRight' ? 1 : -1) + STOPS.length) % STOPS.length;
        clock.current = holdStart(next);
      } else if (e.key === ' ') {
        e.preventDefault();
        paused.current = !paused.current;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /** Una tarjeta por parada; su coreografía la mueven --in / --out (película), no el reloj. */
  const cards = useMemo(
    () =>
      STOPS.map((s, i) => {
        if (s.kind !== 'zone') {
          return (
            <section key={i} ref={(el) => void (cardRefs.current[i] = el)} className={`k-card k-brandcard k-brandcard--${s.kind}`} aria-hidden={s.kind === 'outro'}>
              <p className="k-eyebrow">
                <span className="k-rule" />
                <span className="k-type">{content.brand.kicker}</span>
              </p>
              <h1 className="k-logo">
                <BrandLogo variant="stacked" />
              </h1>
              <p className="k-tagline">
                <Rich text={content.brand.tagline} split />
              </p>
              {s.kind === 'outro' ? <p className="k-partners">{content.brand.partners}</p> : null}
            </section>
          );
        }
        const z = content.zones[s.zone!];
        return (
          <section key={i} ref={(el) => void (cardRefs.current[i] = el)} className={`k-card k-zonecard k-v--${VARIANTS[s.zone!]}`}>
            <p className="k-eyebrow">
              <span className="k-rule" />
              <span className="k-type">{content.ui.zoneEyebrow(s.zone!, z.name)}</span>
            </p>
            <h2 className="k-title">
              <Rich text={z.title} split />
            </h2>
            <p className="k-verb">
              <span className="k-rule" />
              {z.verb}
            </p>
          </section>
        );
      }),
    [content],
  );

  const bands = useMemo(
    () =>
      STOPS.map((s, i) =>
        s.kind === 'zone' ? (
          <div key={i} ref={(el) => void (bandRefs.current[i] = el)} className={`k-band ${s.zone! % 2 ? 'k-band--l' : 'k-band--r'}`} aria-hidden="true">
            <div className="k-band-track">
              {[0, 1, 2, 3].map((k) => (
                <span key={k} className="k-band-run">
                  <span className="k-band-word">{content.zones[s.zone!].name}</span>
                  <span className="k-band-dot">✦</span>
                  <span className="k-band-em">{content.zones[s.zone!].verb}</span>
                  <span className="k-band-dot">✦</span>
                </span>
              ))}
            </div>
          </div>
        ) : null,
      ),
    [content],
  );

  return (
    <ContentContext.Provider value={content}>
      <div ref={rootRef} className="kiosk" style={{ '--tint': ZONE_COLORS[2] } as CSSProperties}>
        <div className="k-stage" aria-hidden="true">
          <DiveFilm film={film} playing={videoOk} clock />
          <SeaLife film={film} pointer={pointer} drive="film" />
          <MarineSnow film={film} drive="film" />
          <div className="k-grade" />
          <div className="k-sun" />
          <OceanCanvas target={target} pointer={pointer} overlay={videoOk} ease={0.05} className="k-ocean" />
          <div className="k-scrim" />
          <div className="k-lens" />
        </div>

        {bands}

        {/* El mero en 3D llega nadando con la cámara al arrecife y se queda atrás al seguir */}
        <div ref={meroRef} className="k-mero" aria-hidden="true">
          {near3d ? <SpeciesStage url={SPECIES_MODELS[0]} label={content.species.items[0].name} labels={content.viewer} mode="showcase" active /> : null}
        </div>

        <header className="k-top">
          <BrandLogo variant="horizontal" />
        </header>

        <div className="k-rail" aria-hidden="true">
          <span />
        </div>

        {cards}

        <div ref={fadeRef} className="k-fade" aria-hidden="true" />
        <SiteAnalytics route="/kiosco/[idioma]" path={`/kiosco/${lang}`} />
      </div>
    </ContentContext.Provider>
  );
}
