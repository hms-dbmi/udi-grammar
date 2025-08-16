<script setup lang="ts">
import { ref, onMounted } from 'vue';
import vegaEmbed from 'vega-embed';
import { defineProps } from 'vue';
import { watch } from 'vue';
import type { DataSelections } from './DataSourcesStore';
import { useDataSourcesStore } from './DataSourcesStore';
import type { View } from 'vega';
import type { VisualizationSpec } from 'vega-embed';
import { changeset } from 'vega';
const dataSourcesStore = useDataSourcesStore();
import { isEmpty } from 'lodash';

// our type is more specific than the one from vega-embed
interface VegaSpecShim {
  data: {
    values?: object[];
  };
}

interface PointSelect {
  name: string;
  fields: string[] | string;
}

interface VegaLiteProps {
  spec: string;
  signalKeys?: string[];
  pointSelect?: PointSelect | null;
  selections?: DataSelections | null;
}

const props = defineProps<VegaLiteProps>();

const vegaContainer = ref();
const vegaView = ref<View | null>(null);

const errorMessage = ref();

function parseSpec(): { success: boolean; specObject?: VegaSpecShim } {
  let specObject = null;
  try {
    specObject = JSON.parse(props.spec);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error parsing spec', error);
      errorMessage.value = 'Error parsing spec: ' + error.message;
    } else {
      console.error('Error parsing spec: Non-error value', error);
      errorMessage.value = 'Error parsing spec: Unknown error';
    }
    // clear the container so the chart doesn't show up
    vegaContainer.value.innerHTML = '';
    return { success: false, specObject };
  }
  return { success: true, specObject };
}

const ignore = ref(false);

function initVegaChart() {
  // console.log('init vega chart');
  const { success, specObject } = parseSpec();
  if (!success || !specObject) return;

  if (specObject.data && specObject.data.values) {
    delete specObject.data.values;
  }
  // console.log('initializing vega chart with spec:', specObject);
  vegaEmbed(vegaContainer.value, specObject as VisualizationSpec)
    .then((result) => {
      errorMessage.value = null;
      const view = result.view;
      vegaView.value = view;
      for (const signalKey of props.signalKeys ?? []) {
        // console.log('Adding signal listener for:', signalKey);
        // replace "-" with "_" in signalKey since Vega signals cannot contain "-"
        // TODO: I think if the key starts with a number they prepend an underscore
        const signalKeyFormatted = signalKey.replace(/-/g, '_');
        view.addSignalListener(signalKeyFormatted, (name, value) => {
          if (ignore.value) return;
          // console.log('uate from vega-lite internal');
          // console.log('signal listener', signalKeyFormatted);
          // console.log(
          //   'signal listener: ',
          //   signalKeyFormatted,
          //   JSON.stringify(value),
          // );
          // ignore.value = true;
          dataSourcesStore.updateDataSelection(signalKey, value);
          // ignore.value = false;
        });
      }
      if (props.pointSelect) {
        // if the signal is a point selection we I couldn't get signals
        // to work with dynamic data, so click events it is!
        view.addEventListener('click', function (event, item) {
          let fields = props.pointSelect.fields;
          if (typeof fields === 'string') {
            fields = [fields];
          }
          // @ts-expect-error: I check it's existence right below
          const datum = item.datum;
          if (!datum) {
            dataSourcesStore.clearDataSelection(props.pointSelect.name);
          } else {
            const pointSelection = {};
            for (const f of fields) {
              // @ts-expect-error: ignore errror
              pointSelection[f] = [datum[f]];
            }
            dataSourcesStore.updateDataSelection(
              props.pointSelect.name,
              pointSelection,
            );
          }
        });
      }

      updateVegaChart();
    })
    .catch((error) => {
      console.error('Error rendering chart', error);
      errorMessage.value = 'Error rendering chart: ' + error.toString();
      // clear the container so the chart doesn't show up
      vegaContainer.value.innerHTML = '';
    });
}

onMounted(() => {
  initVegaChart();
});

function updateVegaChart() {
  // only handles data changes
  if (!vegaView.value) return;
  const { success, specObject } = parseSpec();
  if (!success || isEmpty(specObject)) return;
  vegaView.value
    .change(
      'udi_data',
      changeset()
        .remove(() => true)
        .insert(specObject.data.values ?? []),
    )
    .resize()
    .runAsync();
}

watch(() => props.spec, updateVegaChart);

async function updateVegaChartSelections() {
  // console.log('vega-lite selections changed');
  // only handles data changes
  if (!vegaView.value) return;
  // console.log('blargen flargen ');
  let testNew = props.selections['weight-select'].selection['weight_value'];
  // testNew = [Math.min(...testNew), Math.max(...testNew)];
  testNew = toPixelRange(testNew);
  // check if testNew is different from existing value
  const currentVal = vegaView.value.signal('weight_select_x');
  // console.log('CURRENT', currentVal[0], currentVal[1]);
  // console.log('NEW', testNew[0], testNew[1]);
  const closeEnough = (x: number, y: number, eps = 1e-6) =>
    Math.abs(x - y) < eps;
  if (
    closeEnough(Math.min(...currentVal), Math.min(...testNew)) &&
    closeEnough(Math.max(...currentVal), Math.max(...testNew))
  ) {
    // console.log('No change in selection, skipping update');
    return;
  }
  // console.log('signal trigger:', testNew[0], testNew[1]);
  ignore.value = true;
  vegaView.value.signal('weight_select_x', testNew);
  await vegaView.value.runAsync();
  ignore.value = false;
}

function toPixelRange(dataRange: [number, number]): [number, number] {
  if (!vegaView.value) return [0, 0] as any;
  const sx = vegaView.value.scale('x'); // forward mapping data -> pixels
  return [sx(dataRange[0]), sx(dataRange[1])] as [number, number];
}

watch(() => props.selections, updateVegaChartSelections);
</script>

<template>
  <div ref="vegaContainer" class="vega-chart-container"></div>
  <div v-if="errorMessage" class="vega-error-message">
    {{ errorMessage }}
  </div>
</template>

<style scoped>
.vega-chart-container {
  width: 100%;
  height: 100%;
  /* max-width: 600px; */
  overflow-x: auto;
}

.vega-error-message {
  color: red;
}
</style>
