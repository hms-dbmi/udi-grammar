import { createPinia } from 'pinia';
import { defineCustomElement } from 'vue';
import UDIVisComp from './UDIVis.vue';
import type { UDIGrammar, DataSource, DataTransformation } from './GrammarTypes';
import { useDataSourcesStore, type DataSelections } from './DataSourcesStore';
import {
  loadDataPackage as loadDataPackageImpl,
  type SourceSpec,
  type LoadDataPackageOptions,
} from './loadDataPackage';
import type {
  DataFieldDomain,
  IntervalDomain,
  CategoricalDomain,
} from './domainTypes';

// Shared Pinia instance for all <udi-vis> elements on the page.
// This enables cross-chart filtering: all instances share the same
// DataSourcesStore, just like they do in the Vue plugin setup.
const pinia = createPinia();

const UDIVisElement = defineCustomElement(UDIVisComp, {
  shadowRoot: false,
  configureApp(app) {
    app.use(pinia);
  },
});

customElements.define('udi-vis', UDIVisElement);

// ── Data-only query API ──────────────────────────────────────────────────────
// Provides direct access to the Arquero transformation pipeline without
// mounting a UDIVis component. Shares the same DataSourcesStore (and its
// CSV cache + selection state) as all <udi-vis> elements on the page.

export interface QueryDataSpec {
  source: DataSource | DataSource[];
  transformation?: DataTransformation[];
}

export interface QueryDataResult {
  displayData: object[];
  allData: object[];
  isSubset: boolean;
}

export interface QueryDataOptions {
  /** Maps entity names → canonical URLs, overriding URLs embedded in the spec. */
  sourceResolver?: Record<string, string>;
  /** Skip materializing the full unfiltered table for `allData`. When true,
   *  `allData` shares its reference with `displayData`. Use this when the
   *  caller only reads `displayData` (e.g. count chips, rollup queries) —
   *  the second pipeline pass is the most expensive part of getDataObject. */
  displayDataOnly?: boolean;
}

/**
 * Run a data query against the shared DataSourcesStore.
 *
 * Loads any uncached CSVs, applies the transformation pipeline (including
 * named filters from active selections), and returns the result.
 *
 * @param spec  A grammar-like object with `source` and optional `transformation`.
 * @param selections  Optional external selections to bind before querying.
 * @param options  Optional per-call options (sourceResolver, displayDataOnly).
 * @returns The transformed data, or `null` if sources are still loading.
 */
export async function queryData(
  spec: QueryDataSpec,
  selections?: DataSelections,
  options?: QueryDataOptions,
): Promise<QueryDataResult | null> {
  const store = useDataSourcesStore(pinia);

  const sources: DataSource[] = Array.isArray(spec.source) ? spec.source : [spec.source];

  await store.initDataSources(sources, options?.sourceResolver);

  if (selections) {
    store.bindExternalDataSelections(selections);
  }

  const result = store.getDataObject(
    sources.map((s) => s.name),
    spec.transformation,
    { displayDataOnly: options?.displayDataOnly === true },
  );

  if (!result) return null;

  return {
    displayData: result.displayData,
    allData: result.allData,
    isSubset: result.isDisplayDataSubset,
  };
}

/**
 * Fetch a set of CSVs exactly once, seed the shared DataSourcesStore so
 * any <udi-vis> / queryData call reuses the parsed tables, and stream
 * per-entity domains back via callbacks.
 */
export function loadDataPackage(
  sources: SourceSpec[],
  options?: LoadDataPackageOptions,
): Promise<void> {
  return loadDataPackageImpl(pinia, sources, options);
}

export { UDIVisElement };
export type { UDIGrammar, DataSelections };
export type {
  SourceSpec,
  LoadDataPackageOptions,
  DataFieldDomain,
  IntervalDomain,
  CategoricalDomain,
};
