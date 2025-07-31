import { createApp, h } from 'vue';
import { createPinia } from 'pinia';

import UDIVis from './UDIVis.vue';
import type { UDIGrammar } from './GrammarTypes';

export function embed(el: HTMLElement, spec: UDIGrammar) {
  if (!el) {
    throw new Error('Target element not provided.');
  }

  // Unmount any existing app
  if ((el as any).__vue_app__) {
    (el as any).__vue_app__.unmount();
    delete (el as any).__vue_app__;
  }

  const app = createApp({
    render() {
      return h(UDIVis, { spec });
    },
  });

  const pinia = createPinia();
  app.use(pinia); 

  app.mount(el);

  (el as any).__vue_app__ = app;
}

if (typeof window !== 'undefined') {
  (window as any).UDIEmbed = { embed };
}
