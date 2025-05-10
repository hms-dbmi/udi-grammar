import { createPinia, getActivePinia } from 'pinia';
import UDIVis from './UDIVis.vue';
import TableComponent from './TableComponent.vue';
import VegaLite from './VegaLite.vue';
import UDICellRenderer from './UDICellRenderer.vue';

const UDIToolkit = {
  install(app: any) {
    // Ensure Pinia is initialized before adding components
    if (!getActivePinia()) {
      const pinia = createPinia();
      app.use(pinia);
    }

    app.component('UDIVis', UDIVis);
    app.component('VegaLite', VegaLite);
    app.component('TableComponent', TableComponent);
    app.component('UDICellRenderer', UDICellRenderer);
  },
};
export { UDIToolkit, UDIVis, TableComponent, VegaLite };
