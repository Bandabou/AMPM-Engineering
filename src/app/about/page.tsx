import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GlassFold } from "@/components/glass-fold";
import { STILL_BLUE } from "@/components/glass-presets";
import { about } from "@/content/about";
import { quoteCta } from "@/content/home";

export const metadata: Metadata = {
  title: about.title,
  description: about.description,
};

export default function AboutPage() {
  const { statement, photos, story, team } = about;

  return (
    <main id="main">
      <section className="page-frame pt-2 md:pt-3">
        {/* Same glass background as the homepage, in its blue, kept still with one fold in the corner. Accents switch to the light logo blue. */}
        <div className="relative isolate flex flex-col gap-12 overflow-hidden rounded-lg bg-brand px-5 pt-24 pb-10 text-bg [--color-accent:var(--color-accent-pale)] [--eyebrow-logo:url(/ampm-logo-white.svg)] md:px-8 md:pt-28 md:pb-12 min-h-[max(640px,calc(100svh-16px))] justify-between md:min-h-[max(680px,calc(100svh-24px))] lg:justify-center lg:py-12">
          <GlassFold {...STILL_BLUE} className="absolute inset-0 -z-10" />
          {/* On large screens the text and the logo share the same vertical centre. */}
          <div>
            <p className="type-eyebrow">{about.eyebrow}</p>
            <h1 className="type-display mt-6 md:mt-8">
              {about.headlineLines.map((line, lineIndex) => (
                <span key={line} className="block overflow-hidden pb-[0.06em]">
                  <span className="rise block" style={{ animationDelay: `${0.08 * lineIndex}s` }}>
                    {line}
                  </span>{" "}
                </span>
              ))}
            </h1>
            <p className="type-statement mt-4 max-w-[38ch] text-[clamp(20px,1.8vw,26px)] text-pretty text-bg/85 md:mt-6 lg:max-w-[34ch]">
              {statement.lead}
              <span className="text-accent">{statement.highlight}</span>
              {statement.rest}
            </p>
          </div>
          {/* The client's official logo shapes, in white to stand out on the blue. */}
          <Image
            src="/ampm-logo-white.svg"
            alt=""
            width={632}
            height={485}
            unoptimized
            loading="eager"
            className="mx-auto w-[64%] max-w-[360px] lg:absolute lg:top-1/2 lg:right-[6%] lg:-z-10 lg:w-[36%] lg:max-w-none lg:-translate-y-1/2"
          />
        </div>
      </section>

      <section className="page-shell py-24 lg:py-40">
        <div className="reveal grid gap-6 px-1 lg:grid-cols-12 lg:gap-8 lg:px-8">
          <p className="type-eyebrow self-start lg:col-span-5 lg:pt-4">{story.eyebrow}</p>
          {/* Headings go dark navy and fade into pale blue, after the inspiration's green and stone. */}
          <h2 className="text-[clamp(30px,3.6vw,56px)] leading-[1.1] tracking-[-0.025em] text-pretty text-navy lg:col-span-7">
            {story.statement.lead}
            <span className="text-mist">{story.statement.highlight}</span>
          </h2>
        </div>
      </section>

      <section className="page-shell border-t border-line py-16 lg:py-24">
        <div className="grid gap-10 px-1 lg:grid-cols-12 lg:gap-8 lg:px-8">
          <Image
            {...photos.team}
            alt={photos.team.alt}
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="reveal h-auto w-full rounded-lg lg:col-span-6"
          />
          <div className="reveal flex flex-col gap-10 lg:col-span-6 lg:pl-8">
            <p className="max-w-[40ch] text-[19px] leading-snug text-pretty text-ink/80">{story.body}</p>
            <Link
              href={quoteCta.href}
              className="group inline-flex h-12 items-center gap-2 self-start rounded-[8px] bg-ink pr-4 pl-6 text-[15px] text-bg transition-opacity duration-300 hover:opacity-85"
            >
              {quoteCta.label}
              <ArrowRight
                size={18}
                strokeWidth={1.5}
                className="transition-transform duration-500 ease-brand group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>

      <section className="page-shell border-t border-line pt-16 pb-24 lg:pt-24 lg:pb-40">
        <h2 className="reveal px-1 text-[clamp(48px,7vw,112px)] leading-[0.95] tracking-[-0.04em] text-navy lg:px-8">
          {team.title.lead}
          <span className="text-mist">{team.title.highlight}</span>
        </h2>

        <div className="mt-16 grid gap-10 px-1 lg:mt-32 lg:grid-cols-12 lg:gap-8 lg:px-8">
          <div className="reveal lg:col-span-4">
            <p className="type-eyebrow">{team.eyebrow}</p>
            <p className="mt-6 max-w-[30ch] text-[20px] leading-snug text-pretty text-ink/80 md:mt-8">
              {team.intro}
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
            {team.members.map((member) => (
              <li key={member.name} className="reveal rounded-lg bg-surface p-3">
                <div
                  aria-hidden="true"
                  className="grid aspect-[5/4] place-items-center rounded-md bg-linear-to-b from-surface-2 to-[#dedee1] font-mono text-[clamp(44px,5vw,72px)] font-light tracking-[-0.02em] text-ink/15"
                >
                  {member.initials}
                </div>
                <div className="px-2 pt-5 pb-3">
                  <h3 className="text-[24px] leading-tight tracking-[-0.015em] text-navy">{member.name}</h3>
                  <p className="mt-2 font-mono text-[13px] tracking-[0.08em] text-accent uppercase">
                    {member.role}
                  </p>
                  <p className="mt-3 text-[15px] leading-snug text-pretty text-ink/70">{member.bio}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
