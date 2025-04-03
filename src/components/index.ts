import ParserComponent from './ParserComponent.vue';
import TableComponent from './TableComponent.vue';
import VegaLite from './VegaLite.vue';

export { ParserComponent, TableComponent, VegaLite };

export function install(app: any) {
  app.component('ParserComponent', ParserComponent);
  app.component('TableComponent', TableComponent);
  app.component('VegaLite', VegaLite);
}
