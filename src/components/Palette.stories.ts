import { interpolateViridis } from 'd3-scale-chromatic';
import UDIVis from './UDIVis.vue';

// Demonstrates the consumer-supplied `palette` prop: categorical colors, a
// continuous color ramp supplied as a scheme name / color array / function,
// and the fact that a spec-level `range` still overrides the palette.

export default {
  component: UDIVis,
  tags: ['autodocs'],
  title: 'Color Palettes',
};

// A stacked bar whose color encodes a categorical field — exercises
// `config.range.category`.
const categoricalSpec = {
  source: { name: 'datasets', source: './data/datasets.csv' },
  transformation: [
    { groupby: 'assay_category' },
    { rollup: { count: { op: 'count' } } },
  ],
  representation: {
    mark: 'bar',
    mapping: [
      { encoding: 'x', field: 'count', type: 'quantitative' },
      { encoding: 'color', field: 'assay_category', type: 'nominal' },
    ],
  },
};

// A rect heatmap whose color encodes a numeric count — exercises the
// continuous `config.range.ramp`.
const heatmapSpec = {
  source: { name: 'datasets', source: './data/datasets.csv' },
  transformation: [
    { groupby: ['origin_samples_unique_mapped_organs', 'assay_category'] },
    { rollup: { count: { op: 'count' } } },
  ],
  representation: {
    mark: 'rect',
    mapping: [
      { encoding: 'x', field: 'assay_category', type: 'nominal' },
      {
        encoding: 'y',
        field: 'origin_samples_unique_mapped_organs',
        type: 'nominal',
      },
      { encoding: 'color', field: 'count', type: 'quantitative' },
    ],
  },
};

// ── Categorical ─────────────────────────────────────────────────────────────

/** Baseline: no palette → the toolkit's built-in default colors. */
export const CategoricalDefault = {
  args: { spec: categoricalSpec },
};

/** Custom categorical colors supplied as an array. */
export const CategoricalCustomColors = {
  args: {
    spec: categoricalSpec,
    palette: {
      category: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02'],
    },
  },
};

/** Categorical colors supplied as a named Vega scheme. */
export const CategoricalSchemeName = {
  args: {
    spec: categoricalSpec,
    palette: { category: 'tableau20' },
  },
};

/** A spec-level per-encoding `range` overrides the palette's category colors. */
export const SpecRangeOverridesPalette = {
  args: {
    spec: {
      ...categoricalSpec,
      representation: {
        mark: 'bar',
        mapping: [
          { encoding: 'x', field: 'count', type: 'quantitative' },
          {
            encoding: 'color',
            field: 'assay_category',
            type: 'nominal',
            range: ['#000000', '#444444', '#888888', '#bbbbbb'],
          },
        ],
      },
    },
    palette: { category: ['#1b9e77', '#d95f02', '#7570b3'] },
  },
};

// ── Continuous (numeric) ────────────────────────────────────────────────────

/** Baseline: no palette → the toolkit's default ramp. */
export const ContinuousDefault = {
  args: { spec: heatmapSpec },
};

/** Continuous ramp supplied as an array of colors (interpolated). */
export const ContinuousArrayRamp = {
  args: {
    spec: heatmapSpec,
    palette: { ramp: ['#eafab9', '#528aeb', '#0b1d6b'] },
  },
};

/** Continuous ramp supplied as a named Vega scheme. */
export const ContinuousSchemeRamp = {
  args: {
    spec: heatmapSpec,
    palette: { ramp: 'magma' },
  },
};

/**
 * Continuous ramp supplied as a JS interpolator function `(t) => color`.
 * This form is impossible to express in the grammar JSON — it only works
 * because the palette is passed as a separate (non-cloned) prop.
 */
export const ContinuousFunctionRamp = {
  args: {
    spec: heatmapSpec,
    palette: { ramp: (t: number) => interpolateViridis(t) },
  },
};

// ── Table renderer ──────────────────────────────────────────────────────────

/**
 * The same palette also drives the table cell renderer. Here a row layer
 * colors a rect cell by a numeric field using a function ramp.
 */
export const TableFunctionRamp = {
  args: {
    spec: {
      source: { name: 'donors', source: './data/donors.csv' },
      transformation: [{ orderby: 'weight_value' }],
      representation: {
        mark: 'row',
        mapping: [
          { mark: 'text', encoding: 'text', field: 'sex', type: 'nominal' },
          {
            column: 'weight',
            mark: 'rect',
            encoding: 'color',
            field: 'weight_value',
            type: 'quantitative',
          },
        ],
      },
    },
    palette: { ramp: (t: number) => interpolateViridis(t) },
  },
};
