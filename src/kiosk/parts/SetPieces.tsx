import { useMemo } from 'react';
import { seeded } from '../../shared/bars';
import { FISH_PATH } from '../../shared/components/Icons';

/** Cardumen lejano (Zona de luz). */
export function FishSchool() {
  const fish: [number, number, number][] = [
    [40, 60, 0.9], [110, 30, 0.75], [150, 96, 1], [210, 50, 0.8], [260, 120, 0.7], [300, 20, 0.85],
    [330, 80, 1.05], [400, 46, 0.78], [420, 140, 0.9], [470, 92, 0.7], [80, 150, 0.8], [190, 170, 0.65],
  ];
  return (
    <div aria-hidden="true" className="k-school">
      <svg width="560" height="220" viewBox="0 0 560 220">
        <g fill="#1D3256">
          {fish.map(([x, y, s]) => (
            <path key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${s})`} d={FISH_PATH} />
          ))}
        </g>
      </svg>
    </div>
  );
}

/** Siluetas difusas de coral y peces (Arrecife). */
export function Reef() {
  return (
    <div aria-hidden="true" className="k-piece k-fade">
      <svg width="1920" height="360" viewBox="0 0 1920 360" className="k-reef">
        <g stroke="#1D3256" strokeWidth="12" strokeLinecap="round" fill="none">
          <path d="M240 250 L240 140 M240 190 L196 132 M240 166 L288 104 M196 132 L178 96 M288 104 L310 70 M240 140 L232 100" />
          <path d="M1180 240 L1180 120 M1180 176 L1136 120 M1180 150 L1226 96 M1136 120 L1124 84 M1226 96 L1250 66" />
          <path d="M1640 236 L1640 150 M1640 190 L1604 146 M1640 172 L1680 128 M1680 128 L1698 98" />
        </g>
        <g fill="#1D3256">
          <ellipse cx="520" cy="250" rx="120" ry="70" />
          <ellipse cx="1430" cy="246" rx="96" ry="58" />
          <path d="M760 250 C 740 150 820 80 880 70 C 860 130 900 170 960 120 C 950 190 900 230 870 250 Z" />
        </g>
        <path
          d="M0 360 L0 250 C120 222 190 268 320 240 C450 212 520 262 660 246 C820 228 880 282 1040 256 C1180 234 1250 276 1400 250 C1540 226 1640 270 1780 246 C1850 234 1890 246 1920 240 L1920 360 Z"
          fill="#0B1B33"
        />
      </svg>
      <div className="k-swim" style={{ top: 420, animationDuration: '34s', filter: 'blur(1px)', opacity: 0.7 }}>
        <svg width="120" height="48" viewBox="0 0 60 24">
          <path d={FISH_PATH} fill="#1D3256" />
        </svg>
      </div>
      <div className="k-swim k-swim--back" style={{ top: 720, animationDuration: '46s', animationDelay: '-12s', filter: 'blur(2px)', opacity: 0.6 }}>
        <svg width="90" height="36" viewBox="0 0 60 24">
          <path d={FISH_PATH} fill="#0B1B33" />
        </svg>
      </div>
    </div>
  );
}

/** Hojas de pasto marino que se mecen (Pradera marina). */
export function Seagrass() {
  const blades = useMemo(() => {
    const rnd = seeded(7);
    // Mismo orden aleatorio que el diseño original (las primeras tiradas se reservaban a otras capas).
    for (let i = 0; i < 12 * 5 + 28 * 5; i++) rnd();
    return Array.from({ length: 44 }, (_, i) => ({
      x: Math.round(i * 44 + rnd() * 30 - 10),
      w: Math.round(10 + rnd() * 12),
      h: Math.round(150 + rnd() * 300),
      d: (4 + rnd() * 3).toFixed(1),
      dl: (-rnd() * 5).toFixed(1),
      o: (0.4 + rnd() * 0.4).toFixed(2),
    }));
  }, []);
  return (
    <div aria-hidden="true" className="k-grass k-fade">
      {blades.map((g, i) => (
        <div
          key={i}
          style={{
            left: g.x,
            width: g.w,
            height: g.h,
            opacity: Number(g.o),
            animationDuration: `${g.d}s`,
            animationDelay: `${g.dl}s`,
          }}
        />
      ))}
    </div>
  );
}

/** Señuelo bioluminiscente (Zona oscura). */
export function Lure() {
  return (
    <div aria-hidden="true" className="k-lure">
      <div />
    </div>
  );
}
