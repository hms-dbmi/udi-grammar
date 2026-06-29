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
      // React is external — consumers have it. Also externalize the JSX
      // runtime subpaths so vite/rolldown doesn't try to bundle them
      // (UDIToolkitProvider.tsx uses JSX, which the `react-jsx` transform
      // emits as `import { jsx } from 'react/jsx-runtime'`). Heavy viz
      // deps are external — same as the CE build. Vue and Pinia are
      // bundled (via ce-entry → UDIVis.vue chain).
      external: [
        'react',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'arquero',
        'vega',
        'vega-embed',
        'vega-lite',
        'ag-grid-community',
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
