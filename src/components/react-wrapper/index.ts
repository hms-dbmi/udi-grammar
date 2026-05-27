export { UDIVis } from './UDIVis';
export type { UDIVisProps } from './UDIVis';
export type { UDIGrammar } from '../GrammarTypes';
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
