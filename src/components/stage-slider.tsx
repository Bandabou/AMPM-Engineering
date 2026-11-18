"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

// motion needs the curve as numbers: keep in step with --ease-brand in globals.css.
const EASE = [0.22, 1, 0.36, 1] as const;
const SLIDE_SECONDS = 7;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

// The server snapshot keeps hydration matching the prerendered HTML for every visitor.
function useReducedMotionPreference() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

export type Stage = {
  id: string;
  label: string;
  summary: string;
  visual: ReactNode;
};

const iconButton =
  "grid size-11 place-items-center rounded-[8px] bg-bg/70 backdrop-blur-md transition-colors duration-300 hover:bg-bg";

export function StageSlider({ stages, label }: { stages: Stage[]; label: string }) {
  const reducedMotion = useReducedMotionPreference();
  const [[index, direction], setPosition] = useState([0, 1]);
  const [playChoice, setPlayChoice] = useState<boolean | null>(null);
  const [inView, setInView] = useState(false);
  const [focusedWithin, setFocusedWithin] = useState(false);

  // Autoplay stays off for reduced motion unless the visitor explicitly presses play.
  const autoplay = playChoice ?? !reducedMotion;
  // The timer only runs while the slider is on screen, so visitors always see it from step 01.
  const running = autoplay && inView && !focusedWithin;
  const stage = stages[index];
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.4,
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const goTo = (next: number, dir: number) => {
    setPosition([(next + stages.length) % stages.length, dir]);
  };

  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    // A tapped button keeps focus on touch, which must not pause the slider for good.
    if (event.target.matches(":focus-visible")) setFocusedWithin(true);
  };
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocusedWithin(false);
  };

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.9, ease: EASE }}>
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label={label}
        ref={rootRef}
        onFocus={onFocus}
        onBlur={onBlur}
        className="hero-card relative isolate flex flex-col overflow-hidden rounded-lg p-5 md:p-8"
      >
        <div
          aria-live={running ? "off" : "polite"}
          aria-atomic="true"
          className="relative mx-auto aspect-[5/4] w-full max-w-[520px]"
        >
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={stage.id}
              custom={direction}
              variants={{
                enter: (dir: number) => ({ opacity: 0, x: 56 * dir, scale: 0.97 }),
                center: { opacity: 1, x: 0, scale: 1 },
                exit: (dir: number) => ({ opacity: 0, x: -40 * dir, scale: 0.98 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0"
            >
              {stage.visual}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Title and one-liner swap with a soft fade. Fixed height, so the controls never jump. */}
        <div className="mt-6 min-h-[124px] border-t border-ink/10 pt-5 sm:min-h-[100px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <p className="font-mono text-[13px] tracking-[0.08em] uppercase tabular-nums">
                <span className="text-ink/45">
                  {String(index + 1).padStart(2, "0")} / {String(stages.length).padStart(2, "0")}
                </span>
                <span className="ml-3">{stage.label}</span>
              </p>
              <p className="mt-2 max-w-[46ch] text-[16px] leading-snug text-pretty text-ink/70">{stage.summary}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 lg:gap-5">
          <div className="contents">
            <div className="flex items-center gap-1">
              {stages.map((item, itemIndex) => {
                const active = itemIndex === index;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`Go to step ${itemIndex + 1} of ${stages.length}: ${item.label}`}
                    aria-current={active ? "true" : undefined}
                    onClick={() => goTo(itemIndex, itemIndex >= index ? 1 : -1)}
                    className="group flex h-11 w-7 items-center md:w-10"
                  >
                    <span className="relative block h-0.5 w-full overflow-hidden rounded-full bg-ink/15 transition-colors duration-300 group-hover:bg-ink/30">
                      {active && (
                        <span
                          // The animation is the slide timer, so bar and slide can never drift apart.
                          key={`${item.id}-${autoplay}`}
                          onAnimationEnd={() => goTo(index + 1, 1)}
                          style={
                            autoplay
                              ? {
                                  animation: `stage-progress ${SLIDE_SECONDS}s linear forwards`,
                                  animationPlayState: running ? "running" : "paused",
                                }
                              : undefined
                          }
                          className="absolute inset-0 origin-left bg-ink"
                        />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label={autoplay ? "Pause slideshow" : "Play slideshow"}
                onClick={() => setPlayChoice(!autoplay)}
                className={iconButton}
              >
                {autoplay ? <Pause size={16} strokeWidth={1.5} /> : <Play size={16} strokeWidth={1.5} />}
              </button>
              <button
                type="button"
                aria-label="Previous step"
                onClick={() => goTo(index - 1, -1)}
                className={iconButton}
              >
                <ChevronLeft size={18} strokeWidth={1.5} />
              </button>
              <button
                type="button"
                aria-label="Next step"
                onClick={() => goTo(index + 1, 1)}
                className={iconButton}
              >
                <ChevronRight size={18} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
