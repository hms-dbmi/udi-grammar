<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import VegaLite from './VegaLite.vue';
import TableComponent from './TableComponent.vue';
import { type ParsedUDIGrammar, parseSpecification } from './Parser';
import type { UDIGrammar, VisualizationLayer } from './GrammarTypes';
import type { RangeSelection } from './DataSourcesStore';
import { useDataSourcesStore } from './DataSourcesStore';
const dataSourcesStore = useDataSourcesStore();
import { storeToRefs } from 'pinia';

const { loading, selectionHash } = storeToRefs(dataSourcesStore);

export interface ParserProps {
  spec: UDIGrammar;
}

const props = defineProps<ParserProps>();

const parsedSpec = ref<ParsedUDIGrammar | null>(null);

const isVegaLiteComponent = ref<boolean>(false);
const vegaLiteSpec = ref<string>('');
onMounted(() => {
  render();
});

async function render() {
  // parse/validate grammar
  // console.log('render');

  parsedSpec.value = parseSpecification(props.spec);
  await dataSourcesStore.initDataSources(parsedSpec.value.source);

  buildVisualization();

  // if (isVegaLiteCompatible(parsedSpec.value)) {
  //   vegaLiteSpec.value = convertToVegaSpec(parsedSpec.value);
  //   isGoGComponent.value = true;
  // }
}

watch(
  () => props.spec,
  () => {
    render();
  },
);

watch([loading, selectionHash], () => buildVisualization());

function buildVisualization(): void {
  if (!parsedSpec.value) {
    return;
  }
  // // parse/validate grammar
  // parsedSpec.value = parseSpecification(props.spec);
  // for (const dataSource of parsedSpec.value.dataSource) {
  //   dataSourcesStore.initDataSource(dataSource);
  // }
  performDataTransformation(parsedSpec.value);
  if (transformedData.value == null) {
    return;
  }

  if (isTransformedDataSubset.value) {
    setDefaultDomains(parsedSpec.value, transformedDataFull.value);
  }

  if (isVegaLiteCompatible(parsedSpec.value)) {
    vegaLiteSpec.value = convertToVegaSpec(parsedSpec.value);
    isVegaLiteComponent.value = true;
  } else {
    isVegaLiteComponent.value = false;
  }
}

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
      if (mapping.domain) continue;
      // @ts-expect-error: same, but for field.
      if (!mapping.field) continue;
      // @ts-expect-error: Again...
      const field: string = mapping.field;
      if (!fields.includes(field)) continue;
      // @ts-expect-error: Again...
      if (!mapping.type) continue;
      // @ts-expect-error: Again...
      const type: DataTypes = mapping.type;
      if (type === 'quantitative') {
        if (mark === 'bar') continue;
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
            .filter((d) => d[field] != null)
            // @ts-expect-error: Again...
            .map((d) => d[field]);
          // const min = minBy(data, (d) => 0);
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
          }
          const paddedMax = max + padding;
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
  transformedData.value = null;

  try {
    transformError.value = null;

    const dataObjects = dataSourcesStore.getDataObject(
      spec.source.map((x) => x.name),
      spec.transformation,
    );

    if (dataObjects == null) {
      return;
    }

    const { allData, displayData, isDisplayDataSubset } = dataObjects;

    transformedData.value = displayData;
    transformedDataFull.value = allData;
    isTransformedDataSubset.value = isDisplayDataSubset;
  } catch (error) {
    transformError.value = error;
  }
}

function convertToVegaSpec(spec: ParsedUDIGrammar): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vegaSpec: any = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    // data: { url: './data/penguins.csv' },
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
  // console.log(vegaSpec);
  // TODO: perform transformations

  // dataInterface.

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
        'donors', // TODO: figure out which data source to use here.
        layer.select.name,
        layer.select.how.type, // TODO: set point if needed
      );
      if (selectParam.select.type === 'interval') {
        signalKeys.value = [layer.select.name];
      } else {
        pointSelect.value = layer.select;
      }
    }
    const outputLayer: {
      mark: VisualizationLayer['mark'];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      encoding: any;
      params?: (typeof selectParam)[];
    } = {
      mark: layer.mark,
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
const pointSelect = ref<any>();

const debugVegaData = ref();
</script>

<template>
  <template v-if="!dataSourcesStore.loading">
    <div class="error-message" v-if="transformError">
      {{ transformError.message }}
    </div>
    <div v-else-if="isVegaLiteComponent">
      <VegaLite
        :spec="vegaLiteSpec"
        :signal-keys="signalKeys"
        :point-select="pointSelect"
      />
    </div>
    <TableComponent :data="transformedData" :spec="parsedSpec" v-else />
    <!-- <hr />
    <div>
      {{ vegaLiteSpec }}
    </div> -->
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
