import UDIToolkitProvider from './UDIToolkitProvider.vue';
import UDIVis from './UDIVis.vue';

// Demonstrates the UDIToolkitProvider's two responsibilities:
// 1. Holds a default palette that every nested <UDIVis> inherits, so the
//    host doesn't have to thread `palette` through every chart.
// 2. With per-instance `palette` props still winning, so a single override
//    chart can opt out without reconfiguring the provider.

export default {
  component: UDIToolkitProvider,
  tags: ['autodocs'],
  title: 'Provider',
};

const barSpec = {
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
      { encoding: 'y', field: 'origin_samples_unique_mapped_organs', type: 'nominal' },
      { encoding: 'color', field: 'count', type: 'quantitative' },
    ],
  },
};

const customPalette = {
  category: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02'],
  ramp: 'magma',
};

const overridePalette = {
  category: ['#000000'],
};

/**
 * The Provider supplies a single palette to two unrelated charts. Both
 * inherit the categorical colors without per-chart wiring — verifies the
 * inherit-once-from-the-root use case.
 */
export const SharedPalette = {
  args: { palette: customPalette },
  render: (args: { palette: typeof customPalette }) => ({
    components: { UDIToolkitProvider, UDIVis },
    setup() {
      return { args, barSpec, heatmapSpec };
    },
    template: `
      <UDIToolkitProvider :palette="args.palette">
        <div style="display:flex; flex-direction:column; gap:24px;">
          <UDIVis :spec="barSpec" />
          <UDIVis :spec="heatmapSpec" />
        </div>
      </UDIToolkitProvider>
    `,
  }),
};

/**
 * A per-instance `palette` prop wins over the provider's default. The first
 * chart inherits the provider palette; the second injects an all-black
 * categorical override.
 */
export const PerInstanceOverride = {
  args: { palette: customPalette, override: overridePalette },
  render: (args: { palette: typeof customPalette; override: typeof overridePalette }) => ({
    components: { UDIToolkitProvider, UDIVis },
    setup() {
      return { args, barSpec, heatmapSpec };
    },
    template: `
      <UDIToolkitProvider :palette="args.palette">
        <div style="display:flex; flex-direction:column; gap:24px;">
          <UDIVis :spec="barSpec" />
          <UDIVis :spec="heatmapSpec" :palette="args.override" />
        </div>
      </UDIToolkitProvider>
    `,
  }),
};

/**
 * Provider with no palette set behaves identically to placing `<UDIVis>` at
 * the root — descendants fall through to the toolkit's DEFAULT_PALETTE.
 * Confirms the provider is purely additive.
 */
export const NoPaletteFallthrough = {
  render: () => ({
    components: { UDIToolkitProvider, UDIVis },
    setup() {
      return { barSpec };
    },
    template: `
      <UDIToolkitProvider>
        <UDIVis :spec="barSpec" />
      </UDIToolkitProvider>
    `,
  }),
};
