import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Clock, Mail, MapPin, Phone } from "lucide-react";

import { SiteNav } from "@/components/SiteNav";
import { Logo } from "@/components/Logo";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { EnquiryForm } from "@/components/EnquiryForm";
import { ScrollImage } from "@/components/ScrollImage";
import { WorkGallery, type WorkItem } from "@/components/WorkGallery";
import { KitchenStage } from "@/components/three/KitchenStage";
import { useScrollProgress } from "@/components/three/useScrollProgress";
import { Counter, Magnetic, RevealLines, ScrollProgress } from "@/components/effects";
import { SERVICES, addressLine, businessJsonLd, mapsUrl, site } from "@/config/site";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * Photographs are Coral Kitchens' own, served from /public/kitchens.
 * Captions describe only what is visible in each frame — no invented locations,
 * clients or dates.
 */
const HERO_IMAGE = "/kitchens/kitchen-5.jpg";

const WORK: WorkItem[] = [
  {
    src: "/kitchens/kitchen-1.jpg",
    title: "Matte black, stone island",
    tag: "Waterfall stone island · integrated appliances · plinth lighting",
    w: 1600,
    h: 1200,
  },
  {
    src: "/kitchens/kitchen-6.jpg",
    title: "Full-height stone splashback",
    tag: "Handleless drawer bank · bookmatched stone · concealed LED",
    w: 1600,
    h: 1200,
  },
  {
    src: "/kitchens/kitchen-5.jpg",
    title: "Shaker profile in white",
    tag: "Curved island returns · stone splashback · oak flooring",
    w: 1600,
    h: 1067,
  },
  {
    src: "/kitchens/kitchen-4.jpg",
    title: "Gloss and woodgrain",
    tag: "Gloss overheads · woodgrain base · waterfall island",
    w: 1600,
    h: 1200,
  },
  {
    src: "/kitchens/kitchen-2.jpg",
    title: "Full-height appliance wall",
    tag: "Floor-to-ceiling matte black · handleless finger pull",
    w: 1200,
    h: 1600,
  },
  {
    src: "/kitchens/kitchen-3.jpg",
    title: "Integrated fridge and pantry",
    tag: "Appliances concealed behind matched fronts",
    w: 1200,
    h: 1600,
  },
];

const FAQS = [
  {
    q: "What does a custom kitchen cost?",
    a: "Every kitchen is priced from its own drawings, because the cabinetry, the stone and the appliances all move the number independently. Tell us roughly what you have in mind and we will give you a realistic range early — then a fixed price once the design is signed off, not a moving estimate.",
  },
  {
    q: "How long does it take?",
    a: "It depends on the size of the job and on stone availability, so we will not quote you a number here that we might not hit. What we will do is commit to dates in writing once the design is approved, and tell you straight away if anything moves.",
  },
  {
    q: "Can I buy panels or doors without a whole kitchen?",
    a: "Yes. Cut-to-size panels and custom door profiles are a service in their own right. Builders, cabinetmakers and homeowners all order from us — whether that is a single replacement run of fronts or a full set of components for a project.",
  },
  {
    q: "Do you take on commercial work?",
    a: "We do. Alongside residential kitchens we manufacture precision joinery for commercial and shopfit projects — reception counters, cabinetry and fitted storage.",
  },
  {
    q: "Is the work guaranteed?",
    a: `Everything we supply carries a ${site.warrantyMonths}-month warranty. Because we manufacture and install with our own team, there is no argument about whose responsibility a problem is — it is ours.`,
  },
  {
    q: "Do you make anything besides kitchens?",
    a: "Yes — wardrobes, laundries, butler's pantries, vanities and entertainment units. If it can be drawn and measured, we can manufacture it.",
  },
];

const PROCESS = [
  {
    n: "01",
    title: "Measure and talk",
    body: "We come to the site, measure properly, and ask how you actually use the space — where you prep, what never gets reached, what the current kitchen gets wrong.",
  },
  {
    n: "02",
    title: "Design and fixed price",
    body: "You get drawings and a fixed price before a single panel is cut. Changes happen on paper, where they cost nothing.",
  },
  {
    n: "03",
    title: "Manufacture in Smithfield",
    body: "Your cabinetry is cut, edged and assembled in our own workshop. Nothing is outsourced to a third party we cannot stand over.",
  },
  {
    n: "04",
    title: "Install and hand over",
    body: "The people who built it fit it, and we coordinate the licensed trades that connect it. You get one point of contact from first measure to final handle.",
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${site.name} — ${site.tagline}` },
      { name: "description", content: site.description },
      { property: "og:title", content: `${site.name} — ${site.tagline}` },
      { property: "og:description", content: site.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: site.url },
      { property: "og:image", content: `${site.url}${HERO_IMAGE}` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${site.url}${HERO_IMAGE}` },
    ],
    links: [
      { rel: "canonical", href: site.url },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Instrument+Serif:ital@0;1&display=swap",
      },
      { rel: "preload", as: "image", href: HERO_IMAGE, fetchPriority: "high" },
    ],
  }),
  component: HomePage,
});

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
    );

    els.forEach((el) => {
      // Deep links and restored scroll positions land partway down the page.
      // Anything at or above the fold has already "happened" — reveal it now.
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add("is-visible");
        return;
      }
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);
}

function StructuredData() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      businessJsonLd(WORK.map((w) => w.src)),
      {
        "@type": "FAQPage",
        mainEntity: FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      // Static, developer-authored content — no user input reaches this string.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="block h-px w-10 bg-accent" />
      <span className="eyebrow">{children}</span>
    </div>
  );
}

function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Magnetic>
      <a
        href={href}
        className="group inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 text-[11px] uppercase tracking-[0.22em] font-medium transition-colors hover:bg-accent"
      >
        {children}
        <ArrowRight
          className="w-4 h-4 transition-transform group-hover:translate-x-1"
          strokeWidth={1.5}
        />
      </a>
    </Magnetic>
  );
}

function HomePage() {
  useReveal();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <StructuredData />
      <ScrollProgress />
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteNav />
      <main id="main">
        <Hero />
        <Marquee />
        <Stats />
        <Services />
        <WorkGallery items={WORK} />
        <Process />
        <Trade />
        <About />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

function Hero() {
  return (
    <section
      id="top"
      className="relative lg:grid lg:grid-cols-12 lg:items-stretch lg:min-h-[100svh]"
    >
      {/*
       * Split, not stacked. Running the headline across the render meant the two
       * fought each other and neither read: the kitchen sat behind the text and
       * the text sat on a busy, near-white background. Now they each get a half.
       */}
      <div className="relative order-1 lg:order-2 lg:col-span-6 xl:col-span-7 h-[48svh] lg:h-auto overflow-hidden bg-card">
        {/* A photograph of real work, not a render. The 3D lives in Services,
            where it is explaining something rather than decorating. */}
        <img
          src={HERO_IMAGE}
          alt="A white shaker kitchen with a curved-end island, built by Coral Kitchens"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover animate-hero-drift"
        />
        {/* Softens only the horizontal seam on mobile; a crisp vertical join reads
            better than a gradient smeared down the edge. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/50 to-transparent lg:hidden" />
      </div>

      <div className="order-2 lg:order-1 lg:col-span-6 xl:col-span-5 flex items-center px-6 md:px-12 lg:pl-20 lg:pr-12 py-14 lg:py-28">
        <div className="w-full">
          <div className="animate-fade-in">
            <SectionLabel>{site.address.suburb}, Western Sydney</SectionLabel>
          </div>

          <RevealLines
            as="h1"
            className="mt-7 text-[clamp(2.4rem,4.4vw,4.25rem)] font-medium"
            lines={[
              <>Cut, built</>,
              <>and installed by</>,
              <>
                the <span className="serif-italic text-accent">same hands</span>.
              </>,
            ]}
          />

          <p
            className="mt-8 max-w-md text-lg text-muted-foreground leading-relaxed animate-fade-up"
            style={{ animationDelay: "0.4s" }}
          >
            {site.name} designs, manufactures and installs custom kitchens from our own workshop in{" "}
            {site.address.suburb} — plus cut-to-size panels and custom door profiles for trade and
            home.
          </p>

          <div
            className="mt-10 flex flex-wrap items-center gap-4 animate-fade-up"
            style={{ animationDelay: "0.5s" }}
          >
            <PrimaryLink href="#contact">Get a quote</PrimaryLink>
            <Magnetic>
              <a
                href="#work"
                className="inline-flex items-center gap-3 border border-foreground/25 px-8 py-4 text-[11px] uppercase tracking-[0.22em] transition-colors hover:border-foreground"
              >
                See our work
              </a>
            </Magnetic>
          </div>

          <div className="mt-12 flex flex-wrap gap-x-10 gap-y-3 text-sm text-muted-foreground">
            <span>{site.warrantyMonths}-month warranty</span>
            <span className="hidden sm:inline text-accent">/</span>
            <span>Own {site.address.suburb} workshop</span>
            <span className="hidden sm:inline text-accent">/</span>
            <span>Residential &amp; commercial</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items: string[] = [
    ...SERVICES.map((s) => s.short),
    "Wardrobes",
    "Butler's pantries",
    "Vanities",
    "Shopfit joinery",
  ];
  const loop = [...items, ...items];
  return (
    <section className="border-y border-border py-6 overflow-hidden bg-card" aria-hidden="true">
      <div className="flex gap-10 animate-marquee whitespace-nowrap w-max">
        {loop.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-10 shrink-0 text-sm uppercase tracking-[0.2em] text-muted-foreground"
          >
            {item}
            <span className="text-accent">✳</span>
          </span>
        ))}
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="px-6 md:px-12 lg:px-20 py-14 md:py-24">
      {/*
       * Two up on a phone, four across from lg. Stacked one-per-row the numerals
       * were enormous and each stat sat alone on half a screen, which read as
       * broken rather than airy.
       */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 md:gap-10 lg:gap-6">
        {[
          { value: site.warrantyMonths, suffix: "mo", label: "Warranty on everything we supply" },
          { value: 4, label: "Service lines, from a full kitchen to a single cut panel" },
          { value: 1, label: "Team from first measure to final handle — nothing subcontracted" },
          {
            value: 100,
            suffix: "%",
            label: `Manufactured in our own ${site.address.suburb} workshop`,
          },
        ].map((stat) => (
          <div key={stat.label} className="reveal">
            <div className="text-[2.5rem] leading-none md:text-5xl lg:text-6xl font-medium tracking-tight">
              <Counter value={stat.value} />
              {stat.suffix && <span className="text-accent">{stat.suffix}</span>}
            </div>
            <div className="mt-3 h-px w-8 bg-accent" />
            <p className="mt-3 text-[13px] md:text-sm text-muted-foreground leading-relaxed max-w-[24ch]">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Services() {
  const [active, setActive] = useState(0);
  const service = SERVICES[active];

  return (
    <section id="services" className="px-6 md:px-12 lg:px-20 py-20 md:py-32">
      <div className="max-w-[1600px] mx-auto">
        <div className="max-w-3xl">
          <SectionLabel>What we do</SectionLabel>
          <RevealLines
            className="mt-6 text-[clamp(2rem,4.6vw,3.9rem)]"
            lines={[
              <>Four things,</>,
              <>
                <span className="serif-italic text-accent">done properly</span>.
              </>,
            ]}
          />
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed reveal">
            We are a manufacturer first. The cabinetry in your home was cut and assembled by the
            same business that measured it and fitted it.
          </p>
        </div>

        {/*
         * Pick a service rather than scroll past it. This used to be a
         * scroll-tracked list beside a photograph; now the visitor drives it, and
         * the panel is carried by type and motion rather than an image that said
         * nothing about the service sitting next to it.
         */}
        <div className="mt-14 grid lg:grid-cols-12 gap-10 xl:gap-16 reveal">
          <div className="lg:col-span-4 min-w-0">
            {/* Chips on a phone, a numbered rail from lg. */}
            <div
              role="tablist"
              aria-label="Services"
              className="flex lg:flex-col gap-2 lg:gap-0 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {SERVICES.map((item, i) => {
                const isActive = i === active;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls="service-panel"
                    onClick={() => setActive(i)}
                    className={`group shrink-0 lg:w-full text-left transition-colors lg:border-t lg:border-border ${
                      isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-3 whitespace-nowrap rounded-full border border-border px-4 py-2 lg:rounded-none lg:border-0 lg:px-0 lg:py-5">
                      <span
                        className={`text-[11px] tabular-nums tracking-[0.18em] transition-colors ${
                          isActive ? "text-accent" : "text-muted-foreground"
                        }`}
                      >
                        {item.n}
                      </span>
                      <span className="text-[13px] lg:text-lg lg:tracking-tight">{item.short}</span>
                      {/* Rule that draws in under the active item, desktop only. */}
                      <span className="hidden lg:block flex-1 h-px bg-border relative overflow-hidden">
                        <span
                          className={`absolute inset-0 bg-accent origin-left transition-transform duration-500 ${
                            isActive ? "scale-x-100" : "scale-x-0"
                          }`}
                        />
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div id="service-panel" role="tabpanel" className="lg:col-span-7 lg:col-start-6 min-w-0">
            {/* Keyed on the service so the panel re-enters rather than swapping in place. */}
            <div key={service.id} className="animate-fade-up">
              <div className="flex items-baseline gap-5">
                <span className="text-[3.5rem] md:text-[5rem] leading-none font-medium tracking-tighter text-accent tabular-nums">
                  {service.n}
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <h3 className="mt-8 text-2xl md:text-4xl">{service.title}</h3>
              <p className="mt-5 text-lg text-muted-foreground leading-relaxed max-w-2xl">
                {service.body}
              </p>

              <ul className="mt-8 grid sm:grid-cols-3 gap-px bg-border border border-border">
                {service.points.map((point) => (
                  <li
                    key={point}
                    className="bg-background px-4 py-5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
                  >
                    {point}
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <PrimaryLink href="#contact">Ask about {service.short.toLowerCase()}</PrimaryLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section id="process" className="px-6 md:px-12 lg:px-20 py-20 md:py-32 bg-card">
      <div className="max-w-[1600px] mx-auto grid lg:grid-cols-12 gap-14">
        <div className="lg:col-span-4">
          <SectionLabel>How it works</SectionLabel>
          <RevealLines
            className="mt-6 text-[clamp(2rem,4.4vw,3.4rem)]"
            lines={[
              <>From measure</>,
              <>
                to <span className="serif-italic text-accent">handover</span>.
              </>,
            ]}
          />
          <p className="mt-6 text-muted-foreground leading-relaxed reveal">
            Four stages, one team. You deal with the people building your kitchen, not a salesperson
            passing notes to a factory.
          </p>
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          <ol className="border-t border-border">
            {PROCESS.map((step) => (
              <li
                key={step.n}
                className="py-9 border-b border-border grid sm:grid-cols-12 gap-4 reveal"
              >
                <div className="sm:col-span-3">
                  <span className="text-2xl font-medium text-accent tabular-nums">{step.n}</span>
                </div>
                <div className="sm:col-span-9">
                  <h3 className="text-xl md:text-2xl">{step.title}</h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Trade() {
  return (
    <section className="px-6 md:px-12 lg:px-20 py-20 md:py-32">
      <div className="max-w-[1600px] mx-auto grid lg:grid-cols-2 border border-border">
        <div className="p-8 md:p-14 lg:p-20 flex flex-col justify-center">
          <SectionLabel>Trade & supply</SectionLabel>
          <RevealLines
            className="mt-6 text-[clamp(1.75rem,3.4vw,2.9rem)]"
            lines={[
              <>Need components,</>,
              <>
                not a <span className="serif-italic text-accent">whole kitchen</span>?
              </>,
            ]}
          />
          <p className="mt-6 text-muted-foreground leading-relaxed max-w-lg reveal">
            We supply cut-to-size panels and custom door profiles on their own. Builders and
            cabinetmakers use us as a manufacturing partner; homeowners use us to replace a run of
            fronts or match an older kitchen without redoing the whole room.
          </p>
          <div className="mt-10 reveal">
            <PrimaryLink href="#contact">Request a supply quote</PrimaryLink>
          </div>
        </div>

        <div className="relative min-h-[340px] lg:min-h-[560px]">
          <ScrollImage
            src="/kitchens/kitchen-2.jpg"
            alt="Floor-to-ceiling matte black cabinetry manufactured by Coral Kitchens"
            fill
            strength={0.7}
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>
    </section>
  );
}

function About() {
  const sectionRef = useRef<HTMLElement>(null);
  // Camera dolly is driven by how far through this section you are, not the page.
  const { progress: sceneProgress } = useScrollProgress(sectionRef);

  return (
    <section id="about" ref={sectionRef} className="px-6 md:px-12 lg:px-20 py-20 md:py-32 bg-card">
      <div className="max-w-[1600px] mx-auto grid lg:grid-cols-12 gap-14 items-center">
        {/*
         * The interactive model lives here, beside the story about who builds
         * these. Drag it around, pull the drawers open — it is the closest thing
         * to standing in the workshop.
         */}
        <div className="lg:col-span-7">
          <div className="relative aspect-[4/3] lg:aspect-[16/11] overflow-hidden">
            <KitchenStage
              progress={sceneProgress}
              focus={0}
              fallbackSrc="/kitchens/kitchen-5.jpg"
              fallbackAlt="A white shaker kitchen with a curved-end island, built by Coral Kitchens"
            />
          </div>
          <p className="mt-4 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            A Coral island, modelled to size — have a look around
          </p>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <SectionLabel>The workshop</SectionLabel>
          <RevealLines
            className="mt-6 text-[clamp(2rem,4.4vw,3.4rem)]"
            lines={[
              <>Founded by someone</>,
              <>
                who still <span className="serif-italic text-accent">builds them</span>.
              </>,
            ]}
          />
          <p className="mt-8 text-lg text-muted-foreground leading-relaxed reveal">
            {site.name} was founded by {site.founder}, who lives and breathes custom kitchens and
            cabinetry. The business was built on a simple idea: do genuinely high-quality work and
            price it honestly.
          </p>
          <p className="mt-5 text-muted-foreground leading-relaxed reveal">
            We can do that because we manufacture in our own {site.address.suburb} workshop rather
            than outsourcing to a factory and adding a margin. Materials come from trusted local and
            international suppliers, and everything we supply is covered for {site.warrantyMonths}{" "}
            months.
          </p>
          <div className="mt-10 reveal">
            <PrimaryLink href="#contact">Talk to us</PrimaryLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" className="px-6 md:px-12 lg:px-20 py-20 md:py-32">
      <div className="max-w-[1600px] mx-auto grid lg:grid-cols-12 gap-14">
        <div className="lg:col-span-4">
          <SectionLabel>Questions</SectionLabel>
          <RevealLines
            className="mt-6 text-[clamp(2rem,4.4vw,3.4rem)]"
            lines={[
              <>
                Before you <span className="serif-italic text-accent">ask</span>.
              </>,
            ]}
          />
        </div>
        <div className="lg:col-span-7 lg:col-start-6 reveal">
          <Accordion type="single" collapsible className="w-full border-t border-border">
            {FAQS.map((faq, i) => (
              <AccordionItem key={faq.q} value={`item-${i}`} className="border-b border-border">
                <AccordionTrigger className="text-left text-lg md:text-xl py-6 hover:no-underline tracking-tight">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-base pb-6 max-w-2xl">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section
      id="contact"
      className="on-dark bg-foreground text-background px-6 md:px-12 lg:px-20 py-20 md:py-32"
    >
      <div className="max-w-[1600px] mx-auto">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="block h-px w-10 bg-accent" />
            <span className="text-[11px] uppercase tracking-[0.28em] font-medium text-background/60">
              Start a project
            </span>
          </div>
          <RevealLines
            className="mt-6 text-[clamp(2.25rem,5.4vw,4.5rem)]"
            lines={[
              <>Tell us what you</>,
              <>
                <span className="serif-italic text-accent">want built</span>.
              </>,
            ]}
          />
        </div>

        <div className="mt-14 grid lg:grid-cols-12 gap-14">
          <div className="lg:col-span-7 reveal">
            <EnquiryForm />
          </div>

          <div className="lg:col-span-4 lg:col-start-9 reveal">
            <div className="flex flex-col gap-8 border-t border-background/20 pt-8">
              <a href={site.phoneHref} className="group flex items-start gap-4">
                <Phone className="w-5 h-5 mt-1 text-accent shrink-0" strokeWidth={1.3} />
                <div>
                  <div className="text-[11px] uppercase tracking-[0.28em] text-background/55 mb-1">
                    Call
                  </div>
                  <div className="text-xl group-hover:text-accent transition-colors">
                    {site.phoneDisplay}
                  </div>
                </div>
              </a>

              <a href={`mailto:${site.email}`} className="group flex items-start gap-4">
                <Mail className="w-5 h-5 mt-1 text-accent shrink-0" strokeWidth={1.3} />
                <div>
                  <div className="text-[11px] uppercase tracking-[0.28em] text-background/55 mb-1">
                    Email
                  </div>
                  <div className="text-lg break-all group-hover:text-accent transition-colors">
                    {site.email}
                  </div>
                </div>
              </a>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4"
              >
                <MapPin className="w-5 h-5 mt-1 text-accent shrink-0" strokeWidth={1.3} />
                <div>
                  <div className="text-[11px] uppercase tracking-[0.28em] text-background/55 mb-1">
                    Workshop
                  </div>
                  <div className="text-lg group-hover:text-accent transition-colors">
                    {addressLine}
                  </div>
                  <div className="text-sm text-background/55 mt-1">Visits by appointment</div>
                </div>
              </a>

              <div className="flex items-start gap-4">
                <Clock className="w-5 h-5 mt-1 text-accent shrink-0" strokeWidth={1.3} />
                <div>
                  <div className="text-[11px] uppercase tracking-[0.28em] text-background/55 mb-2">
                    Hours
                  </div>
                  <dl className="text-sm space-y-1">
                    {site.hours.map((entry) => (
                      <div key={entry.days} className="flex gap-3">
                        <dt className="text-background/55 w-32 shrink-0">{entry.days}</dt>
                        <dd>{entry.time}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="px-6 md:px-12 lg:px-20 py-16">
      <div className="max-w-[1600px] mx-auto grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-sm">
            Custom kitchen design, manufacturing and installation from our workshop at {addressLine}
            . Cut-to-size panels, custom door profiles and precision joinery for residential and
            commercial projects.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-2.5 text-sm">
          <span className="eyebrow mb-1">Explore</span>
          {[
            ["#services", "Services"],
            ["#work", "Work"],
            ["#process", "Process"],
            ["#about", "Workshop"],
            ["#faq", "Questions"],
            ["#contact", "Contact"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="text-muted-foreground hover:text-foreground transition-colors w-fit link-underline"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-2.5 text-sm">
          <span className="eyebrow mb-1">Areas served</span>
          <p className="text-muted-foreground leading-relaxed">{site.serviceAreas.join(" · ")}</p>
          <a href={site.phoneHref} className="mt-4 hover:text-accent transition-colors w-fit">
            {site.phoneDisplay}
          </a>
          <a
            href={`mailto:${site.email}`}
            className="hover:text-accent transition-colors break-all w-fit"
          >
            {site.email}
          </a>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto mt-14 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        <span>
          © {new Date().getFullYear()} {site.legalName}
        </span>
        <div className="flex gap-8">
          {site.socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              {social.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
