import { createPinia } from 'pinia';
import { defineCustomElement } from 'vue';
import UDIVisComp from './UDIVis.vue';
import type { UDIGrammar } from './GrammarTypes';
import type { DataSelections } from './DataSourcesStore';

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

export { UDIVisElement };
export type { UDIGrammar, DataSelections };
