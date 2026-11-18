import type { Metadata } from "next";
import { QuoteForm } from "@/components/quote-form";
import { quote } from "@/content/quote";

export const metadata: Metadata = {
  title: "Request a Quote | AMPM Engineering",
  description: quote.intro,
};

export default function QuotePage() {
  return (
    <main id="main" className="page-shell pt-28 pb-24 md:pt-36 lg:pb-40">
      <div className="grid gap-12 px-1 lg:grid-cols-12 lg:gap-8 lg:px-8">
        {/* The title stays in view while the whole page, form included, scrolls under the fixed navbar. */}
        <header className="lg:sticky lg:top-32 lg:col-span-5 lg:self-start">
          <h1 className="type-display max-w-[10ch]">{quote.title}</h1>
          <p className="type-statement mt-6 max-w-[24ch] text-balance md:mt-8">
            {quote.intro}
          </p>
        </header>
        <div className="lg:col-span-7">
          <QuoteForm />
        </div>
      </div>
    </main>
  );
}
