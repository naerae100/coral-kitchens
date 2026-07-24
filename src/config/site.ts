/**
 * Coral Kitchens — real business details.
 *
 * Sourced from the company's own Google Business listing and website.
 * Anything marked TODO could not be confirmed and must be checked before launch.
 */

export const site = {
  name: "Coral Kitchens",
  legalName: "Coral Kitchens",
  category: "Custom kitchen manufacturer",
  tagline: "Custom Kitchen Manufacturer, Smithfield",
  description:
    "Coral Kitchens designs, manufactures and installs custom kitchens from our Smithfield workshop in Western Sydney. Cut-to-size panels, custom cabinet door profiles and precision joinery for residential and commercial projects.",
  url: "https://www.coralkitchens.com.au", // TODO: confirm this is the canonical domain

  founder: "Jessie Karen",
  email: "admin@coralkitchens.com.au",
  phoneDisplay: "0470 695 498",
  phoneHref: "tel:+61470695498",
  /** wa.me needs the number in international form with no +, spaces or zeroes. */
  whatsappHref:
    "https://wa.me/61470695498?text=" +
    encodeURIComponent("Hi Coral Kitchens, I'd like to ask about a kitchen."),

  address: {
    street: "69 Long St",
    suburb: "Smithfield",
    state: "NSW",
    postcode: "2164",
    country: "AU",
  },

  /**
   * TODO — VERIFY BEFORE LAUNCH.
   * The Google listing confirms a 5:00pm weekday close but not the opening time
   * or weekend availability. These are placeholders.
   */
  hours: [
    { days: "Monday – Friday", time: "8:00am – 5:00pm" },
    { days: "Saturday", time: "By appointment" },
    { days: "Sunday", time: "Closed" },
  ],

  warrantyMonths: 24,

  socials: [
    // TODO: replace with the real profiles, or delete the ones that don't exist
    { label: "Instagram", href: "https://www.instagram.com/" },
    { label: "Facebook", href: "https://www.facebook.com/" },
  ],

  serviceAreas: [
    "Sydney",
    "Western Sydney",
    "Fairfield",
    "Liverpool",
    "Parramatta",
    "The Hills",
    "Inner West",
  ],
} as const;

export const addressLine = `${site.address.street}, ${site.address.suburb} ${site.address.state} ${site.address.postcode}`;

export const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(`${site.name} ${addressLine}`)}`;

/** The four service lines the business actually offers. */
export const SERVICES = [
  {
    id: "kitchens",
    n: "01",
    title: "Custom kitchen design, manufacture & installation",
    short: "Complete kitchens",
    body: "We take a kitchen from first measure through to the final handle: design, manufacture in our own Smithfield workshop, then installation by the people who built it. One team, one point of contact, no subcontracted guesswork.",
    points: ["In-house design", "Manufactured on site", "Installed by our team"],
  },
  {
    id: "panels",
    n: "02",
    title: "Cut-to-size panels",
    short: "Cut to size",
    body: "Precision-cut panels to your dimensions, edged and ready to install. Useful whether you're a builder needing a reliable supplier, a cabinetmaker filling a gap, or a homeowner replacing a run of shelving.",
    points: ["Cut to your measurements", "Edging applied", "Trade and retail"],
  },
  {
    id: "doors",
    n: "03",
    title: "Custom cabinet door profile manufacturing",
    short: "Door profiles",
    body: "Custom door and drawer fronts made to your profile — shaker, flat panel, routed or handleless. Ideal for replacing fronts on existing carcasses, matching an older kitchen, or supplying a run for a project.",
    points: ["Any profile", "Colour and finish matched", "Replacement or new"],
  },
  {
    id: "joinery",
    n: "04",
    title: "Precision joinery, residential & commercial",
    short: "Precision joinery",
    body: "Beyond kitchens: wardrobes, laundries, butler's pantries, vanities, entertainment units, reception counters and shopfit joinery. If it can be drawn and measured, we can manufacture it.",
    points: ["Residential", "Commercial and shopfit", "Fully custom"],
  },
] as const;

/**
 * schema.org graph. Gives search engines the studio's real location, contact
 * point and service catalogue rather than leaving them to infer it.
 */
export function businessJsonLd(imageUrls: string[]) {
  const absolute = imageUrls.map((path) => `${site.url}${path}`);
  return {
    "@type": "HomeAndConstructionBusiness",
    "@id": `${site.url}/#business`,
    additionalType: "https://schema.org/Manufacturer",
    name: site.name,
    founder: { "@type": "Person", name: site.founder },
    description: site.description,
    url: site.url,
    email: site.email,
    telephone: "+61470695498",
    image: absolute,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.suburb,
      addressRegion: site.address.state,
      postalCode: site.address.postcode,
      addressCountry: site.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: -33.8440663, longitude: 150.9369932 },
    areaServed: site.serviceAreas.map((name) => ({ "@type": "City", name })),
    sameAs: site.socials.map((s) => s.href),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Kitchen and joinery services",
      itemListElement: SERVICES.map((service) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: service.title, description: service.body },
      })),
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "17:00",
      },
    ],
  };
}
