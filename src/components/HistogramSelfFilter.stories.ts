// Stories for a single histogram whose own interval brush filters itself.
// Use these to verify that bin edges stay fixed while only per-bin counts
// change as the user drags the brush. Each variant exercises one axis of
// the histogram spec (default vs explicit bin count, nice toggle,
// domainWhenFiltered y-axis behavior, string filter in the pipeline,
// inline bin()/bins() expression form).
import TestIntervalFilterHooks from './TestIntervalFilterHooks.vue';

export default {
  component: TestIntervalFilterHooks,
  tags: ['autodocs'],
  title: 'HistogramSelfFilter',
};

const donorsSource = {
  name: 'donors',
  source: './data/donors.csv',
};

const weightSelection = {
  selectionName: 'weight-select',
  entity: 'donors',
  field: 'weight_value',
  minValue: 0,
  maxValue: 160,
};

const weightBrush = {
  name: 'weight-select',
  how: {
    type: 'interval',
    on: 'x',
    field: ['weight_value'],
  },
};

// Baseline: binby with defaults (no explicit bins, nice defaults to true,
// no domainWhenFiltered). The fix should keep bin edges fixed as the brush
// narrows the data; only counts change.
export const SelfFilterHistogramDefault = {
  args: {
    testType: 'linked',
    selections: [weightSelection],
    spec: {
      source: donorsSource,
      transformation: [
        { filter: { name: 'weight-select' } },
        {
          binby: {
            field: 'weight_value',
            output: { bin_start: 'start', bin_end: 'end' },
          },
        },
        { rollup: { count: { op: 'count' } } },
      ],
      representation: {
        mark: 'rect',
        mapping: [
          {
            encoding: 'x',
            field: 'start',
            type: 'quantitative',
            title: 'weight_value',
          },
          { encoding: 'x2', field: 'end', type: 'quantitative' },
          { encoding: 'y', field: 'count', type: 'quantitative' },
        ],
        select: weightBrush,
      },
    },
  },
};

// nice: false — bins snap to the exact data extent rather than nice
// human-friendly boundaries. Edges should still stay fixed under filtering.
export const SelfFilterHistogramNiceOff = {
  args: {
    testType: 'linked',
    selections: [weightSelection],
    spec: {
      source: donorsSource,
      transformation: [
        { filter: { name: 'weight-select' } },
        {
          binby: {
            field: 'weight_value',
            bins: 10,
            nice: false,
            output: { bin_start: 'start', bin_end: 'end' },
          },
        },
        { rollup: { count: { op: 'count' } } },
      ],
      representation: {
        mark: 'rect',
        mapping: [
          {
            encoding: 'x',
            field: 'start',
            type: 'quantitative',
            title: 'weight_value',
          },
          { encoding: 'x2', field: 'end', type: 'quantitative' },
          { encoding: 'y', field: 'count', type: 'quantitative' },
        ],
        select: weightBrush,
      },
    },
  },
};

// Custom (finer) bin count: exercises the maxbins path. More bins should
// also remain stable under filtering.
export const SelfFilterHistogramManyBins = {
  args: {
    testType: 'linked',
    selections: [weightSelection],
    spec: {
      source: donorsSource,
      transformation: [
        { filter: { name: 'weight-select' } },
        {
          binby: {
            field: 'weight_value',
            bins: 30,
            nice: true,
            output: { bin_start: 'start', bin_end: 'end' },
          },
        },
        { rollup: { count: { op: 'count' } } },
      ],
      representation: {
        mark: 'rect',
        mapping: [
          {
            encoding: 'x',
            field: 'start',
            type: 'quantitative',
            title: 'weight_value',
          },
          { encoding: 'x2', field: 'end', type: 'quantitative' },
          { encoding: 'y', field: 'count', type: 'quantitative' },
        ],
        select: weightBrush,
      },
    },
  },
};

// Coarse bin count — complement to SelfFilterHistogramManyBins.
export const SelfFilterHistogramFewBins = {
  args: {
    testType: 'linked',
    selections: [weightSelection],
    spec: {
      source: donorsSource,
      transformation: [
        { filter: { name: 'weight-select' } },
        {
          binby: {
            field: 'weight_value',
            bins: 5,
            nice: true,
            output: { bin_start: 'start', bin_end: 'end' },
          },
        },
        { rollup: { count: { op: 'count' } } },
      ],
      representation: {
        mark: 'rect',
        mapping: [
          {
            encoding: 'x',
            field: 'start',
            type: 'quantitative',
            title: 'weight_value',
          },
          { encoding: 'x2', field: 'end', type: 'quantitative' },
          { encoding: 'y', field: 'count', type: 'quantitative' },
        ],
        select: weightBrush,
      },
    },
  },
};

// domainWhenFiltered: 'full' on the count axis — y-axis is fixed to the
// unfiltered max so bar heights shrink within a stable chart frame.
// Complements SelfFilterHistogramDefault, which lets the y-axis rescale.
export const SelfFilterHistogramDomainFull = {
  args: {
    testType: 'linked',
    selections: [weightSelection],
    spec: {
      source: donorsSource,
      transformation: [
        { filter: { name: 'weight-select' } },
        {
          binby: {
            field: 'weight_value',
            bins: 10,
            nice: true,
            output: { bin_start: 'start', bin_end: 'end' },
          },
        },
        { rollup: { count: { op: 'count' } } },
      ],
      representation: {
        mark: 'rect',
        mapping: [
          {
            encoding: 'x',
            field: 'start',
            type: 'quantitative',
            title: 'weight_value',
          },
          { encoding: 'x2', field: 'end', type: 'quantitative' },
          {
            encoding: 'y',
            field: 'count',
            type: 'quantitative',
            domainWhenFiltered: 'full',
          },
        ],
        select: weightBrush,
      },
    },
  },
};

// domainWhenFiltered: 'filtered' — y-axis rescales to the current
// filtered counts (matches the existing ReadWriteFilterStateXHistogram
// story). Bin edges should still be stable; only bar heights move.
export const SelfFilterHistogramDomainFiltered = {
  args: {
    testType: 'linked',
    selections: [weightSelection],
    spec: {
      source: donorsSource,
      transformation: [
        { filter: { name: 'weight-select' } },
        {
          binby: {
            field: 'weight_value',
            bins: 10,
            nice: true,
            output: { bin_start: 'start', bin_end: 'end' },
          },
        },
        { rollup: { count: { op: 'count' } } },
      ],
      representation: {
        mark: 'rect',
        mapping: [
          {
            encoding: 'x',
            field: 'start',
            type: 'quantitative',
            title: 'weight_value',
          },
          { encoding: 'x2', field: 'end', type: 'quantitative' },
          {
            encoding: 'y',
            field: 'count',
            type: 'quantitative',
            domainWhenFiltered: 'filtered',
          },
        ],
        select: weightBrush,
      },
    },
  },
};

// Static string filter precedes the self-filter. The bin edges should be
// computed from the post-string-filter, pre-named-filter data so a fixed
// data trim (e.g. dropping outliers) is respected while the brush still
// does not shift bins.
export const SelfFilterHistogramWithStringFilter = {
  args: {
    testType: 'linked',
    selections: [weightSelection],
    spec: {
      source: donorsSource,
      transformation: [
        { filter: "d['weight_value'] >= 30 && d['weight_value'] <= 130" },
        { filter: { name: 'weight-select' } },
        {
          binby: {
            field: 'weight_value',
            bins: 10,
            nice: true,
            output: { bin_start: 'start', bin_end: 'end' },
          },
        },
        { rollup: { count: { op: 'count' } } },
      ],
      representation: {
        mark: 'rect',
        mapping: [
          {
            encoding: 'x',
            field: 'start',
            type: 'quantitative',
            title: 'weight_value',
          },
          { encoding: 'x2', field: 'end', type: 'quantitative' },
          { encoding: 'y', field: 'count', type: 'quantitative' },
        ],
        select: weightBrush,
      },
    },
  },
};

// Inline bin()/bins() expression form via a raw groupby. This mirrors the
// "Default" story in Histogram.stories.ts and is the low-level alternative
// to binby. NOTE: inline expressions are evaluated per-query against the
// current (filtered) column, so bin edges WILL shift as the brush drags.
// Included intentionally so reviewers can contrast it with the stable
// binby variants above and choose binby for interactive histograms.
export const SelfFilterHistogramInlineBinExpression = {
  args: {
    testType: 'linked',
    selections: [weightSelection],
    spec: {
      source: donorsSource,
      transformation: [
        { filter: { name: 'weight-select' } },
        {
          groupby: {
            start: `d => op.bin(d['weight_value'], ...op.bins(d['weight_value'], 10), 0)`,
            end: `d => op.bin(d['weight_value'], ...op.bins(d['weight_value'], 10), 1)`,
          },
        },
        { rollup: { count: { op: 'count' } } },
      ],
      representation: {
        mark: 'rect',
        mapping: [
          {
            encoding: 'x',
            field: 'start',
            type: 'quantitative',
            title: 'weight_value',
          },
          { encoding: 'x2', field: 'end', type: 'quantitative' },
          { encoding: 'y', field: 'count', type: 'quantitative' },
        ],
        select: weightBrush,
      },
    },
  },
};
