import { useEffect, useRef, useState } from "react";
import { Menu, Phone, X } from "lucide-react";

import { site } from "@/config/site";
import { Logo } from "@/components/Logo";

const LINKS = [
  { href: "#services", label: "Services" },
  { href: "#work", label: "Work" },
  { href: "#process", label: "Process" },
  { href: "#about", label: "Workshop" },
  { href: "#faq", label: "Questions" },
  { href: "#contact", label: "Contact" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Transparent over the hero photograph, solid once past it.
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      setScrolled(window.scrollY > 32);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Highlight whichever section is occupying the middle of the screen.
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const sections = LINKS.map((link) => document.querySelector(link.href)).filter(
      (el): el is Element => Boolean(el),
    );
    const io = new IntersectionObserver(
      (observed) => {
        const visible = observed
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(`#${visible.target.id}`);
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    sections.forEach((section) => io.observe(section));
    return () => io.disconnect();
  }, []);

  // While the mobile sheet is open: lock the page, close on Escape, move focus in.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      {/*
       * The header always carries the paper background. The hero is split — dark
       * render on one side, paper on the other — so a transparent bar left half
       * the navigation as near-black text sitting on a near-black wall.
       */}
      <header
        className={`fixed top-0 inset-x-0 z-50 bg-background/90 backdrop-blur-xl transition-colors duration-300 ${
          scrolled || open ? "border-b border-border" : "border-b border-transparent"
        }`}
      >
        <div className="max-w-[1600px] mx-auto flex items-center justify-between px-6 md:px-12 lg:px-20 py-5">
          <a href="#top" aria-label={`${site.name} — home`}>
            <Logo />
          </a>

          <nav aria-label="Primary" className="hidden lg:flex items-center gap-9">
            {LINKS.slice(0, 5).map((link) => (
              <a
                key={link.href}
                href={link.href}
                aria-current={active === link.href ? "true" : undefined}
                className={`text-[11px] uppercase tracking-[0.22em] transition-colors hover:text-foreground ${
                  active === link.href ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={site.phoneHref}
              className="hidden sm:inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground transition-colors"
            >
              <Phone className="w-3.5 h-3.5" strokeWidth={1.5} />
              {site.phoneDisplay}
            </a>
            <a
              href="#contact"
              className="hidden sm:inline-block bg-foreground text-background px-5 py-2.5 text-[11px] uppercase tracking-[0.22em] font-medium transition-colors hover:bg-accent"
            >
              Get a quote
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="lg:hidden -mr-2 p-2"
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sheet — the desktop nav is display:none below lg, so without this
          there is no navigation at all on a phone. */}
      <div
        id="mobile-menu"
        hidden={!open}
        className="lg:hidden fixed inset-0 z-[60] bg-background flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <Logo />
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="-mr-2 p-2"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <nav aria-label="Mobile" className="flex-1 flex flex-col justify-center px-8">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-4xl sm:text-5xl font-medium tracking-tight py-4 border-b border-border transition-colors hover:text-accent"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="px-8 pb-10 flex flex-col gap-3">
          <a href={site.phoneHref} className="text-lg hover:text-accent transition-colors">
            {site.phoneDisplay}
          </a>
          <a
            href={`mailto:${site.email}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors break-all"
          >
            {site.email}
          </a>
        </div>
      </div>
    </>
  );
}
