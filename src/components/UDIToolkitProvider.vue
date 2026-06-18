<script setup lang="ts">
import { provide, toRef, watch, onBeforeUnmount } from 'vue';
import { getActivePinia } from 'pinia';
import { UDI_PALETTE_KEY } from './paletteInjectKey';
import {
  loadDataPackage,
  type SourceSpec,
  type LoadDataPackageOptions,
} from './loadDataPackage';
import type { UDIPalette } from './Palette';

interface DataPackageConfig extends LoadDataPackageOptions {
  /** Sources to fetch + cache. */
  sources: SourceSpec[];
}

interface UDIToolkitProviderProps {
  /**
   * Default palette inherited by every nested `UDIVis` / `TableComponent`.
   * A descendant's own `palette` prop still wins.
   */
  palette?: UDIPalette;
  /**
   * Optional data-package descriptor — when provided the provider will fetch
   * the listed CSVs once on mount (and again any time `sources` identity
   * changes), seed the shared DataSourcesStore, and stream per-field domains
   * back through `onEntityDomains`. Consumers that already drive the load
   * themselves can omit this and the provider stays palette-only.
   */
  dataPackage?: DataPackageConfig;
}

const props = defineProps<UDIToolkitProviderProps>();

// Provide a Ref (rather than the value) so descendants see prop swaps —
// e.g. a host that toggles light/dark palette at runtime.
provide(UDI_PALETTE_KEY, toRef(props, 'palette'));

// Track in-flight loads so a fast prop swap doesn't apply a stale result.
// We don't currently have a cancel hook on loadDataPackage; this token gate
// is the next best thing.
let loadToken = 0;

watch(
  () => props.dataPackage,
  (cfg) => {
    if (!cfg) return;
    const pinia = getActivePinia();
    if (!pinia) {
      console.warn(
        '[UDIToolkitProvider] No active Pinia — `dataPackage` was supplied ' +
          'but loadDataPackage requires Pinia to be installed. Did you forget ' +
          '`app.use(UDIToolkit)` (or `app.use(createPinia())`)?',
      );
      return;
    }
    const token = ++loadToken;
    const { sources, ...options } = cfg;
    loadDataPackage(pinia, sources, {
      ...options,
      onEntityDomains: (entity, domains) => {
        if (token !== loadToken) return;
        options.onEntityDomains?.(entity, domains);
      },
      onError: (entity, message) => {
        if (token !== loadToken) return;
        options.onError?.(entity, message);
      },
    }).catch((e) => {
      if (token !== loadToken) return;
      const msg = e instanceof Error ? e.message : String(e);
      options.onError?.('', msg);
    });
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  // Invalidate any pending callbacks from in-flight loads.
  loadToken++;
});
</script>

<template>
  <slot />
</template>
