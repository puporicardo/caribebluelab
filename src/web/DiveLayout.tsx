import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate, useNavigationType } from 'react-router';
import { CONTENT, ContentContext } from '../content';
import { ZONE_SLUGS, zonePath, zoneRoute, type Lang, type ZoneIndex } from '../content/zones';
import { SiteAnalytics, trackEvent } from '../shared/analytics';
import { WaterRipples } from '../shared/components/WaterRipples';
import { filmTime } from '../shared/config/film';
import { createPointer, type OceanTarget } from '../shared/ocean/types';
import { clamp01, DiveContext, parseWebPath, smooth, type DiveState, type NavState } from './dive';
import { ZONE_PAGES } from './pages';
import { DepthRail, MobileDepthLine } from './parts/DepthRail';
import { Footer } from './parts/Footer';
import { Header } from './parts/Header';
import { LayerCaption } from './parts/LayerCaption';
import { Stage } from './parts/Stage';
import { useScrollMotion } from './useMotion';
import { useReveal } from './useReveal';
import './web.css';
import './motion.css';

/** Tiempo que una zona debe quedar en pantalla antes de cambiar la URL (evita “páginas” fugaces al hacer scroll rápido). */
const URL_SETTLE_MS = 400;

/**
 * Layout de la web: dibuja las seis páginas de zona seguidas (scroll continuo) y sincroniza
 * la URL con la zona visible. Entrar por /arrecife (o /#arrecife) baja directo a esa zona;
 * al hacer scroll, la URL pasa a la zona en pantalla sin recargar ni saltar.
 */
export default function DiveLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const navType = useNavigationType();
  const { lang, zone: routeZone } = parseWebPath(location.pathname);
  const content = CONTENT[lang];

  const [zone, setZone] = useState<ZoneIndex>(routeZone);
  const [solid, setSolid] = useState(false);
  const [footerOn, setFooterOn] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  /** Solo el contenido (no el escenario, donde nadan los peces) se vigila para el motion. */
  const mainRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  const target = useRef<OceanTarget>({ depth: routeZone / 5, ascent: 0, under: routeZone === 0 ? 0 : 1 });
  /** Tiempo de la película del descenso (0–6) que pide el scroll. */
  const film = useRef(0);
  const pointer = useRef(createPointer());
  const videoOk = useRef(false);

  // Valores vivos para los listeners (sin re-suscribir en cada render)
  const live = useRef({ lang, routeZone, zone, search: location.search });
  live.current = { lang, routeZone, zone, search: location.search };
  const suppressUntil = useRef(0);
  const userMoved = useRef(false);

  useReveal(mainRef);
  useScrollMotion(mainRef);

  /* ---------- Scroll → zona visible, profundidad del océano y URL ---------- */
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    let raf = 0;
    let pending = -1;
    let timer = 0;

    const measure = () => {
      raf = 0;
      const vh = window.innerHeight || 900;
      const sy = window.scrollY;
      const y = sy + vh * 0.5;
      const tops = ZONE_SLUGS.map((id, i) => (i === 0 ? 0 : (document.getElementById(id)?.getBoundingClientRect().top ?? 0) + sy));
      let z = 0;
      for (let i = 0; i < tops.length; i++) if (y >= tops[i]) z = i;
      const prog = z < 5 ? clamp01((y - tops[z]) / Math.max(1, tops[z + 1] - tops[z])) : clamp01((y - tops[5]) / Math.max(1, vh * 0.5));

      if (z < 5) {
        target.current.depth = (z + prog) / 5;
        target.current.ascent = 0;
      } else {
        const e = smooth(prog);
        target.current.depth = 1 - e;
        target.current.ascent = clamp01((e - 0.3) / 0.7);
      }
      // Película: el Ascenso dura hasta que el pie asoma (la cámara rompe la superficie justo ahí).
      const footTop = (footerRef.current?.getBoundingClientRect().top ?? vh) + sy;
      const g = z < 5 ? z + prog : 5 + clamp01((y - tops[5]) / Math.max(1, footTop - vh * 0.5 - tops[5]));
      const T = filmTime(g);
      film.current = T;
      // Ascenso: el sol crece arriba a medida que la cámara sube hacia la superficie.
      const asc = smooth(clamp01((T - 5.05) / 0.68));
      // Velo de lectura del Ascenso: entra poco a poco al cruzar a la zona (nunca de golpe).
      stageRef.current?.style.setProperty('--veil', smooth(clamp01((g - 4.96) / 0.2)).toFixed(4));
      stageRef.current?.style.setProperty('--asc', (asc * (1 - 0.45 * smooth(clamp01((T - 5.8) / 0.15)))).toFixed(4));
      // Bajo el agua entre el cruce del tramo 1 (~37 %) y la salida del tramo 6 (~78 %).
      target.current.under = smooth(clamp01((T - 0.3) / 0.12)) * (1 - smooth(clamp01((T - 5.7) / 0.1)));

      const gauge = clamp01((z + prog) / 6).toFixed(4);
      stageRef.current?.style.setProperty('--p', prog.toFixed(4));
      // Pantallas recorridas desde arriba (la portada se hunde con esto).
      rootRef.current?.style.setProperty('--sy', Math.min(3, sy / vh).toFixed(4));
      railRef.current?.style.setProperty('--d', gauge);
      lineRef.current?.style.setProperty('--d', gauge);
      setZone(z as ZoneIndex);
      setSolid(sy > 60);

      // URL: solo cuando la zona se asienta y no estamos en un scroll programado
      if (performance.now() < suppressUntil.current || z === live.current.routeZone) {
        pending = -1;
        window.clearTimeout(timer);
        return;
      }
      if (pending === z) return;
      pending = z;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const { lang: l, routeZone: rz, search } = live.current;
        if (performance.now() < suppressUntil.current || pending === rz || pending < 0) return;
        const state: NavState = { keepScroll: true };
        navigate({ pathname: zonePath(l, pending), search }, { replace: true, state });
        pending = -1;
      }, URL_SETTLE_MS);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    const onUser = () => {
      userMoved.current = true;
    };
    const onScrollEnd = () => {
      suppressUntil.current = 0;
      onScroll();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('scrollend', onScrollEnd);
    window.addEventListener('wheel', onUser, { passive: true });
    window.addEventListener('touchmove', onUser, { passive: true });
    window.addEventListener('keydown', onUser);
    onScroll();
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('scrollend', onScrollEnd);
      window.removeEventListener('wheel', onUser);
      window.removeEventListener('touchmove', onUser);
      window.removeEventListener('keydown', onUser);
    };
  }, [navigate]);

  /* ---------- URL → scroll (entrar por /arrecife, /#arrecife, clic en el menú o la regla) ---------- */
  const handledKey = useRef<string | null>(null);
  useEffect(() => {
    if (handledKey.current === location.key) return;
    const isFirst = handledKey.current === null;
    handledKey.current = location.key;
    const state = location.state as NavState | null;
    // Atrás/adelante del navegador (POP) siempre lleva a la zona de esa URL.
    if (!isFirst && String(navType) !== 'POP' && state?.keepScroll) return;

    const anchor = location.hash ? decodeURIComponent(location.hash.slice(1)) : '';
    const id = anchor || ZONE_SLUGS[routeZone];

    const go = (behavior: ScrollBehavior) => {
      const el = document.getElementById(id);
      if (!el) return;
      const top = id === 'superficie' ? 0 : Math.max(0, el.getBoundingClientRect().top + window.scrollY);
      suppressUntil.current = performance.now() + (behavior === 'smooth' ? 2200 : 400);
      window.scrollTo({ top, behavior });
    };

    if (isFirst) {
      if (id === 'superficie') return;
      requestAnimationFrame(() => go('auto'));
      // Las fuentes pueden mover el layout al cargar: se reajusta si el visitante aún no se movió.
      document.fonts?.ready.then(() => {
        if (!userMoved.current) go('auto');
      });
      return;
    }
    go('smooth');
    // Solo reacciona a navegaciones nuevas (cada una trae una location.key distinta).
  }, [location.key, location.hash, location.state, routeZone, navType]);

  /* ---------- Título del documento e idioma ---------- */
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = routeZone === 0 ? 'Caribe Blue Lab · Unimagdalena' : content.ui.pageTitle(content.zones[routeZone].name);
  }, [lang, routeZone, content]);

  /* ---------- Pie a la vista: se oculta la regla y se mide el final del recorrido ---------- */
  useEffect(() => {
    const el = footerRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    let done = false;
    const io = new IntersectionObserver(([e]) => {
      setFooterOn(e.isIntersecting);
      if (e.isIntersecting && !done) {
        done = true;
        trackEvent('fin_del_recorrido', { idioma: live.current.lang });
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const switchLang = useCallback<DiveState['switchLang']>(
    (next: Lang, source) => {
      if (next === live.current.lang) return;
      trackEvent('idioma_elegido', { idioma: next, desde: source });
      const state: NavState = { keepScroll: true };
      navigate({ pathname: zonePath(next, live.current.zone), search: live.current.search }, { state });
    },
    [navigate],
  );

  const dive = useMemo<DiveState>(() => ({ lang, zone, switchLang }), [lang, zone, switchLang]);

  // Las páginas no dependen de la zona visible: se memorizan para que el scroll no las re-renderice.
  const pages = useMemo(
    () => (
      <main id="contenido" ref={mainRef}>
        {ZONE_PAGES.map((Page, i) => (
          <Page key={i} />
        ))}
      </main>
    ),
    [],
  );

  // Tinta navy en cabecera y regla solo mientras se ve el Ascenso (el pie vuelve a ser oscuro).
  const light = zone === 5 && !footerOn;

  return (
    <ContentContext.Provider value={content}>
      <DiveContext.Provider value={dive}>
        <div ref={rootRef} className={`web ${light ? 'is-light' : ''}`}>
          <a className="skip" href="#contenido">
            {content.ui.skip}
          </a>
          <Stage zone={zone} stageRef={stageRef} target={target} pointer={pointer} videoOk={videoOk} film={film} />
          <Header solid={solid} />
          <DepthRail railRef={railRef} hidden={footerOn} />
          <LayerCaption film={film} />
          {pages}
          <Footer ref={footerRef} />
          <MobileDepthLine lineRef={lineRef} hidden={footerOn} />
          <WaterRipples pointer={pointer} />
          <Outlet />
          <SiteAnalytics route={zoneRoute(lang, routeZone)} path={location.pathname} />
        </div>
      </DiveContext.Provider>
    </ContentContext.Provider>
  );
}
