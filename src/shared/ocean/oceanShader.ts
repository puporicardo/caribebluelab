/**
 * Océano en tiempo real (WebGL 1): degradado de la paleta por profundidad, rayos de luz,
 * cáusticas, bruma, tres capas de partículas en suspensión, bioluminiscencia en lo profundo,
 * luz que sigue al puntero y ascenso hacia la luz dorada.
 *
 * uOverlay = 1 cuando hay video real detrás: entonces solo se dibujan partículas y luz (con alfa).
 */
export const OCEAN_VERTEX = `
attribute vec2 p;
varying vec2 vUv;
void main(){ vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }
`;

export const OCEAN_FRAGMENT = `
precision highp float;
varying vec2 vUv;
uniform vec2 uRes; uniform float uTime; uniform float uDepth; uniform float uAscent; uniform float uFlow;
uniform vec2 uMouse; uniform float uMouseOn; uniform float uOverlay; uniform float uUnder;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y); }
float fbm(vec2 p){ float v = 0.0; float a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; } return v; }
float caustic(vec2 uv, float t){
  vec2 p = mod(uv * 6.2831853, 6.2831853) - 250.0; vec2 i = p; float c = 1.0; float inten = 0.005;
  for (int n = 0; n < 4; n++) { float tt = t * (1.0 - (3.5 / float(n + 1)));
    i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / inten), p.y / (cos(i.y + tt) / inten))); }
  c /= 4.0; c = 1.17 - pow(c, 1.4); return pow(abs(c), 8.0); }
vec3 pal(float d){
  vec3 c0 = vec3(0.298, 0.525, 0.682); vec3 c1 = vec3(0.208, 0.400, 0.545); vec3 c2 = vec3(0.165, 0.298, 0.447);
  vec3 c3 = vec3(0.114, 0.196, 0.337); vec3 c4 = vec3(0.043, 0.106, 0.200);
  d = clamp(d, 0.0, 1.0) * 4.0;
  if (d < 1.0) return mix(c0, c1, d); if (d < 2.0) return mix(c1, c2, d - 1.0); if (d < 3.0) return mix(c2, c3, d - 2.0); return mix(c3, c4, d - 3.0); }
float parts(vec2 st, float sc, float sp, float sz, float t, float fl, out float tw){
  vec2 p = st * sc; p.y -= fl * sp + t * 0.035 * sp; p.x += sin(p.y * 0.35 + t * 0.2) * 0.2;
  vec2 g = floor(p); vec2 f = fract(p); float h = hash(g); vec2 c = vec2(hash(g + 3.1), hash(g + 7.7)) * 0.8 + 0.1;
  float d = length(f - c); tw = h; return (1.0 - smoothstep(sz * 0.2, sz, d)) * step(0.58, h); }

void main(){
  vec2 uv = vUv; float asp = uRes.x / uRes.y; vec2 st = vec2(uv.x * asp, uv.y); float t = uTime; float d = uDepth;
  vec3 cream = vec3(0.961, 0.953, 0.941); vec3 gold = vec3(0.824, 0.733, 0.506); vec3 bio = vec3(0.435, 0.890, 0.839);
  vec3 col = pal(d + (0.5 - uv.y) * 0.22);
  float shallow = (1.0 - d) * (1.0 - d);
  col += cream * pow(uv.y, 2.4) * shallow * 0.3;
  float wv = fbm(vec2(st.x * 2.2 + t * 0.15, t * 0.1)) * 0.07;
  col = mix(col, cream, smoothstep(0.92 - wv, 1.0, uv.y) * (1.0 - smoothstep(0.0, 0.07, d)) * 0.55);
  float rx = (uv.x - 0.5) + (1.0 - uv.y) * 0.38;
  float rays = pow(max(0.0, sin(rx * 13.0 + t * 0.22 + fbm(vec2(rx * 3.0, t * 0.05)) * 4.0)), 6.0);
  rays += 0.65 * pow(max(0.0, sin(rx * 21.0 - t * 0.16 + 1.7)), 8.0);
  rays *= smoothstep(0.0, 0.95, uv.y) * fbm(vec2(rx * 6.0, uv.y * 1.6 - t * 0.08));
  col += cream * rays * (mix(0.42, 0.0, smoothstep(0.0, 0.72, d)) + uAscent * 0.4);
  float cz = caustic(st * 0.9 + vec2(0.0, t * 0.02), t * 0.35 + 23.0);
  col += cream * cz * smoothstep(0.5, 1.0, uv.y) * (1.0 - smoothstep(0.0, 0.32, d)) * 0.28;
  float hz = fbm(st * 1.4 + vec2(t * 0.03, -t * 0.02));
  col *= 0.9 + hz * 0.2;
  float tw1; float tw2; float tw3;
  float p1 = parts(st, 20.0, 6.0, 0.05, t, uFlow, tw1);
  float p2 = parts(st + 3.7, 10.0, 3.2, 0.07, t, uFlow, tw2);
  float p3 = parts(st + 9.1, 4.6, 1.6, 0.11, t, uFlow, tw3);
  float deep = smoothstep(0.62, 0.95, d) * (1.0 - uAscent);
  vec3 pc = mix(cream, bio, deep);
  float pulse = 0.55 + 0.45 * sin(t * 1.8 + tw2 * 40.0);
  col += pc * (p1 * 0.16 + p2 * 0.26 + p3 * 0.2) * mix(1.0, pulse * 1.8, deep);
  vec2 m = vec2(uMouse.x * asp, uMouse.y);
  float ml = exp(-length(st - m) * 4.0) * uMouseOn;
  col += mix(cream * 0.12, bio * 0.14, deep) * ml;
  if (uOverlay > 0.5) {
    // Sobre video real: partículas, luz del puntero y óptica del agua (rayos y red de cáusticas
    // que se mueve sobre la escena). Nada de esto se dibuja con la cámara sobre el agua.
    // Pocas motas redondas (el polvo y la arena los dibuja MarineSnow); en lo profundo quedan como bioluminiscencia.
    float pa = (p1 * 0.1 + p2 * mix(0.06, 0.3, deep) + p3 * mix(0.015, 0.1, deep)) * mix(1.0, pulse * 1.8, deep) * (1.0 - uAscent * 0.85) * uUnder;
    float shine = 1.0 - smoothstep(0.0, 0.7, d);
    float ra = rays * (0.22 * shine + uAscent * 0.18) * uUnder;
    float cn = caustic(st * 1.15 + vec2(t * 0.015, t * 0.03), t * 0.42 + 7.0);
    float ca = cn * (0.06 + 0.16 * smoothstep(0.35, 1.0, uv.y)) * (1.0 - smoothstep(0.0, 0.42, d)) * uUnder;
    float a = clamp(pa + ra + ca + ml * 0.16 * uUnder, 0.0, 0.85);
    vec3 lc = mix(pc, cream, clamp((ra + ca) * 3.0 + ml * 2.0 * (1.0 - deep), 0.0, 1.0));
    gl_FragColor = vec4(lc * a, a); // premultiplicado
    return;
  }
  vec3 asc = mix(mix(pal(0.0), gold, 0.55), mix(gold, cream, smoothstep(0.55, 1.0, uv.y)), smoothstep(0.0, 0.7, uv.y));
  asc += cream * rays * 0.15;
  col = mix(col, asc, uAscent);
  vec2 q = uv - 0.5;
  col *= 1.0 - dot(q, q) * (0.55 + d * 0.65) * (1.0 - uAscent * 0.6);
  col += (hash(uv * uRes + fract(t)) - 0.5) * 0.03;
  gl_FragColor = vec4(col, 1.0);
}
`;
