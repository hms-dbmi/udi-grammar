import type { UDIGrammar } from './dist/GrammarTypes';
import type { DataSelections } from './dist/DataSourcesStore';
import type {
  QueryDataSpec,
  QueryDataResult,
  QueryDataOptions,
} from './dist/ce-entry';
import type {
  SourceSpec,
  LoadDataPackageOptions,
} from './dist/loadDataPackage';
import type {
  DataFieldDomain,
  IntervalDomain,
  CategoricalDomain,
} from './dist/domainTypes';

export declare const UDIVisElement: CustomElementConstructor;

/**
 * Headless data query against the shared DataSourcesStore. Loads any
 * uncached sources, applies the transformation pipeline, and returns
 * the result — no chart mounted.
 */
export declare function queryData(
  spec: QueryDataSpec,
  selections?: DataSelections,
  options?: QueryDataOptions,
): Promise<QueryDataResult | null>;

/**
 * Fetch each CSV exactly once, seed the shared DataSourcesStore (so
 * subsequent <udi-vis> renders reuse the parsed table instead of
 * re-fetching), and stream per-field domains back via callbacks. The
 * domain computation runs in a Web Worker; falls back to the main
 * thread if Worker construction throws.
 */
export declare function loadDataPackage(
  sources: SourceSpec[],
  options?: LoadDataPackageOptions,
): Promise<void>;

export type {
  UDIGrammar,
  DataSelections,
  QueryDataSpec,
  QueryDataResult,
  QueryDataOptions,
  SourceSpec,
  LoadDataPackageOptions,
  DataFieldDomain,
  IntervalDomain,
  CategoricalDomain,
};
