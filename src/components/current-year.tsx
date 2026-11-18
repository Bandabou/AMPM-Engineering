import { cacheLife } from "next/cache";

// Cached rather than read live: the prerender may not read the clock directly.
// The year is worked out at build time and refreshed daily, so the pages stay static.
export async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}
