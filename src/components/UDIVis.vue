<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import VegaLite from './VegaLite.vue';
import TableComponent from './TableComponent.vue';
import { type ParsedUDIGrammar, parseSpecification } from './Parser';
import type { UDIGrammar, VisualizationLayer } from './GrammarTypes';
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

  if (isVegaLiteCompatible(parsedSpec.value)) {
    vegaLiteSpec.value = convertToVegaSpec(parsedSpec.value);
    isVegaLiteComponent.value = true;
  } else {
    isVegaLiteComponent.value = false;
  }
}

function isVegaLiteCompatible(spec: ParsedUDIGrammar): boolean {
  return !spec.representation.map((x) => x.mark).includes('row');
}

const transformError = ref();

const transformedData = ref<object[] | null>(null);

function performDataTransformation(spec: ParsedUDIGrammar) {
  transformedData.value = null;
  try {
    transformError.value = null;
    transformedData.value = dataSourcesStore.getDataObject(
      spec.source.map((x) => x.name),
      spec.transformation,
    );
  } catch (error) {
    console.error('Failed to complete data transformation', error);
    transformError.value = error;
  }
  return;
}

function convertToVegaSpec(spec: ParsedUDIGrammar): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vegaSpec: any = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    // data: { url: './data/penguins.csv' },
    width: 'container',
    // height: 'container',
    data: { values: [] },
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
  let selectParam: {
    name: string;
    select: { type: 'point' | 'interval'; encodings?: string[] };
  } | null = null;
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
      dataSourcesStore.watchDataSelection(
        'donors', // TODO: figure out which data source to use here.
        layer.select.name,
      );
      signalKeys.value = [layer.select.name];
    }

    return {
      mark: layer.mark,
      encoding: vegaEncoding,
    };
  });
  vegaSpec['layer'] = outputLayers;
  if (selectParam) {
    vegaSpec['params'] = [selectParam];
  }

  return JSON.stringify(vegaSpec);
}
const signalKeys = ref<string[]>([]);

const debugVegaData = ref();
</script>

<template>
  <template v-if="!dataSourcesStore.loading">
    <div class="error-message" v-if="transformError">
      {{ transformError.message }}
    </div>
    <VegaLite
      v-else-if="isVegaLiteComponent"
      :spec="vegaLiteSpec"
      :signal-keys="signalKeys"
    />
    <TableComponent :data="transformedData" :spec="parsedSpec" v-else />
    <!-- <hr />
    <div>
      {{ selectionHash }}
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
