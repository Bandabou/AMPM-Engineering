"use client";

import { useEffect, useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { navLinks, quoteCta } from "@/content/home";
import { RollText } from "./button-motion";

// Past this much scroll the bar narrows to 1040px in one animation; narrower screens never shrink it.
const COMPACT_AFTER = 100;
// On these pages the bar sits at the top of the page and scrolls away with it, keeping the form clear.
const SCROLLS_WITH_PAGE = ["/quote"];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const pathname = usePathname();
  const inPage = SCROLLS_WITH_PAGE.includes(pathname);
  // A bar that scrolls away never narrows: it is only seen at the top.
  const compact = scrolled && !inPage;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > COMPACT_AFTER);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header
      className={`pointer-events-none inset-x-0 top-5 z-40 px-5 md:top-7 md:px-7 ${
        inPage ? "absolute" : "fixed"
      }`}
    >
      {/* Opening sequence: starts once the hero headline has risen. */}
      <div
        style={{ animationDelay: "0.9s" }}
        className={`appear-bar pointer-events-auto mx-auto rounded-md backdrop-blur-xl transition-[max-width,background-color] duration-500 ease-brand ${
          compact ? "max-w-[1040px]" : "max-w-full"
        } ${compact || menuOpen ? "bg-surface/97" : "bg-surface/60"}`}
      >
        <div className="flex h-16 items-center justify-between gap-6 pr-2 pl-5">
          <Link
            href="/"
            style={{ animationDelay: "1.1s" }}
            className="appear flex items-center gap-2.5 font-mono text-[clamp(14px,4.4vw,18px)] tracking-[-0.02em] whitespace-nowrap uppercase md:text-[20px]"
          >
            <Image src="/ampm-logo.svg" alt="" width={44} height={34} unoptimized loading="eager" className="h-7 w-auto flex-none md:h-[34px]" />
            AMPM Engineering
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link, linkIndex) => (
              <Link
                key={link.label}
                href={link.href}
                style={{ animationDelay: `${1.2 + 0.08 * linkIndex}s` }}
                className="appear nav-underline text-[15px] text-ink/85 transition-colors duration-300 hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* A solid pill in the logo's gradient, with the hero quote button's label roll. */}
            <Link
              href={quoteCta.href}
              style={{ animationDelay: "1.4s" }}
              className="appear group hidden items-center transition-[scale] duration-500 ease-brand active:scale-[0.98] sm:inline-flex"
            >
              <span className="inline-flex h-11 items-center rounded-full bg-[linear-gradient(90deg,var(--color-brand-deep),var(--color-brand))] px-6 text-bg">
                <RollText>{quoteCta.label}</RollText>
              </span>
            </Link>
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
              style={{ animationDelay: "1.4s" }}
              className="appear grid size-11 place-items-center rounded-[8px] transition-colors duration-300 hover:bg-surface-2 lg:hidden"
            >
              {menuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        <div
          id={menuId}
          inert={!menuOpen}
          className={`grid transition-[grid-template-rows] duration-500 ease-brand lg:hidden ${
            menuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <nav aria-label="Mobile" className="overflow-hidden">
            <ul className="flex flex-col px-5 pt-2 pb-4">
              {[...navLinks, quoteCta].map((link) => (
                <li key={link.label} className="border-t border-line">
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex h-12 items-center text-[17px] text-ink/85"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
