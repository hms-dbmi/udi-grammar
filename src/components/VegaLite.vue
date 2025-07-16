<script setup lang="ts">
import { ref, onMounted } from 'vue';
import vegaEmbed from 'vega-embed';
import { defineProps } from 'vue';
import { watch } from 'vue';
import { useDataSourcesStore } from './DataSourcesStore';
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

const errorMessage = ref();

function updateVegaChart() {
  let specObject;
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
    return;
  }

  vegaEmbed(vegaContainer.value, specObject)
    .then((result) => {
      // console.log('Chart rendered successfully');
      errorMessage.value = null;
      const view = result.view;
      for (const signalKey of props.signalKeys) {
        // replace "-" with "_" in signalKey since Vega signals cannot contain "-"
        const signalKeyFormatted = signalKey.replace(/-/g, '_');
        view.addSignalListener(signalKeyFormatted, (name, value) => {
          // console.log('Selection changed:', value);
          dataSourcesStore.updateDataSelection(signalKey, value);
        });
      }
    })
    .catch((error) => {
      console.error('Error rendering chart', error);
      errorMessage.value = 'Error rendering chart: ' + error.toString();
      // clear the container so the chart doesn't show up
      vegaContainer.value.innerHTML = '';
    });
}

onMounted(() => {
  updateVegaChart();
});

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
