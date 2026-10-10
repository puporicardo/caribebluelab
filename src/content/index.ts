import { createContext, useContext } from 'react';
import { en } from './en';
import { es } from './es';
import type { Content } from './types';
import type { Lang } from './zones';

export const CONTENT: Record<Lang, Content> = { es, en };

export const ContentContext = createContext<Content>(es);

/** Textos del idioma activo (lo fija la ruta: /en/… o /kiosco/en). */
export const useContent = () => useContext(ContentContext);

export type { Content, FichaRow, Rich } from './types';
export * from './zones';
