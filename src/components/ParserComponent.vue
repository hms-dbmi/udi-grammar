<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import VegaLite from './VegaLite.vue';
import OrganMapComponent from './OrganMapComponent.vue';
import TableComponent from './TableComponent.vue';
import FilterPanelComponent from './FilterPanelComponent.vue';
import { type ParsedUDIGrammar, parseSpecification } from './Parser';
import type { UDIGrammar, VisualizationLayer } from '@/stores/GrammarTypes';
import { useDataSourcesStore } from '@/stores/DataSourcesStore';
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
  // parse/validate grammar
  parsedSpec.value = parseSpecification(props.spec);
  dataSourcesStore.initDataSources(parsedSpec.value.source);
  buildVisualization();

  // if (isVegaLiteCompatible(parsedSpec.value)) {
  //   vegaLiteSpec.value = convertToVegaSpec(parsedSpec.value);
  //   isGoGComponent.value = true;
  // }
});

watch(loading, () => buildVisualization());

function buildVisualization(): void {
  console.log('build vis');
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

function convertToVegaSpec(spec: ParsedUDIGrammar): string {
  const vegaSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    // data: { url: './data/penguins.csv' },
    data: { values: [] },
  };

  // add data
  vegaSpec.data.values = dataSourcesStore.getDataObject(
    spec.source.map((x) => x.name),
    spec.transformation,
  );
  debugVegaData.value = vegaSpec.data.values;
  console.log(vegaSpec);
  // TODO: perform transformations

  // dataInterface.

  // add layers
  const inputLayers = spec.representation as VisualizationLayer[];
  if (!Array.isArray(inputLayers)) {
    throw new Error('invalid spec passed to vega conversion');
  }
  const outputLayers = inputLayers.map((layer) => {
    let mapping = Array.isArray(layer.mapping)
      ? layer.mapping
      : [layer.mapping];

    let vegaEncoding = {};
    for (let map of mapping) {
      const { encoding } = map;
      if ('value' in map) {
        vegaEncoding[encoding] = {
          value: map.value,
        };
      } else {
        vegaEncoding[encoding] = {
          field: map.field,
          type: map.type,
        };
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
  <VegaLite v-if="isVegaLiteComponent" :spec="vegaLiteSpec" />
  <TableComponent v-else />
  <hr />
  <pre
    >{{ props.spec }}
  </pre>
  <hr />
  <pre
    >{{ debugVegaData }}
  </pre>
</template>

<style scoped></style>
