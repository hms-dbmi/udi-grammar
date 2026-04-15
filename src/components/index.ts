import { createPinia, getActivePinia, type Pinia } from 'pinia';
import type { App } from 'vue';
import UDIVis from './UDIVis.vue';
import TableComponent from './TableComponent.vue';
import VegaLite from './VegaLite.vue';
import UDICellRenderer from './UDICellRenderer.vue';

const UDIToolkit = {
  install(app: App) {
    // Ensure Pinia is initialized before adding components
    if (!getActivePinia()) {
      const pinia: Pinia = createPinia();
      app.use(pinia);
    }

    app.component('UDIVis', UDIVis);
    app.component('VegaLite', VegaLite);
    app.component('TableComponent', TableComponent);
    app.component('UDICellRenderer', UDICellRenderer);
  },
};
export { UDIToolkit, UDIVis, TableComponent, VegaLite };

// Grammar spec types
export type {
  UDIGrammar,
  Representation,
  Representations,
  DataSource,
  DataTransformation,
  DataSelection,
  VisualizationLayer,
  RowLayer,
} from './GrammarTypes';

export type {
  ActiveDataSelection,
  DataSelections,
  RangeSelection,
  PointSelection,
} from './DataSourcesStore';
