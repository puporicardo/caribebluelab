import type { ComponentType } from 'react';
import { S0HowTo, S0Manifesto, S0Welcome } from './Scene0';
import { S1Art, S1Films, S1Head } from './Scene1';
import { S2Counter, S2Head, S2Model } from './Scene2';
import { S3Head, S3Shelf, S3Songs } from './Scene3';
import { S4Creatures, S4Head, S4Sounds } from './Scene4';
import { S5Challenge, S5Faro, S5Head } from './Scene5';

/**
 * Guion del bucle: 6 escenas × 3 momentos.
 * Cada minuto: entrada 0–12 s · experiencia A 12–36 s · experiencia B 36–60 s.
 */
export const BEATS: readonly (readonly [ComponentType, ComponentType, ComponentType])[] = [
  [S0Welcome, S0HowTo, S0Manifesto],
  [S1Head, S1Art, S1Films],
  [S2Head, S2Model, S2Counter],
  [S3Head, S3Shelf, S3Songs],
  [S4Head, S4Sounds, S4Creatures],
  [S5Head, S5Faro, S5Challenge],
];

export const beatAt = (secondInScene: number) => (secondInScene < 12 ? 0 : secondInScene < 36 ? 1 : 2);
