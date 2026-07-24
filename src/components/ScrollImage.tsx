import { useEffect, useRef } from "react";

/**
 * A photograph that moves as you scroll.
 *
 * Two things happen: the frame wipes open as it enters the viewport, and the
 * image inside drifts against the frame so it reads with depth rather than
 * sitting flat on the page.
 *
 * Note the two nested elements. The clip-path lives on the inner wrapper, never
 * on the element being observed — an element clipped to zero height reports zero
 * intersection area, so an IntersectionObserver watching it would never fire and
 * the photograph would stay hidden forever.
 *
 * Every instance shares one scroll listener and one rAF loop via the registry
 * below — a gallery of twenty images still costs exactly one handler.
 */

type Entry = { frame: HTMLElement; image: HTMLElement; strength: number };

const entries = new Set<Entry>();
let queued = 0;
let listening = false;

function measure() {
  queued = 0;
  const viewportHeight = window.innerHeight;
  entries.forEach(({ frame, image, strength }) => {
    const rect = frame.getBoundingClientRect();
    // Skip anything comfortably off screen.
    if (rect.bottom < -200 || rect.top > viewportHeight + 200) return;
    const centre = rect.top + rect.height / 2;
    // -1 when the frame sits below the fold, +1 when it has risen above it.
    const p = (viewportHeight / 2 - centre) / (viewportHeight / 2 + rect.height / 2);
    image.style.setProperty("--p", (p * strength).toFixed(4));
  });
}

function schedule() {
  if (!queued) queued = requestAnimationFrame(measure);
}

function register(entry: Entry) {
  entries.add(entry);
  if (!listening) {
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    listening = true;
  }
  schedule();
  return () => {
    entries.delete(entry);
    if (entries.size === 0 && listening) {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      listening = false;
      if (queued) cancelAnimationFrame(queued);
      queued = 0;
    }
  };
}

export function ScrollImage({
  src,
  alt,
  aspect = "aspect-[4/3]",
  className = "",
  strength = 1,
  priority = false,
  sizes,
  fill = false,
}: {
  src: string;
  alt: string;
  /** Ignored when `fill` is set. */
  aspect?: string;
  className?: string;
  /** 0 disables the drift; 1 is the default travel. */
  strength?: number;
  priority?: boolean;
  sizes?: string;
  /** Stretch to a positioned parent instead of holding its own aspect ratio. */
  fill?: boolean;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const image = imageRef.current;
    if (!frame || !image) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      frame.classList.add("is-open");
      return;
    }

    // Wipe the frame open the first time it appears.
    let io: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            frame.classList.add("is-open");
            io?.disconnect();
          }
        },
        { threshold: 0.1, rootMargin: "0px 0px -5% 0px" },
      );
      io.observe(frame);
    } else {
      frame.classList.add("is-open");
    }

    const unregister = register({ frame, image, strength });
    return () => {
      io?.disconnect();
      unregister();
    };
  }, [strength]);

  // Position is chosen here rather than passed in, so a caller's className can
  // never collide with `relative`/`absolute` and win on stylesheet order.
  const position = fill ? "absolute inset-0" : `relative ${aspect}`;

  return (
    <div ref={frameRef} className={`scroll-frame ${position} ${className}`}>
      <div className="scroll-clip absolute inset-0 overflow-hidden">
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          sizes={sizes}
          className="scroll-frame-img absolute inset-x-0 w-full object-cover"
        />
      </div>
    </div>
  );
}
