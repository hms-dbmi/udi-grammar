<script setup lang="ts">
import { ref, onMounted } from 'vue';
import vegaEmbed from 'vega-embed';
import { defineProps } from 'vue';
import { watch } from 'vue';
import { useDataSourcesStore } from './DataSourcesStore';
import type { View } from 'vega';
import { changeset } from 'vega';
const dataSourcesStore = useDataSourcesStore();

const props = defineProps({
  spec: {
    type: String,
    required: true,
  },
  signalKeys: {
    type: Array as () => string[],
    default: () => [],
  },
});

const vegaContainer = ref();
const vegaView = ref<View | null>(null);

const errorMessage = ref();

function parseSpec(): { success: boolean; specObject?: any } {
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
  console.log('init vega chart');
  const { success, specObject } = parseSpec();
  if (!success || !specObject) return;

  if (specObject.data && specObject.data.values) {
    delete specObject.data.values;
  }

  vegaEmbed(vegaContainer.value, specObject)
    .then((result) => {
      errorMessage.value = null;
      const view = result.view;
      vegaView.value = view;
      for (const signalKey of props.signalKeys) {
        // replace "-" with "_" in signalKey since Vega signals cannot contain "-"
        const signalKeyFormatted = signalKey.replace(/-/g, '_');
        view.addSignalListener(signalKeyFormatted, (name, value) => {
          dataSourcesStore.updateDataSelection(signalKey, value);
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
  console.log('update vega chart');
  if (!vegaView.value) return;
  const { success, specObject } = parseSpec();
  if (!success) return;
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
