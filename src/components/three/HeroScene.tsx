import { useEffect, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";

import { KitchenModel } from "./KitchenModel";

/**
 * Hero scene: the kitchen model, lit as a showroom display and flown by scroll.
 *
 * Deliberately a dark set. The kitchen is white on white in real life, and
 * rendering it inside a white room left nothing to see — every surface landed
 * within a few percent of every other. Against charcoal the joinery has edges.
 */

const BACKDROP = "#191614";

/** Where the camera orbits: roughly the middle of the island. */
const ORBIT_CENTRE = new THREE.Vector3(0, 0.86, 0.1);
const MAX_AZIMUTH = 0.62; // ~35°, past which the set runs out of wall

function CameraRig({
  scroll,
  reduced,
  onFirstDrag,
}: {
  scroll: RefObject<number>;
  reduced: boolean;
  onFirstDrag: () => void;
}) {
  const { camera, size, gl } = useThree();
  const eased = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const target = useRef(new THREE.Vector3());

  // Where the visitor has dragged to, and the damped value actually rendered.
  const azimuth = useRef(0);
  const easedAzimuth = useRef(0);

  useEffect(() => {
    const el = gl.domElement;
    let dragging = false;
    let lastX = 0;
    let moved = 0;

    const onDown = (event: PointerEvent) => {
      dragging = true;
      moved = 0;
      lastX = event.clientX;
      el.setPointerCapture(event.pointerId);
    };

    const onMove = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = event.clientX - lastX;
      lastX = event.clientX;
      moved += Math.abs(dx);
      azimuth.current = THREE.MathUtils.clamp(
        azimuth.current - dx * 0.005,
        -MAX_AZIMUTH,
        MAX_AZIMUTH,
      );
      if (moved > 12) onFirstDrag();
    };

    const onUp = (event: PointerEvent) => {
      dragging = false;
      if (el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId);
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, [gl, onFirstDrag]);

  useFrame((state, delta) => {
    const p = reduced ? 0 : scroll.current;
    eased.current = THREE.MathUtils.damp(eased.current, p, 3.2, delta);
    const t = eased.current;

    // Narrower stages need the camera further back to keep the island in frame.
    const pullback = size.width < 560 ? 1.7 : size.width < 780 ? 1.0 : size.width < 1100 ? 0.4 : 0;

    pointer.current.x = THREE.MathUtils.damp(pointer.current.x, state.pointer.x, 2.4, delta);
    pointer.current.y = THREE.MathUtils.damp(pointer.current.y, state.pointer.y, 2.4, delta);
    easedAzimuth.current = THREE.MathUtils.damp(easedAzimuth.current, azimuth.current, 5, delta);

    // True orbit, so dragging swings around the island rather than sliding past it.
    const radius = 4.45 + pullback - t * 0.7;
    const angle = easedAzimuth.current + t * 0.2 + pointer.current.x * 0.05;

    camera.position.set(
      ORBIT_CENTRE.x + Math.sin(angle) * radius,
      1.62 - t * 0.18 + pointer.current.y * 0.1,
      ORBIT_CENTRE.z + Math.cos(angle) * radius,
    );
    target.current.set(ORBIT_CENTRE.x, ORBIT_CENTRE.y + 0.02 - t * 0.02, ORBIT_CENTRE.z - 0.7);
    camera.lookAt(target.current);
  });

  return null;
}

/**
 * Showroom lighting: a strong top key, a cool rim to separate the joinery from
 * the dark wall behind it, and the sconces doing the warm work.
 */
function Lighting() {
  return (
    <>
      <ambientLight intensity={0.22} />

      <directionalLight
        position={[0.9, 5.4, 2.6]}
        intensity={2.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-radius={4}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-far={16}
        shadow-bias={-0.0004}
      />

      {/* Rim from behind-left, so the island reads as an edge against the wall */}
      <directionalLight position={[-4.5, 2.2, -2]} intensity={0.9} color="#cfd8e0" />
      {/* Low front fill, just enough to keep the shaker frames from going flat */}
      <directionalLight position={[-1.5, 1.4, 5]} intensity={0.4} />

      <Environment resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={1.5}
          position={[-0.9, 4, -1]}
          scale={[2.4, 1.5, 1]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={1.5}
          position={[0.9, 4, -1]}
          scale={[2.4, 1.5, 1]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        {/* Kept low: a broad front fill here would wash the set back to flat. */}
        <Lightformer
          form="rect"
          intensity={0.5}
          position={[0, 2, 6]}
          scale={[10, 6, 1]}
          rotation={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={0.9}
          color="#dce6ee"
          position={[-6, 1.8, 0]}
          scale={[6, 4, 1]}
          rotation={[0, Math.PI / 2, 0]}
        />
      </Environment>
    </>
  );
}

export default function HeroScene({
  scroll,
  reduced,
  paused,
  onFirstDrag,
  focus = 0,
}: {
  scroll: RefObject<number>;
  reduced: boolean;
  paused: boolean;
  onFirstDrag: () => void;
  /** Index of the service being described, which drives what the model shows. */
  focus?: number;
}) {
  return (
    <Canvas
      shadows="soft"
      dpr={[1, 1.8]}
      frameloop={paused ? "never" : "always"}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 1.62, 4.5], fov: 42 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
      style={{ touchAction: "pan-y", cursor: "grab" }}
    >
      <color attach="background" args={[BACKDROP]} />
      {/* Fades the far floor into the backdrop instead of ending on a hard edge. */}
      <fog attach="fog" args={[BACKDROP, 6.5, 17]} />
      <Lighting />
      <KitchenModel focus={focus} />
      <CameraRig scroll={scroll} reduced={reduced} onFirstDrag={onFirstDrag} />
    </Canvas>
  );
}
