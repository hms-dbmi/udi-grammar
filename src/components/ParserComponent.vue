<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import VegaLite from './VegaLite.vue';
import OrganMapComponent from './OrganMapComponent.vue';
import TableComponent from './TableComponent.vue';
import FilterPanelComponent from './FilterPanelComponent.vue';
import {
  CustomComponent,
  type ParsedUDIGrammar,
  type UDIGrammar,
  parseSpecification,
} from './Parser';
import { useDataSourcesStore } from '@/stores/DataSourcesStore';
import { storeToRefs } from 'pinia';

const dataSourcesStore = useDataSourcesStore();
const { loading } = storeToRefs(dataSourcesStore);

export interface ParserProps {
  spec: UDIGrammar;
}

// TODO: infer based on data, or assume schema
const columnTypes = {
  species: 'nominal',
  island: 'nominal',
  bill_length_mm: 'quantitative',
  bill_depth_mm: 'quantitative',
  flipper_length_mm: 'quantitative',
  body_mass_g: 'quantitative',
  sex: 'nominal',
};

const props = defineProps<ParserProps>();

const parsedSpec = ref<ParsedUDIGrammar | null>(null);

const isGoGComponent = ref<boolean>(false);
const vegaLiteSpec = ref<string>('');
const customComponentType = ref<string>('');
onMounted(() => {
  // parse/validate grammar
  parsedSpec.value = parseSpecification(props.spec);
  for (const dataSource of parsedSpec.value.dataSource) {
    dataSourcesStore.initDataSource(dataSource);
  }
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
    isGoGComponent.value = true;
  } else {
    customComponentType.value = (
      parsedSpec.value.dataRepresentation as CustomComponent
    ).type;
  }
}

function isVegaLiteCompatible(spec: ParsedUDIGrammar): boolean {
  // TODO: make type guard
  return Array.isArray(spec.dataRepresentation);
}

function convertToVegaSpec(spec: ParsedUDIGrammar): string {
  const vegaSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    // data: { url: './data/penguins.csv' },
    data: { values: [] },
  };

  // add data
  // TODO: assume one data source
  const dataInterface = spec.dataSource[0];
  vegaSpec.data.values = dataSourcesStore.getDataObject(dataInterface.key);
  console.log(vegaSpec);
  // TODO: perform transformations

  // dataInterface.

  // add layers
  const inputLayers = spec.dataRepresentation;
  if (!Array.isArray(inputLayers)) {
    throw new Error('invalid spec passed to vega conversion');
  }
  const outputLayers = inputLayers.map((gogComponent) => {
    let encoding = {};
    for (let [key, value] of Object.entries(gogComponent.encoding)) {
      encoding[key] = {
        field: value.field,
        type: columnTypes[value.field],
      };
    }
    return {
      mark: gogComponent.mark,
      encoding,
    };
  });
  vegaSpec['layer'] = outputLayers;

  return JSON.stringify(vegaSpec);
}
</script>

<template>
  <VegaLite v-if="isGoGComponent" :spec="vegaLiteSpec" />
  <component v-else :is="customComponentType" />
</template>

<style scoped></style>
