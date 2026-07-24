import { useEffect, useRef, useState } from "react";

export type WorkItem = {
  src: string;
  title: string;
  tag: string;
  /** Intrinsic size, so the track has its full width before the images decode. */
  w: number;
  h: number;
};

/**
 * The work gallery as a pinned filmstrip: the section holds still while vertical
 * scroll pans the photographs sideways.
 *
 * A grid was the wrong container for this set. The photographs are a mix of
 * portrait and landscape, so a grid either crops them hard or leaves ragged
 * gaps. Laid out at one uniform height with their natural widths, every frame
 * keeps its own proportions and the row still reads as a single line.
 *
 * Below lg it degrades to a native scroll-snap carousel — pinning fights touch
 * scrolling, and a phone has no room for the effect anyway.
 */
export function WorkGallery({ items }: { items: WorkItem[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const distance = useRef(0);

  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPinned(query.matches && !reduced.matches);
    update();
    query.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      query.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    if (!pinned) {
      section.style.height = "";
      track.style.transform = "";
      return;
    }

    let frame = 0;

    // Give the section exactly as much extra scroll as the track has overflow,
    // so one pixel of scrolling pans one pixel sideways.
    const layout = () => {
      distance.current = Math.max(0, track.scrollWidth - window.innerWidth);
      section.style.height = `${window.innerHeight + distance.current}px`;
    };

    const measure = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const p = travel <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / travel));
      track.style.transform = `translate3d(${-distance.current * p}px, 0, 0)`;
      barRef.current?.style.setProperty("--progress", p.toFixed(4));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const onResize = () => {
      layout();
      onScroll();
    };

    layout();
    measure();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    // Images decoding late changes the track width, so re-measure when they land.
    const images = Array.from(track.querySelectorAll("img"));
    images.forEach((img) => img.addEventListener("load", onResize));

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      images.forEach((img) => img.removeEventListener("load", onResize));
      section.style.height = "";
      track.style.transform = "";
    };
  }, [pinned]);

  return (
    <section id="work" ref={sectionRef} className="relative bg-card">
      <div className={pinned ? "sticky top-0 h-screen overflow-hidden flex flex-col" : ""}>
        <div className="px-6 md:px-12 lg:px-20 pt-20 lg:pt-28 pb-10 shrink-0">
          <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="block h-px w-10 bg-accent" />
                <span className="eyebrow">Recent work</span>
              </div>
              <h2 className="mt-5 text-[clamp(2rem,4.2vw,3.4rem)]">
                Built in Smithfield,{" "}
                <span className="serif-italic text-accent">fitted across Sydney</span>.
              </h2>
            </div>
            <p className="text-muted-foreground max-w-sm leading-relaxed">
              Designed, manufactured and installed in-house.{" "}
              <span className="hidden lg:inline">Keep scrolling to move through them.</span>
            </p>
          </div>
        </div>

        <div className={pinned ? "flex-1 min-h-0 flex items-center" : ""}>
          <div
            ref={trackRef}
            className={
              pinned
                ? "flex gap-6 xl:gap-10 px-6 md:px-12 lg:px-20 will-change-transform"
                : "flex gap-4 md:gap-6 px-6 md:px-12 overflow-x-auto snap-x snap-mandatory pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            }
          >
            {items.map((item, i) => (
              <figure
                key={item.src}
                className={`shrink-0 ${pinned ? "" : "snap-center w-[82vw] sm:w-[58vw] md:w-[44vw]"}`}
              >
                <div className="overflow-hidden bg-background">
                  <img
                    src={item.src}
                    alt={`${item.title} — ${item.tag}`}
                    width={item.w}
                    height={item.h}
                    loading={i < 2 ? "eager" : "lazy"}
                    decoding="async"
                    className={
                      pinned
                        ? "h-[52vh] w-auto max-w-none object-cover transition-transform duration-[1400ms] hover:scale-[1.03]"
                        : "aspect-[4/3] w-full object-cover"
                    }
                  />
                </div>
                <figcaption className="mt-4 flex items-baseline gap-3">
                  <span className="text-accent tabular-nums text-sm">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block font-medium tracking-tight">{item.title}</span>
                    <span className="block text-sm text-muted-foreground mt-0.5">{item.tag}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        {pinned && (
          <div className="px-6 md:px-12 lg:px-20 pb-10 shrink-0">
            <div className="max-w-[1600px] mx-auto h-px bg-border" aria-hidden="true">
              <div
                ref={barRef}
                className="h-px bg-accent origin-left"
                style={{ transform: "scaleX(var(--progress, 0))" }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
