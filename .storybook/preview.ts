// .storybook/preview.ts

import { type Preview, setup } from '@storybook/vue3';

import { type App } from 'vue';

import { createPinia } from 'pinia';
import ParserComponent from '../src/components/ParserComponent.vue';
import TableComponent from '../src/components/TableComponent.vue';

setup((app: App) => {
  app
    .use(createPinia())
    .component('ParserComponent', ParserComponent)
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
