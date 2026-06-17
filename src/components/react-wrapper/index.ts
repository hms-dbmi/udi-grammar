export { UDIVis } from './UDIVis';
export type { UDIVisProps } from './UDIVis';
export type { UDIGrammar } from '../GrammarTypes';
// Types only — re-exporting the DEFAULT_PALETTE *value* here would statically
// pull Palette.ts (and its non-externalized d3-scale import) into the react
// entry, which makes Rollup split it into a chunk named `index.js` that
// clobbers the Vue build's `dist/index.js`. The value is still exported from
// the main (`udi-toolkit`) and `udi-toolkit/ce` entries.
export type { UDIPalette, ContinuousColor, DiscreteColor } from '../Palette';
export type { DataSelections, ActiveDataSelection as DataSelection, RangeSelection, PointSelection } from '../DataSourcesStore';
export { queryData } from './queryData';
export type { QueryDataSpec, QueryDataResult, QueryDataOptions } from '../ce-entry';
export { loadDataPackage } from './loadDataPackage';
export type { SourceSpec, LoadDataPackageOptions } from '../loadDataPackage';
export { subscribeToSelections, clearAllSelections } from './selections';
export type {
  DataFieldDomain,
  IntervalDomain,
  CategoricalDomain,
} from '../domainTypes';
