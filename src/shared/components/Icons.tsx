interface IconProps {
  color?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function ArrowRight({ color = 'currentColor', width = 28, height = 12, className }: IconProps) {
  return (
    <svg className={className} width={width} height={height} viewBox="0 0 28 12" aria-hidden="true">
      <path d="M0 6 H26 M20 1 L26 6 L20 11" fill="none" stroke={color} strokeWidth="1.3" />
    </svg>
  );
}

export function ArrowLong({ color = 'currentColor', width = 40, height = 14, className }: IconProps) {
  return (
    <svg className={className} width={width} height={height} viewBox="0 0 40 14" aria-hidden="true">
      <path d="M0 7 H38 M31 1 L38 7 L31 13" fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export function ArrowDown({ color = 'currentColor', width = 14, height = 18, className }: IconProps) {
  return (
    <svg className={className} width={width} height={height} viewBox="0 0 14 18" aria-hidden="true">
      <path d="M7 1 V16 M1 10 L7 16 L13 10" fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export function ArrowUp({ color = 'currentColor', width = 14, height = 18, className }: IconProps) {
  return (
    <svg className={className} width={width} height={height} viewBox="0 0 14 18" aria-hidden="true">
      <path d="M7 17 V2 M1 8 L7 2 L13 8" fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export function PlayIcon({ color = 'currentColor', width = 18, height = 18, className }: IconProps) {
  return (
    <svg className={className} width={width} height={height} viewBox="0 0 18 18" aria-hidden="true">
      <path d="M3 2 L16 9 L3 16 Z" fill={color} />
    </svg>
  );
}

export function PauseIcon({ color = 'currentColor', width = 18, height = 18, className }: IconProps) {
  return (
    <svg className={className} width={width} height={height} viewBox="0 0 18 18" aria-hidden="true">
      <rect x="3" y="2" width="4" height="14" fill={color} />
      <rect x="11" y="2" width="4" height="14" fill={color} />
    </svg>
  );
}

/** Pez esquemático (siluetas difusas del fondo). */
export const FISH_PATH = 'M14 12 C26 0 46 0 56 12 C46 24 26 24 14 12 Z M16 12 L2 2 L5 12 L2 22 Z';
