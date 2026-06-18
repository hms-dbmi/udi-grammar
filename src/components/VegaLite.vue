<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
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
import type { UDIPalette } from './Palette';
import { DEFAULT_PALETTE, toVegaRange, toVegaRamp } from './Palette';
import { registerRampScheme } from './paletteScheme';

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
  /** Consumer-supplied color palette; falls back to DEFAULT_PALETTE per channel. */
  palette?: UDIPalette;
}

const props = defineProps<VegaLiteProps>();

// Build the vega-embed `config` object from the palette prop, falling back to
// DEFAULT_PALETTE per channel. A spec-level per-encoding `range` still wins —
// this only sets the scale defaults.
function buildVegaConfig(): Record<string, unknown> {
  const palette = props.palette ?? {};
  const markColor = palette.mark ?? DEFAULT_PALETTE.mark;
  const category = palette.category ?? DEFAULT_PALETTE.category;
  const ordinal = palette.ordinal ?? DEFAULT_PALETTE.ordinal;
  const ramp = palette.ramp ?? DEFAULT_PALETTE.ramp;

  const range: Record<string, unknown> = {};
  if (category != null) range.category = toVegaRange(category);
  if (ordinal != null) range.ordinal = toVegaRange(ordinal);
  if (ramp != null) range.ramp = toVegaRamp(ramp, registerRampScheme);

  const config: Record<string, unknown> = {
    point: { shape: 'circle', filled: true },
    range,
  };
  if (markColor != null) config.mark = { color: markColor };
  return config;
}

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

  // Capture whether the spec opted into container sizing on each axis;
  // see the note above scheduleVegaResize for why we can't unconditionally
  // write both signals on resize.
  const specMaybeSized = specObject as { width?: unknown; height?: unknown };
  widthIsContainer = specMaybeSized.width === 'container';
  heightIsContainer = specMaybeSized.height === 'container';

  if (specObject.data && specObject.data.values) {
    delete specObject.data.values;
  }
  // console.log('initializing vega chart with spec:', specObject);
  vegaEmbed(vegaContainer.value, specObject as VisualizationSpec, {
    actions: props.hideActions ? false : true,
    config: buildVegaConfig(),
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

// Track the chart's container element and re-run Vega's layout pass when
// the container size changes. vega-embed reads `width: 'container'` /
// `height: 'container'` from `containerSize()` ONLY at signal init time —
// later parent resizes (e.g. dragging a card to a different col/row span)
// don't re-evaluate that signal. We have to (a) observe the container, and
// (b) write the new pixel width/height into Vega's `width`/`height` signals
// directly. Both pieces are required: without the explicit signal writes
// `view.resize().runAsync()` re-uses the frozen init-time dimensions and
// the chart appears stuck at its original size.
//
// Critically, we ONLY write the signal for an axis that the spec marked
// as `'container'`. Writing the height signal for a spec that uses
// natural (data-driven) height — e.g. a vertical bar chart with
// `width: 'container'` but no `height` set — combined with Vega-Lite's
// default `autosize: 'pad'` (which treats `height` as the data-area
// size, with axis padding added on top) creates a runaway feedback
// loop: the chart renders taller than the container, the container
// grows to fit the rendered SVG, ResizeObserver fires, we write the
// new (larger) height back into the signal, the chart renders even
// taller, and so on. The dashboard never hit this because its cards
// have a fixed flex-bounded height; the Editor and ~half of Storybook
// stories trip over it because their containers have content-driven
// height.
let resizeObserver: ResizeObserver | null = null;
let resizeRaf: number | null = null;
let widthIsContainer = false;
let heightIsContainer = false;

function scheduleVegaResize() {
  if (!vegaView.value || !vegaContainer.value) return;
  // If the spec doesn't ask for container sizing on either axis, there's
  // nothing for us to write — and view.resize() alone is a no-op when
  // no dimensions changed. Skip entirely.
  if (!widthIsContainer && !heightIsContainer) return;
  // Coalesce bursts of resize events (e.g. ~60 Hz during a drag-resize)
  // into one update per frame.
  if (resizeRaf !== null) return;
  resizeRaf = requestAnimationFrame(() => {
    resizeRaf = null;
    const view = vegaView.value;
    const el = vegaContainer.value;
    if (!view || !el) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    // Detached / display:none containers report 0 — skip rather than
    // collapsing the chart to a point.
    if (w <= 0 || h <= 0) return;
    try {
      const signals = view.getState().signals ?? {};
      if (widthIsContainer && 'width' in signals) view.signal('width', w);
      if (heightIsContainer && 'height' in signals) view.signal('height', h);
    } catch {
      // Spec doesn't expose width/height signals — fall through; resize()
      // alone still re-runs the layout, which is correct for natural-size
      // specs whose dimensions don't depend on the container.
    }
    void view.resize().runAsync();
  });
}

onMounted(() => {
  initVegaChart();
  if (vegaContainer.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => scheduleVegaResize());
    resizeObserver.observe(vegaContainer.value);
  }
});

onBeforeUnmount(() => {
  if (resizeRaf !== null) {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = null;
  }
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
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

// The palette only feeds the embed-time `config`, so a change requires a full
// re-embed (not just a data update). Finalize the existing view first so its
// dataflow / listeners don't leak. Palette is a consumer-level config that
// rarely changes, so re-embedding (and dropping any active brush) is fine.
watch(
  () => props.palette,
  () => {
    if (vegaView.value) {
      vegaView.value.finalize();
      vegaView.value = null;
    }
    initVegaChart();
  },
  { deep: true },
);

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

<style>
/* Ensure Vega tooltips render above containers with high z-index (e.g. MUI dialogs at 1300).
   vega-tooltip portals the tooltip to <body> with a default z-index of 1000, which loses
   to higher-z-index ancestors of the chart's mounting container. */
#vg-tooltip-element {
  z-index: 2147483647;
}
</style>
