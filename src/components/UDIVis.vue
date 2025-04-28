<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import VegaLite from './VegaLite.vue';
import TableComponent from './TableComponent.vue';
import { type ParsedUDIGrammar, parseSpecification } from './Parser';
import type { UDIGrammar, VisualizationLayer } from './GrammarTypes';
import { useDataSourcesStore } from './DataSourcesStore';
import { storeToRefs } from 'pinia';

const dataSourcesStore = useDataSourcesStore();
const { loading } = storeToRefs(dataSourcesStore);

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

watch(loading, () => buildVisualization());

function buildVisualization(): void {
  if (!parsedSpec.value) {
    return;
  }
  // // parse/validate grammar
  // parsedSpec.value = parseSpecification(props.spec);
  // for (const dataSource of parsedSpec.value.dataSource) {
  //   dataSourcesStore.initDataSource(dataSource);
  // }

  if (isVegaLiteCompatible(parsedSpec.value)) {
    vegaLiteSpec.value = convertToVegaSpec(parsedSpec.value);
    isVegaLiteComponent.value = true;
  }
}

function isVegaLiteCompatible(spec: ParsedUDIGrammar): boolean {
  return !spec.representation.map((x) => x.mark).includes('row');
}

const transformError = ref();

function convertToVegaSpec(spec: ParsedUDIGrammar): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vegaSpec: any = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    // data: { url: './data/penguins.csv' },
    data: { values: [] },
  };

  // add data
  try {
    transformError.value = null;
    vegaSpec.data!.values = dataSourcesStore.getDataObject(
      spec.source.map((x) => x.name),
      spec.transformation,
    );
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
        vegaEncoding[encoding].scale = {
          zero: false,
        };
      }
      if (layer.mark === 'area' && encoding === 'y') {
        vegaEncoding[encoding].stack = false;
      }
    }
    return {
      mark: layer.mark,
      encoding: vegaEncoding,
    };
  });
  vegaSpec['layer'] = outputLayers;

  return JSON.stringify(vegaSpec);
}

const debugVegaData = ref();
</script>

<template>
  <template v-if="!dataSourcesStore.loading">
    <div class="error-message" v-if="transformError">
      {{ transformError.message }}
    </div>
    <VegaLite v-else-if="isVegaLiteComponent" :spec="vegaLiteSpec" />
    <TableComponent v-else />
    <!-- <hr />
    <pre
      >{{ debugVegaData }}
    </pre> -->
  </template>
  <template v-else>
    <p>Loading...</p>
  </template>
</template>

<style lang="scss" scoped>
.error-message {
  color: #e53935; // $negative, but don't want quasar vars in component
  margin: 6px;
}
</style>
