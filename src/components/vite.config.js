import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tsConfigPaths from 'vite-tsconfig-paths';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: './index.ts',
      name: 'ParserComponent',
      fileName: 'index',
      formats: ['es', 'cjs', 'umd'],
      // fileName: (format) => `udi-grammar.${format}.js`,
    },
    rollupOptions: {
      external: [
        'vue',
        'pinia',
        'fast-kde',
        'arquero',
        'vega',
        'vega-embed',
        'vega-lite',
      ],
      output: {
        globals: {
          vue: 'Vue',
          'fast-kde': 'fastKDE',
          'vega-embed': 'vegaEmbed',
          'vega-lite': 'vegaLite',
          pinia: 'Pinia',
          arquero: 'arquero',
        },
      },
    },
  },
  plugins: [vue(), tsConfigPaths(), dts({ tsconfigPath: 'tsconfig.lib.json' })],
});
