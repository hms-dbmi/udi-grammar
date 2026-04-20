import { createPinia } from 'pinia';
import { defineCustomElement } from 'vue';
import UDIVisComp from './UDIVis.vue';
import type { UDIGrammar, DataSource, DataTransformation } from './GrammarTypes';
import { useDataSourcesStore, type DataSelections } from './DataSourcesStore';

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

/**
 * Run a data query against the shared DataSourcesStore.
 *
 * Loads any uncached CSVs, applies the transformation pipeline (including
 * named filters from active selections), and returns the result.
 *
 * @param spec  A grammar-like object with `source` and optional `transformation`.
 * @param selections  Optional external selections to bind before querying.
 * @returns The transformed data, or `null` if sources are still loading.
 */
export async function queryData(
  spec: QueryDataSpec,
  selections?: DataSelections,
  sourceResolver?: Record<string, string>,
): Promise<QueryDataResult | null> {
  const store = useDataSourcesStore(pinia);

  const sources: DataSource[] = Array.isArray(spec.source) ? spec.source : [spec.source];

  await store.initDataSources(sources, sourceResolver);

  if (selections) {
    store.bindExternalDataSelections(selections);
  }

  const result = store.getDataObject(
    sources.map((s) => s.name),
    spec.transformation,
  );

  if (!result) return null;

  return {
    displayData: result.displayData,
    allData: result.allData,
    isSubset: result.isDisplayDataSubset,
  };
}

export { UDIVisElement };
export type { UDIGrammar, DataSelections };
