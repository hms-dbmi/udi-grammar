import { createPinia, getActivePinia } from 'pinia';
import UDIVis from './UDIVis.vue';
import TableComponent from './TableComponent.vue';
import VegaLite from './VegaLite.vue';

export { UDIVis, TableComponent, VegaLite };

export function install(app: any) {
  // Ensure Pinia is initialized before adding components
  if (!getActivePinia()) {
    const pinia = createPinia();
    app.use(pinia);
  }

  app.component('UDIVis', UDIVis);
  app.component('TableComponent', TableComponent);
  app.component('VegaLite', VegaLite);
}
