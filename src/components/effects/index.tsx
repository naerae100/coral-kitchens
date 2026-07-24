import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Small interaction primitives shared across the page.
 *
 * All of them are ref-and-CSS-variable driven rather than state driven: scroll
 * and pointer movement fire far more often than React should re-render, so the
 * values are written straight to the DOM inside a rAF.
 */

const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Thin coral rule across the top of the viewport showing reading position. */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / max));
      bar.current?.style.setProperty("--progress", p.toFixed(4));
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

  return (
    <div className="progress-rail" aria-hidden="true">
      <div ref={bar} className="progress-bar" />
    </div>
  );
}

/**
 * Headline that rises line by line from behind a mask.
 *
 * Lines are passed explicitly rather than measured, so the break points are a
 * design decision and never depend on where the browser happens to wrap.
 */
export function RevealLines({
  lines,
  className = "",
  as: Tag = "h2",
  stagger = 90,
}: {
  lines: ReactNode[];
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "div";
  stagger?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReduced() || !("IntersectionObserver" in window)) {
      el.classList.add("is-visible");
      return;
    }
    // Already above the fold on load (deep link, restored scroll): show at once.
    if (el.getBoundingClientRect().top < window.innerHeight) {
      el.classList.add("is-visible");
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref as never} className={`reveal-lines ${className}`}>
      {lines.map((line, i) => (
        <span key={i} className="reveal-line">
          <span style={{ ["--delay" as string]: `${i * stagger}ms` }}>{line}</span>
        </span>
      ))}
    </Tag>
  );
}

/**
 * Pulls gently toward the cursor while it is nearby, then springs back.
 * Renders whatever element you pass so it works for both links and buttons.
 */
export function Magnetic({
  children,
  className = "",
  radius = 90,
  strength = 0.28,
}: {
  children: ReactNode;
  className?: string;
  radius?: number;
  strength?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    // Coarse pointers have no hover, and the effect would fight with taps.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let frame = 0;
    let target = { x: 0, y: 0 };

    const apply = () => {
      frame = 0;
      el.style.setProperty("--mx", `${target.x.toFixed(2)}px`);
      el.style.setProperty("--my", `${target.y.toFixed(2)}px`);
    };

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = event.clientX - cx;
      const dy = event.clientY - cy;
      const distance = Math.hypot(dx, dy);
      const reach = Math.max(rect.width, rect.height) / 2 + radius;

      if (distance < reach) {
        const falloff = 1 - distance / reach;
        target = { x: dx * strength * falloff, y: dy * strength * falloff };
        el.classList.add("is-pulled");
      } else {
        if (target.x === 0 && target.y === 0) return;
        target = { x: 0, y: 0 };
        el.classList.remove("is-pulled");
      }
      if (!frame) frame = requestAnimationFrame(apply);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, [radius, strength]);

  return (
    <span ref={ref} className={`magnetic inline-flex ${className}`}>
      {children}
    </span>
  );
}

/** Counts up to `value` the first time it scrolls into view. */
export function Counter({
  value,
  suffix = "",
  duration = 1600,
  className = "",
}: {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReduced() || !("IntersectionObserver" in window)) {
      setDisplay(value);
      return;
    }

    let raf = 0;
    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        // Ease out so the number decelerates into its final value.
        setDisplay(Math.round(value * (1 - Math.pow(1 - t, 3))));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  );
}
