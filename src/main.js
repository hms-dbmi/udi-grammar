import { createApp } from 'vue';
import { createPinia } from 'pinia';
import TableComponent from './components/TableComponent.vue';
import OrganMapComponent from './components/OrganMapComponent.vue';
import FilterPanelComponent from './components/FilterPanelComponent.vue';
import App from './App.vue';

import './assets/main.css';

createApp(App)
  .use(createPinia())
  .component('TableComponent', TableComponent)
  .component('OrganMapComponent', OrganMapComponent)
  .component('FilterPanelComponent', FilterPanelComponent)
  .mount('#app');
