<script setup lang="ts">
import { ref, onMounted } from 'vue';
import vegaEmbed from 'vega-embed';
import { defineProps } from 'vue';
import { watch } from 'vue';
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

const props = defineProps({
  spec: {
    type: String,
    required: true,
  },
  signalKeys: {
    type: Array as () => string[],
    default: () => [],
  },
  pointSelect: {
    type: Object,
    default: null,
  },
});

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
      for (const signalKey of props.signalKeys) {
        // console.log('Adding signal listener for:', signalKey);
        // replace "-" with "_" in signalKey since Vega signals cannot contain "-"
        // TODO: I think if the key starts with a number they prepend an underscore
        const signalKeyFormatted = signalKey.replace(/-/g, '_');
        view.addSignalListener(signalKeyFormatted, (name, value) => {
          dataSourcesStore.updateDataSelection(signalKey, value);
        });
      }
      if (props.pointSelect) {
        console.log('props', props);
        console.log('props current signalKey', props.signalKeys);
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
            console.log('fields', fields);
            console.log('datum', datum);
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
  // console.log('update vega chart');
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
