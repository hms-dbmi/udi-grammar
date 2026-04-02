import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tsConfigPaths from 'vite-tsconfig-paths';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: './react-wrapper/index.ts',
      fileName: 'react',
      formats: ['es'],
    },
    rollupOptions: {
      // React is external — consumers have it.
      // Heavy viz deps are external — same as the CE build.
      // Vue and Pinia are bundled (via ce-entry → UDIVis.vue chain).
      external: [
        'react',
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
          react: 'React',
        },
        chunkFileNames: '[name].js',
      },
    },
  },
  plugins: [
    vue(),
    tsConfigPaths(),
    dts({ tsconfigPath: 'tsconfig.react.json' }),
  ],
});
