import { useEffect, useRef, type CSSProperties } from 'react';
import { OCEAN_FRAGMENT, OCEAN_VERTEX } from './oceanShader';
import type { Box, OceanTarget, PointerState } from './types';

interface OceanCanvasProps {
  target: Box<OceanTarget>;
  pointer: Box<PointerState>;
  /** true cuando un video real está sonando detrás: el shader pasa a capa de partículas. */
  overlay: Box<boolean>;
  /** Suavizado por cuadro hacia el objetivo (0–1). */
  ease?: number;
  /** Resolución interna fija (kiosco). Si no se da, se adapta al tamaño en pantalla. */
  resolution?: [number, number];
  className?: string;
  style?: CSSProperties;
}

const UNIFORMS = ['uRes', 'uTime', 'uDepth', 'uAscent', 'uFlow', 'uMouse', 'uMouseOn', 'uOverlay', 'uUnder'] as const;

export function OceanCanvas({ target, pointer, overlay, ease = 0.06, resolution, className, style }: OceanCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    let gl: WebGLRenderingContext | null = null;
    try {
      gl = cv.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: false });
    } catch {
      gl = null;
    }
    if (!gl) {
      cv.style.display = 'none';
      return;
    }

    const compile = (type: number, src: string) => {
      const s = gl!.createShader(type);
      if (!s) return null;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
        console.warn('[océano]', gl!.getShaderInfoLog(s));
        return null;
      }
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, OCEAN_VERTEX);
    const fs = compile(gl.FRAGMENT_SHADER, OCEAN_FRAGMENT);
    const program = gl.createProgram();
    if (!vs || !fs || !program) {
      cv.style.display = 'none';
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      cv.style.display = 'none';
      return;
    }
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const U = Object.fromEntries(UNIFORMS.map((n) => [n, gl!.getUniformLocation(program, n)])) as Record<
      (typeof UNIFORMS)[number],
      WebGLUniformLocation | null
    >;
    gl.clearColor(0, 0, 0, 0);

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const o = { depth: target.current.depth, ascent: target.current.ascent, under: target.current.under ?? 1, mx: 0.5, my: 0.5, mon: 0 };
    const t0 = performance.now();
    let raf = 0;

    const size = () => {
      let w: number;
      let h: number;
      if (resolution) {
        [w, h] = resolution;
      } else {
        const r = cv.getBoundingClientRect();
        w = Math.max(320, Math.min(1100, Math.round(r.width * 0.55)));
        h = Math.max(200, Math.min(900, Math.round(w * (r.height / Math.max(1, r.width)))));
      }
      if (cv.width !== w || cv.height !== h) {
        cv.width = w;
        cv.height = h;
      }
      gl!.viewport(0, 0, cv.width, cv.height);
    };

    const frame = () => {
      size();
      const tg = target.current;
      o.depth += (tg.depth - o.depth) * ease;
      o.ascent += (tg.ascent - o.ascent) * ease;
      o.under += ((tg.under ?? 1) - o.under) * 0.12;
      const pt = pointer.current;
      const on = pt.active && performance.now() - pt.seen < 2500;
      o.mon += ((on ? 1 : 0) - o.mon) * 0.05;
      o.mx += (pt.nx - o.mx) * 0.08;
      o.my += (1 - pt.ny - o.my) * 0.08;
      const time = reduce ? 4 : (performance.now() - t0) / 1000;
      gl!.uniform2f(U.uRes, cv.width, cv.height);
      gl!.uniform1f(U.uTime, time);
      gl!.uniform1f(U.uDepth, o.depth);
      gl!.uniform1f(U.uAscent, o.ascent);
      gl!.uniform1f(U.uFlow, o.depth * 42.0);
      gl!.uniform2f(U.uMouse, o.mx, o.my);
      gl!.uniform1f(U.uMouseOn, o.mon);
      gl!.uniform1f(U.uOverlay, overlay.current ? 1 : 0);
      gl!.uniform1f(U.uUnder, o.under);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => cancelAnimationFrame(raf);
    // Las cajas (target/pointer/overlay) son estables: solo se leen en cada cuadro.
  }, [ease, resolution?.[0], resolution?.[1]]);

  return <canvas ref={ref} aria-hidden="true" className={className} style={style} width={960} height={540} />;
}
