import { createApp } from 'vue';
import UDIVis from 'src/components/UDIVis.vue';
import type { UDIGrammar } from 'src/components/GrammarTypes';

export function embed(el: HTMLElement, spec: UDIGrammar) {
  const app = createApp(UDIVis, { spec });
  app.mount(el);
}
