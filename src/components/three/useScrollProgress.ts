import { useEffect, useRef, useState, type RefObject } from "react";

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

/**
 * Tracks how far a tall section has been scrolled through, 0 → 1.
 *
 * The value is written to a ref rather than state so that scrolling never
 * re-renders React — the 3D scene reads it inside useFrame. `stepCount` is the
 * one thing that does surface as state, and only when the active caption
 * changes, so the overlay re-renders a handful of times per scroll-through.
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>, stepCount = 0) {
  const progress = useRef(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;

    const measure = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      // The section is pinned while it travels its own height past the viewport.
      const travel = rect.height - window.innerHeight;
      const p = travel <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / travel));
      progress.current = p;

      if (stepCount > 0) {
        const next = Math.min(stepCount - 1, Math.floor(p * stepCount));
        setStep((current) => (current === next ? current : next));
      }
    };

    const onScroll = () => {
      // Coalesce to one measurement per frame; scroll fires far more often.
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref, stepCount]);

  return { progress, step };
}

/**
 * Progress through the first viewport of the page, 0 at the top and 1 once a
 * full screen has been scrolled. Written to a ref so the hero can read it inside
 * useFrame without re-rendering React on every scroll event.
 */
export function usePageScroll() {
  const progress = useRef(0);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      progress.current = Math.min(1, Math.max(0, window.scrollY / window.innerHeight));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return progress;
}

/** WebGL can be absent or blocked; check once rather than letting a canvas throw. */
export function useWebGLSupport() {
  const [supported, setSupported] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      setSupported(Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl")));
    } catch {
      setSupported(false);
    }
  }, []);
  return supported;
}

/** True while the element is anywhere near the viewport — used to pause rendering. */
export function useInView(ref: RefObject<HTMLElement | null>, rootMargin = "200px") {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);

  return inView;
}
