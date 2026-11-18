import type { HeroDrawingName } from "@/components/hero-drawings";

export const brandName = "AMPM Engineering";

export const navLinks = [
  { label: "Services", href: "/#services" },
  { label: "About", href: "/about" },
];

export const quoteCta = { label: "Request a Quote", href: "/quote" };
export const servicesCta = { label: "Our Services", href: "#services" };

// Exact client copy from the homepage brief: do not reword.
export const hero = {
  // Split only so each part can animate in. Together they read as the exact client copy.
  headlineLines: ["From idea to", "finished part."],
  // Client copy, one entry per line as written: "design, fix / and print".
  subheadingLines: ["Aeronautical engineers who design, fix", "and print your parts in-house."],
};

// Step titles and one-liners: exact client copy. PLACEHOLDER IMAGERY: swap for company photography when supplied.
export const processStages: { id: HeroDrawingName; label: string; summary: string; alt: string }[] = [
  {
    id: "consult",
    label: "Analyse & consult",
    summary: "We review your idea or file and advise on the best approach.",
    alt: "A sketch of a part on a sheet, under a magnifying glass, next to a ticked checklist",
  },
  {
    id: "design",
    label: "Design & file repair",
    summary: "We design your part or fix files that aren’t print-ready.",
    alt: "Technical drawing of a gear with its diameter; part of its triangle mesh is marked as repaired",
  },
  {
    id: "prepare",
    label: "Print preparation",
    summary: "We optimise orientation, supports and settings for the best result.",
    alt: "A bracket on the build plate, its overhanging shelf held up by support material, with a turn arrow for orientation and a layer-height label",
  },
  {
    id: "print",
    label: "3D printing",
    summary: "Printed in-house, from small detailed parts to large parts in one piece.",
    alt: "Drawing of a 3D printer building a large gear layer by layer, next to a small finished gear",
  },
  {
    id: "finish",
    label: "Post-processing & assembly",
    summary: "Sanding, painting and assembly, delivered ready to use.",
    alt: "The bracket sanded and painted blue, supports removed, with the gear mounted on its shelf and the base screwed down",
  },
];

export const services = {
  eyebrow: "What we do",
  statement: {
    lead: `${brandName} helps businesses `,
    highlight: "turn ideas into functional components",
    rest: ".",
  },
  // PLACEHOLDER: point at the full Services page once it exists.
  allServices: { label: "View all services", href: "#" },
};
