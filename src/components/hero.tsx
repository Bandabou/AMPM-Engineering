import { Fragment } from "react";
import Link from "next/link";
import { hero, quoteCta, servicesCta } from "@/content/home";
import { ArrowSwap, RollText } from "./button-motion";
import { GlassFold } from "./glass-fold";
import { HERO_GLASS } from "./glass-presets";

export function Hero() {
  return (
    <section aria-label="Introduction" className="page-frame pt-2 md:pt-3">
      <div className="hero-night relative isolate flex min-h-[max(640px,calc(100svh-16px))] flex-col overflow-hidden rounded-lg text-bg md:min-h-[max(680px,calc(100svh-24px))]">
        <GlassFold {...HERO_GLASS} className="absolute inset-0 -z-10" />
        {/* Keeps the lit edges of the folds from washing out the white text. */}
        <div aria-hidden="true" className="hero-scrim absolute inset-0 -z-10" />

        {/* Headline at the top under the navbar; subheading and quote button share the bottom edge. */}
        {/* The inset lines the text up with the logo in the header. */}
        <div className="flex flex-1 flex-col justify-between gap-16 px-8 pt-36 pb-8 md:px-9 md:pt-40 md:pb-9">
          <h1 className="type-hero max-w-[16ch]">
            {hero.headlineLines.map((line, lineIndex) => (
              <Fragment key={line}>
                <span className="block overflow-hidden pb-[0.06em]">
                  <span className="rise block" style={{ animationDelay: `${0.08 * lineIndex}s` }}>
                    {line}
                  </span>
                </span>{" "}
              </Fragment>
            ))}
          </h1>

          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            {/* Rises line by line straight after the headline, with the same masked motion. */}
            <p className="text-[clamp(20px,1.9vw,28px)] leading-[1.25] tracking-[-0.01em] text-bg/90">
              <span className="block overflow-hidden pb-[0.08em]">
                <span className="rise block" style={{ animationDelay: `${0.08 * hero.headlineLines.length}s` }}>
                  {hero.subheading.lead}
                  <span className="whitespace-nowrap text-accent-pale">{hero.subheading.highlight}</span>
                </span>
              </span>{" "}
              <span className="block overflow-hidden pb-[0.08em]">
                <span
                  className="rise block"
                  style={{ animationDelay: `${0.08 * (hero.headlineLines.length + 1)}s` }}
                >
                  {hero.subheading.rest.trim()}
                </span>
              </span>
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={servicesCta.href}
                style={{ animationDelay: "1.3s" }}
                className="appear group inline-flex h-12 items-center rounded-[8px] border border-bg/20 bg-bg/10 px-6 backdrop-blur-md transition-[background-color,border-color,scale] duration-500 ease-brand hover:border-bg/35 hover:bg-bg/20 active:scale-[0.98] focus-visible:outline-accent-light"
              >
                <RollText>{servicesCta.label}</RollText>
              </a>
              {/* Label and arrow sit in two separate tiles, the arrow in the light accent blue. */}
              <Link
                href={quoteCta.href}
                style={{ animationDelay: "1.4s" }}
                className="appear group inline-flex items-center gap-1 transition-[scale] duration-500 ease-brand active:scale-[0.98] focus-visible:outline-accent-light"
              >
                <span className="inline-flex h-12 items-center rounded-[8px] bg-bg px-6 text-ink shadow-[0_8px_24px_-12px_rgb(140_185_226/0.6)] transition-shadow duration-500 ease-brand group-hover:shadow-[0_10px_32px_-10px_rgb(140_185_226/0.9)]">
                  <RollText>{quoteCta.label}</RollText>
                </span>
                <span className="relative grid size-12 place-items-center overflow-hidden rounded-[8px] bg-accent-light text-ink">
                  <ArrowSwap />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
