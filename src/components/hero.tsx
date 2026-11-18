import { Fragment } from "react";
import Link from "next/link";
import { hero, quoteCta, servicesCta } from "@/content/home";
import { RollText } from "./button-motion";
import { GlassFold } from "./glass-fold";

// ── Hero tuning ─────────────────────────────────────────────────────────────
// Background "glass folds" (WebGL). Previous look: speed 0.4, frequency 1, highlight 1, calm 0.
/** Animation speed. 0.26 is 35% slower than before. */
const HERO_SPEED = 0.26;
/** Fold frequency: lower means larger folds, so fewer ridges on screen at once. */
const HERO_FOLD_FREQUENCY = 0.7;
/** Strength of the bright white ridges (#EAF5FD), 0 to 1. */
const HERO_HIGHLIGHT_INTENSITY = 0.45;
/** How much the folds fade on the left, behind the text, 0 to 1. 0.85 leaves 15% of their strength there. */
const HERO_LEFT_CALM = 0.85;

/** "watermark": smaller, softened logo at 0.55 opacity (default). "full": the earlier large logo. "hidden": no logo, buttons bottom right. */
type HeroLogoVariant = "watermark" | "full" | "hidden";
const HERO_LOGO_VARIANT: HeroLogoVariant = "watermark";
// ────────────────────────────────────────────────────────────────────────────

// Logo box per variant. The buttons share the same box, so they stay centred under the logo.
const LOGO_BOX = {
  watermark: { size: "lg:w-[22.5%] lg:max-w-[390px]", look: "opacity-55" },
  full: { size: "lg:w-[30%] lg:max-w-[520px]", look: "" },
  hidden: null,
} as const;

export function Hero() {
  const logo = LOGO_BOX[HERO_LOGO_VARIANT];
  const mobileText = hero.subheadingLines.join(" ");
  const lastSpace = mobileText.lastIndexOf(" ") + 1;
  const [mobileLead, mobileLast] = [mobileText.slice(0, lastSpace), mobileText.slice(lastSpace)];

  return (
    <section aria-label="Introduction" className="page-frame pt-2 md:pt-3">
      <div className="hero-night relative isolate flex min-h-[max(640px,calc(100svh-16px))] flex-col overflow-hidden rounded-lg text-bg md:min-h-[max(680px,calc(100svh-24px))]">
        <GlassFold
          color1="#80BEE9"
          color2="#3F6FAE"
          color3="#EAF5FD"
          noise={0.08}
          vignette={0.3}
          speed={HERO_SPEED}
          scale={HERO_FOLD_FREQUENCY}
          highlight={HERO_HIGHLIGHT_INTENSITY}
          calm={HERO_LEFT_CALM}
          className="absolute inset-0 -z-10"
        />
        {/* Keeps the lit edges of the folds from washing out the white text. */}
        <div aria-hidden="true" className="hero-scrim absolute inset-0 -z-10" />
        {/* The client's official logo on the right, vertically centred. Large screens only: on phones the headline needs the room.
            Inline SVG rather than an <img>: browsers don't count it as the page's main paint, so that stays the headline. */}
        {logo && (
          <svg
            aria-hidden="true"
            viewBox="0 0 322.16 247.15"
            style={{ animationDelay: "0.5s" }}
            className={`appear pointer-events-none absolute top-1/2 right-[3.5%] -z-10 hidden h-auto -translate-y-1/2 lg:block ${logo.size} ${logo.look}`}
          >
            <defs>
              {/* The logo file's own gradient. */}
              <linearGradient id="hero-logo-gradient" x1="0" y1="123.57" x2="322.16" y2="123.57" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#21478b" />
                <stop offset=".04" stopColor="#285092" />
                <stop offset=".25" stopColor="#4777b1" />
                <stop offset=".45" stopColor="#6096c9" />
                <stop offset=".64" stopColor="#71acdb" />
                <stop offset=".83" stopColor="#7cb9e5" />
                <stop offset="1" stopColor="#80bee9" />
              </linearGradient>
            </defs>
            <g fill="url(#hero-logo-gradient)">
              <polyline points="155.6 28.48 155.6 247.13 166.56 247.13 166.56 28.48 166.56 28.48 309.07 247.13 322.16 247.15 321.12 245.55 161.08 0 0 247.15 13.09 247.13 86.56 134.41 86.57 134.39 87.42 134.39 150.66 134.39 150.66 123.43 94.57 123.43 93.72 123.43 155.6 28.48" />
              <path d="M171.91,193.01v-10.96c13.1,0,23.76-10.66,23.76-23.76s-10.66-23.76-23.76-23.76v-10.96c19.14,0,34.72,15.58,34.72,34.72s-15.58,34.72-34.72,34.72Z" />
            </g>
          </svg>
        )}

        {/* Headline at the top under the navbar; subheading and quote button share the bottom edge. */}
        {/* The inset lines the text up with the logo in the header. */}
        <div className="flex flex-1 flex-col justify-between gap-16 px-8 pt-36 pb-8 md:px-9 md:pt-40 md:pb-9">
          {/* Phones get three shorter lines at a larger size (sized to fit "TO FINISHED" across the width);
              from sm up, the two-line version. Only one set is ever displayed. */}
          <h1 className="type-hero max-w-[16ch] max-sm:text-[clamp(36px,calc(15.4vw-12px),60px)]">
            {[
              { lines: hero.headlineLinesPhone, show: "block sm:hidden" },
              { lines: hero.headlineLines, show: "hidden sm:block" },
            ].map(({ lines, show }) => (
              <span key={show} className={show}>
                {lines.map((line, lineIndex) => (
                  <Fragment key={line}>
                    <span className="block overflow-hidden pb-[0.06em]">
                      <span className="rise block" style={{ animationDelay: `${0.08 * lineIndex}s` }}>
                        {line}
                      </span>
                    </span>{" "}
                  </Fragment>
                ))}
              </span>
            ))}
          </h1>

          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            {/* Rises line by line straight after the headline, with the same masked motion. */}
            <p className="text-[clamp(20px,1.9vw,28px)] leading-[1.25] tracking-[-0.01em] text-bg/90">
              {/* Below md: one paragraph that wraps naturally. From md: the break is forced after "design,". */}
              <span className="block overflow-hidden pb-[0.08em] md:hidden">
                <span
                  className="rise block"
                  style={{ animationDelay: `${0.08 * hero.headlineLines.length}s` }}
                >
                  {mobileLead}
                  {/* Keeps "in-house." whole: browsers may otherwise break at its hyphen. */}
                  <span className="whitespace-nowrap">{mobileLast}</span>
                </span>
              </span>
              {hero.subheadingLines.map((line, lineIndex) => (
                <Fragment key={line}>
                  <span className="hidden overflow-hidden pb-[0.08em] md:block">
                    <span
                      className="rise block"
                      style={{ animationDelay: `${0.08 * (hero.headlineLines.length + lineIndex)}s` }}
                    >
                      {line}
                    </span>
                  </span>{" "}
                </Fragment>
              ))}
            </p>

            {/* The buttons fade in together with the logo. */}
            {/* Large screens: centred under the logo, in a box with its exact width and right edge.
                With the logo hidden they stay in the bottom-right corner of the row. */}
            <div
              className={`flex flex-wrap items-center gap-2 ${
                logo ? `lg:absolute lg:right-[3.5%] lg:bottom-9 lg:flex-nowrap lg:justify-center lg:*:flex-none lg:*:whitespace-nowrap ${logo.size}` : ""
              }`}
            >
              <a
                href={servicesCta.href}
                style={{ animationDelay: "0.5s" }}
                className="appear group inline-flex h-12 items-center rounded-[8px] border border-bg/20 bg-bg/10 px-6 backdrop-blur-md transition-[background-color,border-color,scale] duration-500 ease-brand hover:border-bg/35 hover:bg-bg/20 active:scale-[0.98] focus-visible:outline-accent-light"
              >
                <RollText>{servicesCta.label}</RollText>
              </a>
              <Link
                href={quoteCta.href}
                style={{ animationDelay: "0.5s" }}
                className="appear group inline-flex transition-[scale] duration-500 ease-brand active:scale-[0.98] focus-visible:outline-accent-light"
              >
                <span className="inline-flex h-12 items-center rounded-[8px] bg-bg px-6 text-ink shadow-[0_8px_24px_-12px_rgb(140_185_226/0.6)] transition-shadow duration-500 ease-brand group-hover:shadow-[0_10px_32px_-10px_rgb(140_185_226/0.9)]">
                  <RollText>{quoteCta.label}</RollText>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
