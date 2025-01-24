// .storybook/preview.ts

import { type Preview, setup } from '@storybook/vue3';

import { type App } from 'vue';

import { createPinia } from 'pinia';
import TableComponent from '../src/components/TableComponent.vue';
import OrganMapComponent from '../src/components/OrganMapComponent.vue';
import FilterPanelComponent from '../src/components/FilterPanelComponent.vue';

setup((app: App) => {
  app
    .use(createPinia())
    .component('TableComponent', TableComponent)
    .component('OrganMapComponent', OrganMapComponent)
    .component('FilterPanelComponent', FilterPanelComponent);
});

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'light',
    },
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};
