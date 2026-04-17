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
            const dataRange = fromPixelRange(pixelRange, tf.channel as 'x' | 'y');
            // Skip degenerate ranges (single-point click before drag starts)
            if (Math.abs(dataRange[1] - dataRange[0]) < 1e-9) continue;
            const dataField = fieldMap?.[tf.field] ?? tf.field;
            combined[dataField] = dataRange;
          }
          return Object.keys(combined).length > 0 ? combined : null;
        };

        // Fire updates directly on each signal change so cross-chart
        // filtering stays live during drag. updateDataSelection already
        // short-circuits on equal selections via isEqual, and the
        // ignore flag prevents feedback loops during spec re-renders.
        if (channels.length > 0) {
          // Listen on each per-channel signal and combine all channels
          for (const channel of channels) {
            const channelSignal = `${signalKeyFormatted}_${channel}`;
            view.addSignalListener(channelSignal, () => {
              if (ignore.value) return;
              dataSourcesStore.updateDataSelection(
                signalKey,
                buildCombinedSelection(),
              );
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
              dataSourcesStore.updateDataSelection(signalKey, remapped);
            } else {
              dataSourcesStore.updateDataSelection(
                signalKey,
                value as RangeSelection | null,
              );
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

// Update data in the existing Vega view, preserving brush/selection state.
async function updateVegaChart() {
  if (!vegaView.value) return;
  const { success, specObject } = parseSpec();
  if (!success || isEmpty(specObject)) return;

  // Save per-channel selection signals ONLY when there's an active brush.
  // Saving empty/cleared signals and re-applying them can leave Vega's
  // dataflow in a stale state where points render at wrong positions after
  // the brush is cleared.
  const savedSignals: Record<string, unknown> = {};
  for (const signalKey of props.signalKeys ?? []) {
    const sk = formatVegaSignalKey(signalKey);
    const tupleFieldsKey = sk + '_tuple_fields';
    const state = vegaView.value.getState().signals;
    if (!state) continue;
    const tupleFields = state[tupleFieldsKey] as
      | Array<{ channel: string; field: string }>
      | undefined;
    for (const tf of tupleFields ?? []) {
      const channelSignal = `${sk}_${tf.channel}`;
      const val = state[channelSignal];
      // Only save truly active brush ranges: non-empty 2-tuple with
      // distinct endpoints. This avoids preserving stale or cleared state.
      if (
        Array.isArray(val) &&
        val.length === 2 &&
        typeof val[0] === 'number' &&
        typeof val[1] === 'number' &&
        val[0] !== val[1]
      ) {
        savedSignals[channelSignal] = val;
      }
    }
  }

  ignore.value = true;
  vegaView.value.change(
    'udi_data',
    changeset()
      .remove(() => true)
      .insert(specObject.data.values ?? []),
  );

  // Restore only the verified-active brush signals
  for (const [key, value] of Object.entries(savedSignals)) {
    vegaView.value.signal(key, value);
  }

  // .resize() forces the view to recompute layout (scale ranges, axis
  // positions, etc.) based on current state. Without it, Vega can leave
  // stale derived state after a data changeset — manifesting as points
  // rendered at positions that don't match the axis (e.g. after a brush
  // is dismissed).
  await vegaView.value.resize().runAsync();
  ignore.value = false;
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
  if (!vegaView.value) return [0, 0];
  const sx = vegaView.value.scale(channel);
  return [sx(dataRange[0]), sx(dataRange[1])] as [number, number];
}

function fromPixelRange(
  pixelRange: [number, number],
  channel: 'x' | 'y',
): [number, number] {
  if (!vegaView.value) return [0, 0];
  const sx = vegaView.value.scale(channel);
  const a = sx.invert(pixelRange[0]) as number;
  const b = sx.invert(pixelRange[1]) as number;
  // Y-axis pixels are inverted (0 = top), so always normalize to [min, max]
  return [Math.min(a, b), Math.max(a, b)];
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
