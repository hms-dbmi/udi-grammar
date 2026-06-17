import { scaleLinear } from 'd3-scale';

/**
 * Consumer-supplied color palette for UDI charts and tables.
 *
 * A palette sets the *default* colors used across every visualization; a
 * spec-level per-encoding `range` still overrides it. The palette is passed
 * as a separate prop (never inside the grammar spec), because UDIVis deep-
 * clones the spec via `JSON.parse(JSON.stringify(...))`, which would strip
 * any function value.
 */
export interface UDIPalette {
  /** Default single mark color (Vega `config.mark.color`; table fallback). */
  mark?: string;
  /** Colors for nominal / categorical color scales (Vega `config.range.category`). */
  category?: DiscreteColor;
  /** Colors for ordinal color scales (Vega `config.range.ordinal`). */
  ordinal?: DiscreteColor;
  /** Continuous color for quantitative (numeric) scales (Vega `config.range.ramp` + tables). */
  ramp?: ContinuousColor;
}

/**
 * A continuous color spec for numeric scales. One of:
 *  - a named Vega/Vega-Lite scheme, e.g. `'viridis'`
 *  - an array of CSS colors to interpolate between
 *  - an interpolator function mapping `t` ∈ [0, 1] to a CSS color string
 */
export type ContinuousColor = string | string[] | ((t: number) => string);

/**
 * A discrete color spec for categorical / ordinal scales. Either an array of
 * CSS colors, or a named Vega scheme.
 */
export type DiscreteColor = string[] | string;

/**
 * The palette baked into the toolkit historically. Used as the fallback when
 * no palette prop is supplied, so existing visuals are unchanged.
 */
export const DEFAULT_PALETTE: UDIPalette = {
  mark: '#E6A01A',
  category: [
    '#E6A01A',
    '#16A987',
    '#0673B0',
    '#9EC8DD',
    '#204E62',
    '#BF97E4',
    '#D95838',
    '#6FDCC3',
    '#787874',
  ],
  ramp: 'oranges',
};

/** A Vega range definition: either an explicit color array or a scheme reference. */
export type VegaRange = string[] | { scheme: string };

/**
 * Resolve a discrete color spec to a Vega `config.range.*` value. Arrays pass
 * through; a string is treated as a named scheme.
 */
export function toVegaRange(color: DiscreteColor): VegaRange {
  return Array.isArray(color) ? color : { scheme: color };
}

/**
 * Resolve a continuous color spec to a Vega `config.range.ramp` value.
 *
 * A function cannot be expressed in Vega-Lite JSON config, so it is registered
 * with Vega's scheme registry via `registerScheme` (which returns the name to
 * reference). Arrays are interpolated by Vega; strings are scheme names.
 */
export function toVegaRamp(
  color: ContinuousColor,
  registerScheme: (fn: (t: number) => string) => string,
): VegaRange {
  if (typeof color === 'function') {
    return { scheme: registerScheme(color) };
  }
  if (Array.isArray(color)) {
    return color;
  }
  return { scheme: color };
}

/**
 * Resolve a continuous color spec to a `(t: number) => string` interpolator for
 * the table renderer (d3-based). Functions pass through; arrays become a
 * piecewise-linear RGB interpolator. A bare scheme-name string returns `null`
 * so the caller falls back to its default — mapping arbitrary Vega scheme names
 * to d3 interpolators is not supported in the table path.
 */
export function toTableRampInterpolator(
  color: ContinuousColor | undefined,
): ((t: number) => string) | null {
  if (color == null) return null;
  if (typeof color === 'function') return color;
  if (Array.isArray(color)) {
    if (color.length === 0) return null;
    if (color.length === 1) {
      const solid = color[0]!;
      return () => solid;
    }
    const stops = color.map((_, i) => i / (color.length - 1));
    const scale = scaleLinear<string, string>().domain(stops).range(color).clamp(true);
    return (t: number) => scale(t);
  }
  return null;
}

/**
 * Resolve a discrete color spec to an array of colors for the table renderer.
 * Arrays pass through; a bare scheme-name string returns `null` so the caller
 * falls back to its default.
 */
export function toTableCategoryColors(color: DiscreteColor | undefined): string[] | null {
  if (color == null) return null;
  return Array.isArray(color) ? color : null;
}
