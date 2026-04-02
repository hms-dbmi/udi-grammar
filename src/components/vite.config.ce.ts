import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: './ce-entry.ts',
      name: 'UDIVisCE',
      fileName: 'ce',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      // Heavy visualization deps stay external — consumers bring their own.
      // Vue and Pinia are bundled so non-Vue consumers don't need them.
      external: [
        'fast-kde',
        'arquero',
        'vega',
        'vega-embed',
        'vega-lite',
        'ag-grid-community',
        'ag-grid-vue3',
      ],
      output: {
        globals: {
          'fast-kde': 'fastKDE',
          'vega-embed': 'vegaEmbed',
          'vega-lite': 'vegaLite',
          vega: 'vega',
          arquero: 'arquero',
          'ag-grid-community': 'agGrid',
          'ag-grid-vue3': 'AgGridVue3',
        },
      },
    },
  },
  plugins: [
    vue(),
    tsConfigPaths(),
    // Types for CE are provided via a hand-written ce.d.ts (see dist/ce.d.ts)
    // because the rollupTypes option conflicts with api-extractor for custom element definitions.
  ],
});
