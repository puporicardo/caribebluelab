import type { Lang } from './zones';

/**
 * Texto enriquecido mínimo: lo que va entre *asteriscos* se muestra en cursiva (<em>).
 * Ej.: 'Peces del Caribe que se pueden *girar y tocar*'.
 */
export type Rich = string;

/** Fila de una ficha técnica: [etiqueta, valor]. */
export type FichaRow = readonly [label: string, value: Rich];

export interface ZoneCopy {
  /** Nombre corto de la profundidad. */
  name: string;
  /** Verbo de la experiencia. */
  verb: string;
  /** Titular editorial de la zona (Rich). La Superficie no lo usa. */
  title: Rich;
}

export interface SpeciesCopy {
  name: string;
  latin: string;
  ficha: FichaRow[];
}

export interface Content {
  lang: Lang;
  /** Etiqueta del idioma para el selector. */
  langName: string;
  brand: {
    kicker: string;
    tagline: string;
    partners: string;
  };
  zones: [ZoneCopy, ZoneCopy, ZoneCopy, ZoneCopy, ZoneCopy, ZoneCopy];
  ui: {
    skip: string;
    depth: string;
    chooseLanguage: string;
    languageGroup: string;
    start: string;
    descend: string;
    mainNav: string;
    nav: { dive: string; experiences: string; incubazul: string };
    zoneEyebrow: (n: number, name: string) => string;
    experience: (n: number, total: number) => string;
    fig: string;
    nowPlaying: string;
    play: string;
    pause: string;
    playTitle: (title: string) => string;
    fullscreen: string;
    next: string;
    pageTitle: (zoneName: string) => string;
  };
  viewer: {
    toolbar: string;
    rotateLeft: string;
    rotateRight: string;
    rotateLeftAria: string;
    rotateRightAria: string;
    zoomIn: string;
    zoomOut: string;
    reset: string;
    loading: (pct: number) => string;
    hint: string;
    unavailableTitle: string;
    unavailableBody: string;
    pendingTitle: string;
    pendingBody: string;
    canvasLabel: (species: string) => string;
  };
  species: {
    tabs: string;
    eyebrow: string;
    items: [SpeciesCopy, SpeciesCopy, SpeciesCopy];
  };
  web: {
    howTo: { eyebrow: string; quote: string; body: string; indexLabel: string };
    art: {
      title: string;
      body: string;
      ficha: FichaRow[];
      explore: string;
      alliance: string;
      work: string;
      fig1: string;
      fig2: string;
      network: string;
      places: [string, string];
    };
    films: {
      title: Rich;
      body: string;
      ficha: FichaRow[];
      note: string;
      screen: (n: string) => string;
      items: { n: string; title: string }[];
      duration: string;
    };
    reef: { viewerLabel: string };
    shelf: {
      title: Rich;
      note: string;
      books: { label: string; title: string }[];
      kit: string;
    };
    corner: {
      eyebrow: string;
      title: Rich;
      sources: string;
      songs: string[];
      duration: string;
    };
    sounds: {
      title: Rich;
      body: string;
      ficha: FichaRow[];
      tracksLabel: string;
      tracks: [string, string, string];
      fig: string;
    };
    creatures: {
      title: Rich;
      body: string;
      ficha: FichaRow[];
      plates: [string, string, string, string];
      fig: string;
    };
    faro: {
      title: Rich;
      body: string;
      link: string;
      panel: string;
      cols: [string, string, string];
      rivers: [string, string, string];
      live: string;
      fig: string;
    };
    challenge: {
      title: Rich;
      note: string;
      project: string;
      team: string;
      status: string;
      contact: string;
    };
    close: { eyebrow: string; title: Rich; cta: string };
  };
  footer: {
    backToTop: string;
    journey: string;
    ecosystemTitle: Rich;
    agreement: string;
    ecosystem: { name: string; host: string; url: string; current?: boolean }[];
    here: string;
    eventTitle: string;
    event: string[];
    connectTitle: string;
    connectBody: string;
    connectCta: string;
    partnersLabel: string;
    partners: string[];
    rights: string;
    domainNote: string;
  };
  kiosk: {
    howTo: { eyebrow: string; title: Rich };
    manifesto: { eyebrow: string; quote: string; scan: string };
    art: {
      eyebrow: string;
      body: string;
      ficha: FichaRow[];
      work: string;
      work2: string;
      fig1: string;
      fig2: string;
    };
    films: {
      eyebrow: string;
      body: string;
      screen: string;
      pending: string;
    };
    reef1: { eyebrow: string; title: Rich; speciesLabel: string };
    reef2: {
      eyebrow: string;
      title: Rich;
      body: string;
      ficha: FichaRow[];
      card: { eyebrow: string; title: string; meta: string; counter: string };
    };
    shelf: { eyebrow: string; body: string; ficha: FichaRow[] };
    songs: { eyebrow: string; ficha: FichaRow[]; fig: string };
    sounds: { eyebrow: string; body: string; fig: string };
    creatures: { eyebrow: string; body: string };
    faro: { eyebrow: string };
    challenge: { eyebrow: string; body: string };
    qr: { label: string; aria: string; url: string };
    captions: [string, string, string][];
  };
}
