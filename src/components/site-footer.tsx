import Image from "next/image";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { brandName, navLinks, processStages, quoteCta } from "@/content/home";
import { quote } from "@/content/quote";
import { ArrowSwap, RollText } from "./button-motion";
import { CurrentYear } from "./current-year";
import { GlassFold } from "./glass-fold";
import { STILL_BLUE } from "./glass-presets";

// The closing bookend to the blue hero: one clear next step, the site map, then the name in full.
// Only facts already on the site: no contact details until the client supplies them.

const pages = [{ label: "Home", href: "/" }, ...navLinks, quoteCta];

// White underlines here: the light accent blue is too faint on the blue panel.
const footerLink =
  "nav-underline text-[15px] text-ink/80 transition-colors duration-300 hover:text-ink [--color-accent:#ffffff] [--color-accent-light:var(--color-accent-pale)]";

export function SiteFooter() {
  return (
    <footer>
      {/* Edge to edge: the blue runs the full width with no margin, rounded only along the top where it
          meets the page. The side padding adds the old frame margin back, so the content keeps its line. */}
      <div className="panel-dark relative isolate overflow-hidden rounded-t-lg px-8 pt-16 pb-8 md:px-12 md:pt-24 md:pb-11">
        {/* The About hero's still background, its ripple pushed further into the corner, clear of the bottom links. */}
        <GlassFold {...STILL_BLUE} offset={[1.45, 1.1]} className="absolute inset-0 -z-10" />

        <div className="grid gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <h2 className="type-statement max-w-[22ch] text-balance">{quote.intro}</h2>
            <Link
              href={quoteCta.href}
              className="group mt-8 inline-flex items-center gap-1 transition-[scale] duration-500 ease-brand active:scale-[0.98] md:mt-10"
            >
              <span className="inline-flex h-12 items-center rounded-[8px] bg-bg px-6 text-navy">
                <RollText>{quoteCta.label}</RollText>
              </span>
              <span className="relative grid size-12 place-items-center overflow-hidden rounded-[8px] bg-accent-light text-navy">
                <ArrowSwap />
              </span>
            </Link>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 lg:col-span-5 lg:pt-2">
            <div>
              <h3 className="font-mono text-[12px] tracking-[0.08em] text-ink/55 uppercase">Pages</h3>
              <ul className="mt-5 flex flex-col items-start gap-3">
                {pages.map((page) => (
                  <li key={page.label}>
                    <Link href={page.href} className={footerLink}>
                      {page.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-mono text-[12px] tracking-[0.08em] text-ink/55 uppercase">What we do</h3>
              <ul className="mt-5 flex flex-col items-start gap-3">
                {processStages.map((stage) => (
                  <li key={stage.id}>
                    <Link href="/#services" className={footerLink}>
                      {stage.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        {/* The name in full across the width, with the logo standing in as its first letter: the logo is an A.
            Decorative, as the name already reads above. The logo is sized in em to the capital height. */}
        <div aria-hidden="true" className="mt-20 border-t border-line pt-10 md:mt-28 md:pt-14">
          <p className="font-mono leading-[0.8] font-light tracking-[-0.045em] whitespace-nowrap text-[clamp(24px,calc(10.6vw-10px),200px)] uppercase">
            <Image
              src="/ampm-logo-white.svg"
              alt=""
              width={632}
              height={485}
              unoptimized
              className="mr-[0.02em] inline-block h-[0.7em] w-auto align-baseline"
            />
            {brandName.slice(1)}
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-line pt-6 text-[13px] text-ink/65 sm:flex-row sm:items-center sm:justify-between md:mt-14">
          <p>
            © <CurrentYear /> {brandName} · Delft, the Netherlands
          </p>
          <a
            href="#"
            className="group inline-flex items-center gap-2 self-start font-mono tracking-[0.06em] uppercase transition-colors duration-300 hover:text-ink sm:self-auto"
          >
            Back to top
            <ArrowUp
              size={15}
              strokeWidth={1.5}
              className="transition-transform duration-500 ease-brand group-hover:-translate-y-0.5"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
