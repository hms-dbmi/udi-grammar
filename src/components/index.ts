import UDIVis from './UDIVis.vue';
import TableComponent from './TableComponent.vue';
import VegaLite from './VegaLite.vue';

export { UDIVis, TableComponent, VegaLite };

export function install(app: any) {
  app.component('UDIVis', UDIVis);
  app.component('TableComponent', TableComponent);
  app.component('VegaLite', VegaLite);
}
