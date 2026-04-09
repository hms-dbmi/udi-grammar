<script setup lang="ts">
import { ref, onMounted } from 'vue';
import vegaEmbed from 'vega-embed';
import { defineProps } from 'vue';
import { watch } from 'vue';
import type {
  ActiveDataSelection,
  DataSelections,
  RangeSelection,
} from './DataSourcesStore';
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
  hideActions?: boolean;
  signalKeys?: string[];
  signalFieldMap?: Record<string, Record<string, string>>;
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

function formatVegaSignalKey(raw: string): string {
  // replace "-" with "_" in signalKey since Vega signals cannot contain "-"
  // TODO: I think if the key starts with a number they prepend an underscore
  return raw.replace(/-/g, '_');
}

function initVegaChart() {
  // console.log('UDI-VIS: initialized chart');
  // console.log('init vega chart');
  const { success, specObject } = parseSpec();
  if (!success || !specObject) return;

  if (specObject.data && specObject.data.values) {
    delete specObject.data.values;
  }
  // console.log('initializing vega chart with spec:', specObject);
  vegaEmbed(vegaContainer.value, specObject as VisualizationSpec, {
    actions: props.hideActions ? false : true,
    config: {
      mark: { color: '#E6A01A' },
      point: { shape: 'circle', filled: true },
      range: {
        category: [
          '#E6A01A',
          '#16A987',
          '#0673B0',
          '#9EC8DD',
          '#204E62',
          '#BF97E4',
          '#D95838',
          '#6FDCC3',
          '#787874',
        ],
        // ordinal: { scheme: 'greens' },
        ramp: { scheme: 'oranges' },
      },
    },
  })
    .then((result) => {
      errorMessage.value = null;
      const view = result.view;
      vegaView.value = view;
      for (const signalKey of props.signalKeys ?? []) {
        const signalKeyFormatted = formatVegaSignalKey(signalKey);
        // Vega-Lite stores per-channel ranges in separate signals
        // ({name}_x, {name}_y). Read _tuple_fields to discover which
        // channels exist, then listen on each and combine into a
        // single multi-field selection update.
        const tupleFieldsKey = signalKeyFormatted + '_tuple_fields';
        const tupleFields = view.signal(tupleFieldsKey) as
          | Array<{ channel: string; field: string }>
          | undefined;
        const channels = (tupleFields ?? []).map((t) => t.channel);
        const fieldMap = props.signalFieldMap?.[signalKey];

        const buildCombinedSelection = (): RangeSelection | null => {
          const combined: RangeSelection = {};
          for (const tf of tupleFields ?? []) {
            const channelSignal = `${signalKeyFormatted}_${tf.channel}`;
            const pixelRange = view.signal(channelSignal) as [number, number] | undefined;
            if (pixelRange == null) continue;
            // Convert pixel coordinates back to data coordinates
            const dataRange = fromPixelRange(pixelRange, tf.channel as 'x' | 'y');
            const dataField = fieldMap?.[tf.field] ?? tf.field;
            combined[dataField] = dataRange;
          }
          return Object.keys(combined).length > 0 ? combined : null;
        };

        // Debounce selection updates so that dragging doesn't trigger
        // a data re-render on every mouse-move (which would destroy the
        // brush interaction). Only propagate after the drag settles.
        let debounceTimer: ReturnType<typeof setTimeout> | null = null;
        const DEBOUNCE_MS = 250;
        const debouncedUpdate = (sel: RangeSelection | null) => {
          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            dataSourcesStore.updateDataSelection(signalKey, sel);
          }, DEBOUNCE_MS);
        };

        if (channels.length > 0) {
          // Listen on each per-channel signal and combine all channels
          for (const channel of channels) {
            const channelSignal = `${signalKeyFormatted}_${channel}`;
            view.addSignalListener(channelSignal, () => {
              if (ignore.value) return;
              debouncedUpdate(buildCombinedSelection());
            });
          }
        } else {
          // Fallback: listen on the main signal (1D selections or legacy)
          view.addSignalListener(signalKeyFormatted, (name, value) => {
            if (ignore.value) return;
            if (fieldMap && value != null && typeof value === 'object') {
              const remapped: RangeSelection = {};
              for (const [k, v] of Object.entries(value)) {
                remapped[fieldMap[k] ?? k] = v as [number, number];
              }
              debouncedUpdate(remapped);
            } else {
              debouncedUpdate(value as RangeSelection | null);
            }
          });
        }
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
  // only handles data changes — does NOT resize, since layout hasn't changed
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
    .runAsync();
}

watch(() => props.spec, updateVegaChart);

async function updateVegaChartSelections() {
  // console.log('UDI-VIS: vegaChartSelections triggered', props.selections);
  // console.log('vega-lite selections changed');
  // only handles data changes
  if (!vegaView.value) return;
  if (!props.selections) return; // Do I actually need to clear selections here?
  ignore.value = true;
  // console.log('Current signals:', currentSignals);

  for (const [selectionName, selection] of Object.entries(props.selections)) {
    updateVegaChartSelection(selectionName, selection);
  }

  await vegaView.value.runAsync();
  ignore.value = false;
}

function updateVegaChartSelection(
  selectionName: string,
  selection: ActiveDataSelection,
) {
  if (!vegaView.value) return;
  if (selection.type !== 'interval') return;
  const currentSignals = vegaView.value.getState().signals;
  if (!currentSignals) return;

  // Build reverse field map: remapped field -> encoding field
  const reverseFieldMap: Record<string, string> = {};
  const fmap = props.signalFieldMap?.[selectionName];
  if (fmap) {
    for (const [encodingField, remappedField] of Object.entries(fmap)) {
      reverseFieldMap[remappedField] = encodingField;
    }
  }

  for (const [field, range] of Object.entries(
    selection.selection as RangeSelection,
  )) {
    const vegaField = reverseFieldMap[field] ?? field;
    const signalKeyStart = formatVegaSignalKey(selectionName);
    const signalTupleInfo = signalKeyStart + '_tuple_fields';
    if (!(signalTupleInfo in currentSignals)) continue;
    const signalTuple = currentSignals[signalTupleInfo];
    const channel = (
      signalTuple as Array<{ channel: string; field: string }>
    ).find((t) => t.field === vegaField)?.channel;
    const signalKeyFull = `${signalKeyStart}_${channel}`;
    let testNew = range;
    testNew = toPixelRange(testNew, channel);
    const currentVal = vegaView.value.signal(signalKeyFull);
    const closeEnough = (x: number, y: number, eps = 1e-6) =>
      Math.abs(x - y) < eps;
    if (
      closeEnough(Math.min(...currentVal), Math.min(...testNew)) &&
      closeEnough(Math.max(...currentVal), Math.max(...testNew))
    ) {
      continue;
    }

    vegaView.value.signal(signalKeyFull, testNew);
  }
}

function toPixelRange(
  dataRange: [number, number],
  channel: 'x' | 'y',
): [number, number] {
  if (!vegaView.value) return [0, 0] as any;
  const sx = vegaView.value.scale(channel);
  return [sx(dataRange[0]), sx(dataRange[1])] as [number, number];
}

function fromPixelRange(
  pixelRange: [number, number],
  channel: 'x' | 'y',
): [number, number] {
  if (!vegaView.value) return [0, 0];
  const sx = vegaView.value.scale(channel);
  return [sx.invert(pixelRange[0]), sx.invert(pixelRange[1])] as [number, number];
}

watch(() => props.selections, updateVegaChartSelections, { deep: true });
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
