import { defineBoot } from '#q-app/wrappers';
import { install as VueMonacoEditorPlugin } from '@guolao/vue-monaco-editor';

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli-vite/boot-files
export default defineBoot(({ app }) => {
  app.use(VueMonacoEditorPlugin, {
    paths: {
      // You can change the CDN config to load other versions
      vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs',
    },
  });
});
