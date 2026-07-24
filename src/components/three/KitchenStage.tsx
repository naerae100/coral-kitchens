import { Suspense, lazy, useEffect, useRef, useState, type RefObject } from "react";

import { useInView, usePrefersReducedMotion, useWebGLSupport } from "./useScrollProgress";

const HeroScene = lazy(() => import("./HeroScene"));

/**
 * The interactive 3D kitchen, in whatever section wants it.
 *
 * Falls back to a still photograph where WebGL is missing or the visitor has
 * asked for reduced motion. The photograph is painted first either way, so the
 * panel is never empty while three.js loads — the canvas fades in over it.
 */
export function KitchenStage({
  progress,
  focus,
  fallbackSrc,
  fallbackAlt,
}: {
  /** 0–1 through the owning section; drives the camera dolly. */
  progress: RefObject<number>;
  /** Index of the service being described. */
  focus: number;
  fallbackSrc: string;
  fallbackAlt: string;
}) {
  const reduced = usePrefersReducedMotion();
  const webgl = useWebGLSupport();
  const hostRef = useRef<HTMLDivElement>(null);
  const inView = useInView(hostRef, "120px");

  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [explored, setExplored] = useState(false);
  useEffect(() => setMounted(true), []);

  const use3D = mounted && webgl === true && !reduced;

  return (
    <div ref={hostRef} className="absolute inset-0 overflow-hidden bg-[#191614]">
      <img
        src={fallbackSrc}
        alt={fallbackAlt}
        loading="lazy"
        decoding="async"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
          use3D && ready ? "opacity-0" : "opacity-100"
        }`}
      />

      {use3D && (
        <Suspense fallback={null}>
          <div className="absolute inset-0">
            <SceneReady onReady={() => setReady(true)}>
              <HeroScene
                scroll={progress}
                reduced={reduced}
                paused={!inView}
                focus={focus}
                onFirstDrag={() => setExplored(true)}
              />
            </SceneReady>
          </div>
        </Suspense>
      )}

      {/* Affordance. Nobody drags a picture, so the panel has to say it is not
          one. Fades once the visitor has actually moved the camera. */}
      {use3D && ready && (
        <div
          className={`pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2.5 whitespace-nowrap rounded-full border border-white/15 bg-black/55 px-3.5 py-1.5 backdrop-blur-sm transition-opacity duration-700 ${
            explored ? "opacity-0" : "opacity-100"
          }`}
        >
          <span className="text-[9px] uppercase tracking-[0.2em] text-white/80">Drag to look</span>
          <span className="h-3 w-px bg-white/25" />
          <span className="text-[9px] uppercase tracking-[0.2em] text-white/80">Open a drawer</span>
        </div>
      )}
    </div>
  );
}

/** Waits a frame after the lazy chunk resolves so the first render is painted. */
function SceneReady({ children, onReady }: { children: React.ReactNode; onReady: () => void }) {
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(onReady));
    return () => cancelAnimationFrame(id);
  }, [onReady]);
  return <>{children}</>;
}
