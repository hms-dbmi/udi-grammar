import { scheme } from 'vega';

// Monotonic counter so each function-valued ramp registers under a unique
// Vega scheme name — avoids collisions when multiple charts (or successive
// re-embeds) supply different interpolators.
let rampSchemeCounter = 0;

/**
 * Register a continuous interpolator with Vega's global scheme registry under
 * a unique name and return that name, so a function-valued ramp can be
 * referenced from vega-lite `config.range.ramp` as `{ scheme }`.
 */
export function registerRampScheme(fn: (t: number) => string): string {
  const name = `udi-ramp-${rampSchemeCounter++}`;
  scheme(name, fn);
  return name;
}
