import type { GlassFoldProps } from "./glass-fold";

// Kept out of glass-fold.tsx: a "use client" module's plain values can't be read by Server Components.
// Colours from the logo's gradient (#21478B to #80BEE9), kept light at the client's request.

// The animated homepage hero is configured in hero.tsx, with its tuning constants at the top.

// The still version with one fold in the bottom-right corner, for the About hero and the quote form.
export const STILL_BLUE = {
  color1: "#80BEE9",
  color2: "#4777B1",
  color3: "#EAF5FD",
  speed: 0,
  scale: 0.8,
  noise: 0.06,
  folds: 1,
  offset: [1.12, 1],
  vignette: 0.25,
} satisfies GlassFoldProps;
