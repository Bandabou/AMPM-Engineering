import { ArrowRight } from "lucide-react";

// Hover animations shared by the hero and navbar buttons. Both need a `group` parent.
// Transforms only, so they stay cheap; reduced motion keeps just the still label and arrow.

/* On hover the label rolls up and an identical copy rolls in from below. */
export function RollText({ children }: { children: string }) {
  return (
    <span className="relative block overflow-hidden font-mono text-[13px] leading-[1.4] tracking-[0.06em] uppercase">
      <span className="block transition-transform duration-500 ease-brand group-hover:-translate-y-full motion-reduce:transition-none">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-full block transition-transform duration-500 ease-brand group-hover:-translate-y-full motion-reduce:hidden"
      >
        {children}
      </span>
    </span>
  );
}

/* One arrow leaves to the right as the next slides in from the left. Place inside an overflow-hidden tile. */
export function ArrowSwap() {
  return (
    <>
      <ArrowRight
        size={18}
        strokeWidth={1.5}
        className="transition-transform duration-500 ease-brand group-hover:translate-x-[200%] motion-reduce:transition-none"
      />
      <ArrowRight
        aria-hidden="true"
        size={18}
        strokeWidth={1.5}
        className="absolute -translate-x-[200%] transition-transform duration-500 ease-brand group-hover:translate-x-0 motion-reduce:hidden"
      />
    </>
  );
}
