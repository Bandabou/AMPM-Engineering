import { ArrowRight } from "lucide-react";
import { processStages, services } from "@/content/home";
import { HERO_DRAWINGS } from "./hero-drawings";
import { StageSlider } from "./stage-slider";

export function Services() {
  const { lead, highlight, rest } = services.statement;

  return (
    <section id="services" className="page-shell py-24 lg:py-40">
      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="reveal px-1 lg:col-span-5 lg:px-8">
          <p className="type-eyebrow">{services.eyebrow}</p>
          <h2 className="type-statement mt-6 max-w-[18ch] text-balance md:mt-8">
            {lead}
            <span className="text-accent">{highlight}</span>
            {rest}
          </h2>
          <a
            href={services.allServices.href}
            className="group mt-6 inline-flex h-11 items-center gap-2 text-[15px] md:mt-8"
          >
            {services.allServices.label}
            <ArrowRight
              size={18}
              strokeWidth={1.5}
              className="transition-transform duration-500 ease-brand group-hover:translate-x-1"
            />
          </a>
        </div>

        <div className="reveal lg:col-span-7">
          <StageSlider
            label="From idea to finished part"
            stages={processStages.map(({ id, label, summary, alt }) => {
              const Drawing = HERO_DRAWINGS[id];
              return {
                id,
                label,
                summary,
                visual: <Drawing label={alt} className="absolute inset-0 size-full" />,
              };
            })}
          />
        </div>
      </div>
    </section>
  );
}
