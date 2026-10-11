/**
 * Visor 3D de especies (React Three Fiber + drei).
 * Se carga de forma diferida (React.lazy) para que three.js solo se descargue cuando hace falta.
 */
import { Component, Suspense, useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { CameraControls, Environment, Float, Html, Lightformer, useAnimations, useGLTF, useProgress } from '@react-three/drei';
import { Box3, Vector3, type Group, type Mesh } from 'three';
import type { Content } from '../../../content/types';

export type ViewerAction = 'rotate_left' | 'rotate_right' | 'zoom_in' | 'zoom_out' | 'reset' | 'drag';

export interface SpeciesViewerProps {
  url: string;
  label: string;
  labels: Content['viewer'];
  /** interactive: web (arrastre + barra de controles). showcase: kiosco (gira solo, sin interacción). */
  mode: 'interactive' | 'showcase';
  /** Si es false se detiene el render (visor fuera de pantalla). */
  active?: boolean;
  onAction?: (action: ViewerAction) => void;
}

/** Lo que usamos de camera-controls (tipado mínimo para no depender de su tipo exportado). */
interface Controls {
  enabled: boolean;
  minDistance: number;
  maxDistance: number;
  smoothTime: number;
  mouseButtons: { left: number; middle: number; right: number; wheel: number };
  rotate(azimuth: number, polar: number, transition?: boolean): Promise<void>;
  dolly(distance: number, transition?: boolean): Promise<void>;
  reset(transition?: boolean): Promise<void>;
  saveState(): void;
  addEventListener(type: string, listener: () => void): void;
  removeEventListener(type: string, listener: () => void): void;
}

const IDLE_AFTER_INTERACTION_MS = 6000;

/* ---------- Modelo normalizado: centrado, escalado y de perfil ---------- */
function Model({ url, swim = false }: { url: string; swim?: boolean }) {
  const gltf = useGLTF(url);
  const group = useRef<Group>(null);
  const body = useRef<Group>(null);
  const turn = useRef({ y: 0, last: typeof window === 'undefined' ? 0 : window.scrollY });

  // Web: el pez nada en su sitio (cabeceo y balanceo lentos) y gira con el scroll.
  // Es independiente de la cámara, así que arrastrar para girarlo sigue funcionando.
  useFrame((state, delta) => {
    const b = body.current;
    if (!swim || !b) return;
    const sy = window.scrollY;
    const dy = sy - turn.current.last;
    turn.current.last = sy;
    if (Math.abs(dy) < 400) turn.current.y += dy * 0.0016;
    b.rotation.y += (turn.current.y - b.rotation.y) * Math.min(1, delta * 3);
    const t = state.clock.elapsedTime;
    b.rotation.z = Math.sin(t * 0.7) * 0.035;
    b.rotation.x = Math.sin(t * 0.45 + 1) * 0.025;
    b.position.y = Math.sin(t * 0.8) * 0.05;
  });
  const { actions, names } = useAnimations(gltf.animations, group);

  const fit = useMemo(() => {
    gltf.scene.updateMatrixWorld(true);
    const box = new Box3().setFromObject(gltf.scene);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const longest = Math.max(size.x, size.y, size.z) || 1;
    // Si el pez viene orientado a lo largo de Z, se gira 90° para empezar de perfil.
    const yaw = size.z > size.x * 1.15 ? Math.PI / 2 : 0;
    return { scale: 2.6 / longest, center, yaw };
  }, [gltf.scene]);

  useEffect(() => {
    gltf.scene.traverse((o) => {
      const mesh = o as Mesh;
      if (mesh.isMesh) mesh.frustumCulled = false;
    });
  }, [gltf.scene]);

  // Si el GLB trae animación (nado), se reproduce la primera.
  useEffect(() => {
    const first = names[0];
    const action = first ? actions[first] : undefined;
    action?.reset().fadeIn(0.6).play();
    return () => {
      action?.fadeOut(0.3);
    };
  }, [actions, names]);

  return (
    <group ref={body}>
      <group ref={group} scale={fit.scale} rotation={[0, fit.yaw, 0]}>
        <primitive object={gltf.scene} position={[-fit.center.x, -fit.center.y, -fit.center.z]} />
      </group>
    </group>
  );
}

/* ---------- Giro automático cuando nadie interactúa ---------- */
function AutoRotate({ controls, idleUntil, speed }: { controls: { current: Controls | null }; idleUntil: { current: number }; speed: number }) {
  useFrame((_, delta) => {
    const c = controls.current;
    if (!c || performance.now() < idleUntil.current) return;
    void c.rotate(delta * speed, 0, false);
  });
  return null;
}

function Loading({ text }: { text: (pct: number) => string }) {
  const { progress } = useProgress();
  return (
    <Html center>
      <p className="viewer-loading">{text(Math.round(progress))}</p>
    </Html>
  );
}

/* ---------- Límite de errores: si el GLB no carga, mensaje en lugar de pantalla rota ---------- */
class ViewerBoundary extends Component<{ fallback: ReactNode; resetKey: string; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn(
      `[visor 3D] No se pudo cargar el modelo (${this.props.resetKey}). Revisa que el archivo exista en public/models/.`,
      error,
    );
  }

  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.failed) this.setState({ failed: false });
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default function SpeciesViewer({ url, label, labels, mode, active = true, onAction }: SpeciesViewerProps) {
  const controls = useRef<Controls | null>(null);
  const idleUntil = useRef(0);
  const interactive = mode === 'interactive';

  const onActionRef = useRef(onAction);
  onActionRef.current = onAction;

  const pause = () => {
    idleUntil.current = performance.now() + IDLE_AFTER_INTERACTION_MS;
  };

  // Función estable (solo usa refs) para poder quitar el listener después.
  const onDragStart = useRef(() => {
    idleUntil.current = performance.now() + IDLE_AFTER_INTERACTION_MS;
    onActionRef.current?.('drag');
  }).current;

  // Los controles viven dentro del Canvas (otro árbol de React): se configuran al montarse.
  const bindControls = useCallback(
    (instance: unknown) => {
      const prev = controls.current;
      if (prev) prev.removeEventListener('controlstart', onDragStart);
      const c = instance as Controls | null;
      controls.current = c;
      if (!c) return;
      c.minDistance = 2.4;
      c.maxDistance = 7.5;
      c.smoothTime = 0.35;
      // La rueda no hace zoom (no roba el scroll de la página) y el clic derecho no desplaza.
      c.mouseButtons.wheel = 0;
      c.mouseButtons.right = 0;
      c.enabled = interactive;
      c.saveState();
      if (interactive) c.addEventListener('controlstart', onDragStart);
    },
    [interactive, onDragStart],
  );

  const act = (action: ViewerAction) => {
    const c = controls.current;
    if (!c) return;
    pause();
    onAction?.(action);
    if (action === 'rotate_left') void c.rotate(-Math.PI / 4, 0, true);
    if (action === 'rotate_right') void c.rotate(Math.PI / 4, 0, true);
    if (action === 'zoom_in') void c.dolly(0.7, true);
    if (action === 'zoom_out') void c.dolly(-0.7, true);
    if (action === 'reset') void c.reset(true);
  };

  const fallback = (
    <div className="viewer-empty" role="status">
      <p className="disp">{labels.unavailableTitle}</p>
      <p>{labels.unavailableBody}</p>
    </div>
  );

  const scene = (
    <Suspense fallback={<Loading text={labels.loading} />}>
      <Model url={url} swim={interactive} />
    </Suspense>
  );

  return (
    <div className={`viewer viewer--${mode}`}>
      <div className="viewer-canvas">
        <ViewerBoundary fallback={fallback} resetKey={url}>
          <Canvas
            frameloop={active ? 'always' : 'never'}
            dpr={[1, 2]}
            camera={{ position: [0, 0.35, 4.6], fov: 30, near: 0.05, far: 100 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            aria-label={labels.canvasLabel(label)}
            role="img"
          >
            {/* Luz submarina: cenital fría que se filtra desde la superficie, rebote turquesa y vientre en sombra. */}
            <hemisphereLight args={['#A9DDEB', '#04192A', 0.7]} />
            <directionalLight position={[1.5, 6, 2.5]} intensity={1.3} color="#C9EEF6" />
            <directionalLight position={[-4, 1.5, -3]} intensity={1.1} color="#6FE3D6" />
            <directionalLight position={[3, -2, 3]} intensity={0.22} color="#2A6F86" />
            <Environment resolution={256} frames={1}>
              <Lightformer form="rect" intensity={1.6} color="#CDEFF7" position={[0, 5, 1]} rotation={[Math.PI / 2, 0, 0]} scale={[10, 6, 1]} />
              <Lightformer form="rect" intensity={0.9} color="#6FE3D6" position={[-5, 1, -2]} rotation={[0, Math.PI / 2, 0]} scale={[6, 4, 1]} />
              <Lightformer form="rect" intensity={0.5} color="#1D5A78" position={[5, -1, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[6, 3, 1]} />
            </Environment>
            {interactive ? (
              scene
            ) : (
              <Float speed={1.1} rotationIntensity={0.18} floatIntensity={0.55}>
                {scene}
              </Float>
            )}
            <CameraControls ref={bindControls} makeDefault />
            <AutoRotate controls={controls} idleUntil={idleUntil} speed={interactive ? 0.14 : 0.24} />
          </Canvas>
        </ViewerBoundary>
        {interactive && <p className="viewer-hint">{labels.hint}</p>}
      </div>

      {interactive && (
        <div role="toolbar" aria-label={labels.toolbar} className="viewer-toolbar">
          <button type="button" aria-label={labels.rotateLeftAria} onClick={() => act('rotate_left')}>
            {labels.rotateLeft}
          </button>
          <button type="button" aria-label={labels.rotateRightAria} onClick={() => act('rotate_right')}>
            {labels.rotateRight}
          </button>
          <button type="button" onClick={() => act('zoom_in')}>
            {labels.zoomIn}
          </button>
          <button type="button" onClick={() => act('zoom_out')}>
            {labels.zoomOut}
          </button>
          <button type="button" className="muted" onClick={() => act('reset')}>
            {labels.reset}
          </button>
        </div>
      )}
    </div>
  );
}

/** Empieza a descargar el modelo antes de mostrarlo (el kiosco lo hace al arrancar). */
export const preloadSpeciesModel = (url: string) => useGLTF.preload(url);
