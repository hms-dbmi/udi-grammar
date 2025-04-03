// .storybook/preview.ts

import { type Preview, setup } from '@storybook/vue3';

import { type App } from 'vue';

import { createPinia } from 'pinia';
import UDIVis from '../src/components/UDIVis.vue';
import TableComponent from '../src/components/TableComponent.vue';

setup((app: App) => {
  app
    .use(createPinia())
    .component('UDIVis', UDIVis)
    .component('TableComponent', TableComponent);
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
