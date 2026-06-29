import { createPinia, getActivePinia, type Pinia } from 'pinia';
import type { App } from 'vue';
import UDIVis from './UDIVis.vue';
import TableComponent from './TableComponent.vue';
import VegaLite from './VegaLite.vue';
import UDICellRenderer from './UDICellRenderer.vue';
import UDIToolkitProvider from './UDIToolkitProvider.vue';

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
    app.component('UDIToolkitProvider', UDIToolkitProvider);
  },
};
export { UDIToolkit, UDIVis, TableComponent, VegaLite, UDIToolkitProvider };

// Vue provide/inject key for advanced consumers who want to build their own
// composable wrappers around the provided palette without re-deriving the key.
export { UDI_PALETTE_KEY } from './paletteInjectKey';

// Data-package loader types so callers passing `dataPackage` to the provider
// can name the shape.
export type { SourceSpec, LoadDataPackageOptions } from './loadDataPackage';

// Color palette API
export { DEFAULT_PALETTE } from './Palette';
export type { UDIPalette, ContinuousColor, DiscreteColor } from './Palette';

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
