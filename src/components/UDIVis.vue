<script setup lang="ts">
import { ref, computed, watch, onMounted, defineEmits, useSlots } from 'vue';
import VegaLite from './VegaLite.vue';
import TableComponent from './TableComponent.vue';
import { type ParsedUDIGrammar, parseSpecification } from './Parser';
import type { DataSelection, UDIGrammar, VisualizationLayer } from './GrammarTypes';
import type { DataSelections, RangeSelection } from './DataSourcesStore';
import { useDataSourcesStore } from './DataSourcesStore';
const dataSourcesStore = useDataSourcesStore();
import { storeToRefs } from 'pinia';
import { debounce } from 'lodash';

const { loading, selectionHash } = storeToRefs(dataSourcesStore);

export interface ParserProps {
  spec: UDIGrammar;
  selections?: DataSelections;
  /** Map entity names to canonical data URLs, overriding whatever the spec contains. */
  sourceResolver?: Record<string, string>;
}

// Expose data selections to parent component
const emit = defineEmits<{
  (e: 'selectionChange', selection: DataSelections): void;
  (e: 'dataReady', payload: { data: object[] | null; allData: object[] | null; isSubset: boolean }): void;
}>();

const props = defineProps<ParserProps>();

const parsedSpec = ref<ParsedUDIGrammar | null>(null);
// Per-instance flag: true once this instance's own data sources have been
// loaded via initDataSources.  The shared [loading, selectionHash] watcher
// must not trigger buildVisualization before this — other UDIVis instances
// sharing the same Pinia store can flip `loading` before our data is ready.
const instanceReady = ref(false);

const isVegaLiteComponent = ref<boolean>(false);
const vegaLiteSpec = ref<string>('');
onMounted(() => {
  render();
});

async function render() {
  // console.log('udivis render');
  if (!props.spec) return; // CE may mount before spec prop is set
  instanceReady.value = false;
  // Deep clone props.spec so internal mutations (e.g. setDefaultDomains
  // adding mapping.domain) don't leak back through the CE props to the
  // host (React) — which would otherwise trigger a re-mount and lose
  // the brush/selection state.
  parsedSpec.value = parseSpecification(JSON.parse(JSON.stringify(props.spec)));
  // Load data sources BEFORE binding selections — binding can change
  // selectionHash which triggers the [loading, selectionHash] watcher.
  // If data isn't loaded yet that watcher would hit empty dataSources.
  await dataSourcesStore.initDataSources(parsedSpec.value.source, props.sourceResolver);
  instanceReady.value = true;
  if (props.selections) {
    dataSourcesStore.bindExternalDataSelections(props.selections);
  }
  scheduleBuild();
}

watch(
  () => props.spec,
  () => {
    render();
  },
);

watch(
  () => props.selections,
  () => {
    if (props.selections) {
      dataSourcesStore.bindExternalDataSelections(props.selections);
    }
  },
  { deep: true },
);

watch(selectionHash, () => {
  // console.log('UDI-VIS: SelectionHash changed');
  const currentDataSelections = dataSourcesStore.dataSelections;
  // console.log('emit selection change');
  // console.log(currentDataSelections);
  emit('selectionChange', currentDataSelections);
});

const debounceValue = computed(() => {
  return props.spec?.config?.debounce ?? 0;
});

const debouncedBuildVisualization = debounce(
  () => buildVisualization(),
  debounceValue.value,
);

// Coalesce multiple rapid triggers (selectionHash change, spec prop change,
// etc.) into a single build on the next microtask.  Without this, a brush
// can trigger buildVisualization three times: once for selectionHash,
// once for the subsequent spec change (from updateSpecFilters), and
// potentially once more from the selections prop.  Only the last version
// of props.spec matters — earlier ones may still have stale transformations.
let buildScheduled = false;
function scheduleBuild() {
  if (buildScheduled) return;
  buildScheduled = true;
  queueMicrotask(() => {
    buildScheduled = false;
    buildVisualization();
  });
}

watch([loading, selectionHash], () => {
  // Don't react to store-wide loading changes until this instance's own
  // data sources have been loaded (see instanceReady above).
  if (!instanceReady.value) return;
  if (debounceValue.value === 0) {
    scheduleBuild();
    return;
  }
  debouncedBuildVisualization();
});

function buildVisualization(): void {
  if (!props.spec) {
    return;
  }
  // Re-parse from a fresh clone so any prior domain mutations (from
  // setDefaultDomains during a previous subset state) don't persist
  // when the filter is cleared.
  parsedSpec.value = parseSpecification(JSON.parse(JSON.stringify(props.spec)));

  performDataTransformation(parsedSpec.value);
  if (transformedData.value == null) {
    return;
  }

  // Always lock axis domains to the full data extent. If we only did this
  // when isTransformedDataSubset is true, the initial chart would have a
  // dynamic scale, and when a filter later shrinks the data the scale
  // would recalculate — mismapping the brush pixel coordinates so the
  // brush rectangle appears to disappear / jump around.
  setDefaultDomains(parsedSpec.value, transformedDataFull.value);

  if (isVegaLiteCompatible(parsedSpec.value)) {
    vegaLiteSpec.value = convertToVegaSpec(parsedSpec.value);
    isVegaLiteComponent.value = true;
  } else {
    isVegaLiteComponent.value = false;
  }
  visualizationBuilt.value = true;

  if (!slots.default) {
    emit('dataReady', {
      data: transformedData.value,
      allData: transformedDataFull.value,
      isSubset: isTransformedDataSubset.value,
    });
  }
}

const visualizationBuilt = ref(false);

function setDefaultDomains(
  spec: ParsedUDIGrammar,
  data: object[] | null,
): void {
  if (!data || data.length === 0) return;
  const firstObject = data[0] ?? {};
  const fields = Object.keys(firstObject);
  const numberDomainCache = new Map<string, [number, number]>();
  const catDomainCache = new Map<string, unknown[]>();

  for (const representation of spec.representation) {
    const mark = representation.mark;
    if (!representation.mapping) continue;
    const mappingList = Array.isArray(representation.mapping)
      ? representation.mapping
      : [representation.mapping];
    for (const mapping of mappingList) {
      // @ts-expect-error: I'm checking if domain exists, don't give me a type checking saying domain might not exist.
      if (mapping.domain) {
        // For point marks, verify the pre-set domain covers the data extent
        // and widen it if needed (e.g. when the LLM emits stale domain bounds).
        // For other marks, trust the pre-set domain as-is.
        if (mark !== 'point') continue;
      }
      // @ts-expect-error: I'm checking if domainWhenFiltered exists
      if (mapping.domainWhenFiltered === 'filtered') continue;
      // @ts-expect-error: same, but for field.
      if (!mapping.field) continue;
      // @ts-expect-error: Again...
      const field: string = mapping.field;
      if (!fields.includes(field)) continue;
      // @ts-expect-error: Again...
      if (!mapping.type) continue;
      // @ts-expect-error: Again...
      const type: DataTypes = mapping.type;
      // @ts-expect-error: checking domainWhenFiltered
      const domainWhenFiltered: string | undefined = mapping.domainWhenFiltered;
      if (type === 'quantitative') {
        if (mark === 'bar' && domainWhenFiltered !== 'full') continue;
        if (numberDomainCache.has(field)) {
          // @ts-expect-error: Again...
          const [min, max] = numberDomainCache.get(field);
          if (mark === 'row') {
            // @ts-expect-error: Again...
            mapping.domain = { min, max };
          } else {
            // @ts-expect-error: Again...
            mapping.domain = [min, max];
          }
        } else {
          const values = data
            // @ts-expect-error: Again...
            .map((d) => Number(d[field]))
            .filter((v: number) => isFinite(v));
          if (values.length === 0) continue;
          let min = Math.min(...values);
          // @ts-expect-error: Again...
          if (mark === 'bar') {
            min = Math.min(min, 0);
          }
          // const min = Math.min(...values, 0);
          const max = Math.max(...values);
          const extent = max - min;
          const padding = extent * 0.05;
          let paddedMin = min;
          if (min !== 0) {
            paddedMin = min - padding;
            // Don't cross zero if the data is strictly non-negative.
            // Otherwise an all-positive field (e.g. counts, ages) gets
            // an axis extending to negative values purely from padding.
            if (min >= 0 && paddedMin < 0) {
              paddedMin = 0;
            }
            // Mirror behavior for strictly non-positive data.
            if (max <= 0 && paddedMin > 0) {
              paddedMin = min;
            }
          }
          let paddedMax = max + padding;
          if (max <= 0 && paddedMax > 0) {
            paddedMax = 0;
          }
          // If the mapping already had a pre-set domain (point marks only),
          // widen to encompass both the pre-set range and the data extent.
          // @ts-expect-error: checking existing domain
          if (Array.isArray(mapping.domain) && mapping.domain.length === 2) {
            // @ts-expect-error: reading existing domain
            paddedMin = Math.min(paddedMin, mapping.domain[0]);
            // @ts-expect-error: reading existing domain
            paddedMax = Math.max(paddedMax, mapping.domain[1]);
          }
          if (mark === 'row') {
            // @ts-expect-error: Again...
            mapping.domain = { min: paddedMin, max: paddedMax };
          } else {
            // @ts-expect-error: Again...
            mapping.domain = [paddedMin, paddedMax];
          }
          numberDomainCache.set(field, [paddedMin, paddedMax]);
        }
      } else {
        // TODO, check if row categorical fields work here.
        if (catDomainCache.has(field)) {
          // @ts-expect-error: Again...
          mapping.domain = catDomainCache.get(field);
        } else {
          // @ts-expect-error: Again...
          const values = data.map((d) => d[field]);
          const uniqueValues = Array.from(new Set(values));
          // @ts-expect-error: Again...
          mapping.domain = uniqueValues;
          catDomainCache.set(field, uniqueValues);
        }
      }
    }
  }
}

function isVegaLiteCompatible(spec: ParsedUDIGrammar): boolean {
  return !spec.representation.map((x) => x.mark).includes('row');
}

const transformError = ref();

const transformedData = ref<object[] | null>(null);
const transformedDataFull = ref<object[] | null>(null);
const isTransformedDataSubset = ref<boolean>(false);

function performDataTransformation(spec: ParsedUDIGrammar) {
  try {
    transformError.value = null;
    const dataObjects = dataSourcesStore.getDataObject(
      spec.source.map((x) => x.name),
      spec.transformation,
    );
    // Keep previous data visible while loading/null — avoids "Loading..." flash
    if (dataObjects == null) return;
    const { allData, displayData, isDisplayDataSubset } = dataObjects;

    transformedData.value = displayData;
    transformedDataFull.value = allData;
    isTransformedDataSubset.value = isDisplayDataSubset;
  } catch (error) {
    console.error('Failed to complete data transformation', error);
    transformError.value = error;
    // Clear stale data so the chart renders empty instead of keeping
    // the last successful state.
    transformedData.value = [];
    transformedDataFull.value = [];
  }
}

function convertToVegaSpec(spec: ParsedUDIGrammar): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vegaSpec: any = {
    $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
    // data: { url: './data/penguins.csv' },
    width: 'container',
    // height: 'container',
    data: { name: 'udi_data', values: [] },
  };

  // add data
  try {
    transformError.value = null;
    vegaSpec.data!.values = transformedData.value;
  } catch (error) {
    console.error('Failed to complete data transformation', error);
    transformError.value = error;
  }

  debugVegaData.value = vegaSpec.data.values;

  // add layers
  const inputLayers = spec.representation as VisualizationLayer[];
  if (!Array.isArray(inputLayers)) {
    throw new Error('invalid spec passed to vega conversion');
  }

  const outputLayers = inputLayers.map((layer) => {
    const mapping = Array.isArray(layer.mapping)
      ? layer.mapping
      : [layer.mapping];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vegaEncoding: any = {};
    for (const map of mapping) {
      const { encoding } = map;
      if ('value' in map) {
        vegaEncoding[encoding] = {
          value: map.value,
        };
      } else {
        // escape "." in field names. e.g. "species.name" becomes "species\\.name"
        const escapedField = map.field.replace(/\./g, '\\.');
        vegaEncoding[encoding] = {
          field: escapedField,
          type: map.type,
        };
      }
      if (encoding === 'x' || encoding === 'y' || encoding === 'size') {
        if (vegaEncoding[encoding].scale == null) {
          vegaEncoding[encoding].scale = {};
        }
        vegaEncoding[encoding].scale['zero'] = false;
        // Note: no scale.padding here. setDefaultDomains already adds 5% padding
        // on each side for non-bar quantitative encodings. Adding scale.padding
        // on top of that caused axis ranges to extend well beyond the data
        // (e.g., a count axis starting at -20 for all-positive data).
      }
      if (layer.mark === 'area' && encoding === 'y') {
        vegaEncoding[encoding].stack = false;
      }
      // TODO: map our domain/range to vega format domain/range
      if ('domain' in map) {
        if (vegaEncoding[encoding].scale == null) {
          vegaEncoding[encoding].scale = {};
        }
        vegaEncoding[encoding].scale['domain'] = map.domain;
      }
      if ('range' in map) {
        if (vegaEncoding[encoding].scale == null) {
          vegaEncoding[encoding].scale = {};
        }
        vegaEncoding[encoding].scale['range'] = map.range;
      }
      if ('omitLegend' in map && map.omitLegend) {
        vegaEncoding[encoding].legend = null;
      }
      if ('title' in map && map.title != null) {
        vegaEncoding[encoding].title = map.title;
      }
    }

    let selectParam: {
      name: string;
      select: { type: 'point' | 'interval'; encodings?: string[]; on?: string };
      value?: RangeSelection | null;
    } | null = null;
    if (layer.select) {
      selectParam = {
        name: layer.select.name,
        select: {
          type: layer.select.how.type,
        },
      };
      if (layer.select.how.type === 'interval') {
        selectParam.select['encodings'] = layer.select.how.on.split('');
      }
      // else {
      //   // selectParam.select['on'] = 'click';
      //   // selectParam.select['encodings'] = 'sex';
      // }

      dataSourcesStore.watchDataSelection(
        layer.select.source,
        layer.select.name,
        layer.select.how.type, // TODO: set point if needed
      );
      if (selectParam.select.type === 'interval') {
        signalKeys.value = [layer.select.name];
        if (
          layer.select.how.type === 'interval' &&
          layer.select.how.field
        ) {
          const axes = layer.select.how.on.split('');
          const overrideField = layer.select.how.field;
          const fieldRemap: Record<string, string> = {};
          for (let i = 0; i < axes.length; i++) {
            const encodingMatch = mapping.find(
              (m) => m.encoding === axes[i] && 'field' in m,
            );
            if (encodingMatch && 'field' in encodingMatch) {
              const target = Array.isArray(overrideField)
                ? overrideField[i]
                : overrideField;
              if (target) {
                fieldRemap[encodingMatch.field] = target;
              }
            }
          }
          signalFieldMap.value[layer.select.name] = fieldRemap;
        }
      } else {
        pointSelect.value = layer.select;
      }
    }
    const outputLayer: {
      mark: { type: VisualizationLayer['mark']; tooltip: boolean };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      encoding: any;
      params?: (typeof selectParam)[];
    } = {
      // tooltip: true shows a tooltip with all encoded field values on hover
      mark: { type: layer.mark, tooltip: true },
      encoding: vegaEncoding,
    };
    if (selectParam && selectParam.select.type === 'interval') {
      outputLayer.params = [selectParam];
    }

    return outputLayer;
  });
  vegaSpec['layer'] = outputLayers;

  return JSON.stringify(vegaSpec);
}
const signalKeys = ref<string[]>([]);
const signalFieldMap = ref<Record<string, Record<string, string>>>({});
const pointSelect = ref<DataSelection>();

const debugVegaData = ref();

const slots = useSlots();
</script>

<template>
  <template v-if="!dataSourcesStore.loading && visualizationBuilt">
    <div class="error-message" v-if="transformError">
      {{ transformError.message }}
    </div>
    <template v-if="slots.default">
      <slot
        :data="transformedData"
        :allData="transformedDataFull"
        :isSubset="isTransformedDataSubset"
      />
    </template>
    <template v-else-if="isVegaLiteComponent">
      <VegaLite
        :spec="vegaLiteSpec"
        :hide-actions="props.spec.config?.hideActions"
        :signal-keys="signalKeys"
        :signal-field-map="signalFieldMap"
        :point-select="pointSelect"
        :selections="props.selections"
      />
    </template>
    <template v-else>
      <TableComponent :data="transformedData" :spec="parsedSpec" />
    </template>
  </template>
  <template v-else>
    <p>Loading...</p>
  </template>
</template>

<style scoped lang="scss">
.error-message {
  color: #e53935; // $negative, but don't want quasar vars in component
  margin: 6px;
}
</style>
