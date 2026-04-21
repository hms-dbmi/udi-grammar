<script setup lang="ts">
import { ref, computed, watch, onMounted, defineEmits, useSlots } from 'vue';
import VegaLite from './VegaLite.vue';
import TableComponent from './TableComponent.vue';
import { type ParsedUDIGrammar, parseSpecification } from './Parser';
import type {
  DataSelection,
  UDIGrammar,
  VisualizationLayer,
} from './GrammarTypes';
import type { DataSelections, RangeSelection } from './DataSourcesStore';
import { useDataSourcesStore } from './DataSourcesStore';
const dataSourcesStore = useDataSourcesStore();
import { storeToRefs } from 'pinia';
import { debounce } from 'lodash';

const { loading, selectionHash } = storeToRefs(dataSourcesStore);

export interface ParserProps {
  spec: UDIGrammar;
  selections?: DataSelections;
  /** Map entity names to canonical data URLs, overriding whatever the spec contains. */
  sourceResolver?: Record<string, string>;
}

// Expose data selections to parent component
const emit = defineEmits<{
  (e: 'selectionChange', selection: DataSelections): void;
  (
    e: 'dataReady',
    payload: {
      data: object[] | null;
      allData: object[] | null;
      isSubset: boolean;
    },
  ): void;
}>();

const props = defineProps<ParserProps>();

const parsedSpec = ref<ParsedUDIGrammar | null>(null);
// Per-instance flag: true once this instance's own data sources have been
// loaded via initDataSources.  The shared [loading, selectionHash] watcher
// must not trigger buildVisualization before this — other UDIVis instances
// sharing the same Pinia store can flip `loading` before our data is ready.
const instanceReady = ref(false);

const isVegaLiteComponent = ref<boolean>(false);
const vegaLiteSpec = ref<string>('');
onMounted(() => {
  render();
});

async function render() {
  // console.log('udivis render');
  if (!props.spec) return; // CE may mount before spec prop is set
  instanceReady.value = false;
  // Deep clone props.spec so internal mutations (e.g. setDefaultDomains
  // adding mapping.domain) don't leak back through the CE props to the
  // host (React) — which would otherwise trigger a re-mount and lose
  // the brush/selection state.
  parsedSpec.value = parseSpecification(JSON.parse(JSON.stringify(props.spec)));
  // Load data sources BEFORE binding selections — binding can change
  // selectionHash which triggers the [loading, selectionHash] watcher.
  // If data isn't loaded yet that watcher would hit empty dataSources.
  await dataSourcesStore.initDataSources(
    parsedSpec.value.source,
    props.sourceResolver,
  );
  instanceReady.value = true;
  if (props.selections) {
    dataSourcesStore.bindExternalDataSelections(props.selections);
  }
  buildVisualization();
}

watch(
  () => props.spec,
  () => {
    render();
  },
);

// Re-run render() if the host swaps in a new sourceResolver — e.g. if the
// consumer's data package finishes loading after this UDIVis has already
// mounted, or points at a different set of URLs. Without this watcher, the
// resolver's URLs only take effect on the next spec change, and the initial
// fetch has already gone out against the URL baked in the spec, which
// sometimes mismatches during local development.
watch(
  () => props.sourceResolver,
  () => {
    render();
  },
  { deep: true },
);

watch(
  () => props.selections,
  () => {
    if (props.selections) {
      dataSourcesStore.bindExternalDataSelections(props.selections);
    }
  },
  { deep: true },
);

watch(selectionHash, () => {
  // console.log('UDI-VIS: SelectionHash changed');
  const currentDataSelections = dataSourcesStore.dataSelections;
  // console.log('emit selection change');
  // console.log(currentDataSelections);
  emit('selectionChange', currentDataSelections);
});

const debounceValue = computed(() => {
  return props.spec?.config?.debounce ?? 0;
});

const debouncedBuildVisualization = debounce(
  () => buildVisualization(),
  debounceValue.value,
);

watch([loading, selectionHash], () => {
  // Don't react to store-wide loading changes until this instance's own
  // data sources have been loaded (see instanceReady above).
  if (!instanceReady.value) return;
  if (debounceValue.value === 0) {
    buildVisualization();
    return;
  }
  debouncedBuildVisualization();
});

function buildVisualization(): void {
  if (!props.spec) {
    return;
  }
  // Re-parse from a fresh clone so any prior domain mutations (from
  // setDefaultDomains during a previous subset state) don't persist
  // when the filter is cleared.
  parsedSpec.value = parseSpecification(JSON.parse(JSON.stringify(props.spec)));

  performDataTransformation(parsedSpec.value);
  if (transformedData.value == null) {
    return;
  }

  // Always lock axis domains to the full data extent. If we only did this
  // when isTransformedDataSubset is true, the initial chart would have a
  // dynamic scale, and when a filter later shrinks the data the scale
  // would recalculate — mismapping the brush pixel coordinates so the
  // brush rectangle appears to disappear / jump around.
  setDefaultDomains(parsedSpec.value, transformedDataFull.value);

  if (isVegaLiteCompatible(parsedSpec.value)) {
    vegaLiteSpec.value = convertToVegaSpec(parsedSpec.value);
    isVegaLiteComponent.value = true;
  } else {
    isVegaLiteComponent.value = false;
  }
  visualizationBuilt.value = true;

  if (!slots.default) {
    emit('dataReady', {
      data: transformedData.value,
      allData: transformedDataFull.value,
      isSubset: isTransformedDataSubset.value,
    });
  }
}

const visualizationBuilt = ref(false);

// Collect quantitative fields used on x/y/size by any bar or rect layer.
// Both rely on a zero-inclusive baseline (and rect additionally unions
// x with x2 automatically when no explicit domain is set). In layered
// specs those scales are shared, so sibling layers must not inject
// scale.zero=false or scale.domain on the same field — doing so would
// push the zero baseline off the scale and collapse mark widths.
function getZeroBaselineFields(spec: ParsedUDIGrammar): Set<string> {
  const out = new Set<string>();
  for (const representation of spec.representation) {
    if (representation.mark !== 'bar' && representation.mark !== 'rect')
      continue;
    if (!representation.mapping) continue;
    const mappings = Array.isArray(representation.mapping)
      ? representation.mapping
      : [representation.mapping];
    for (const m of mappings as Array<{
      encoding: string;
      field?: string;
      type?: string;
    }>) {
      if (m.encoding !== 'x' && m.encoding !== 'y' && m.encoding !== 'size')
        continue;
      if (!m.field || m.type !== 'quantitative') continue;
      out.add(m.field);
    }
  }
  return out;
}

function setDefaultDomains(
  spec: ParsedUDIGrammar,
  data: object[] | null,
): void {
  if (!data || data.length === 0) return;
  const firstObject = data[0] ?? {};
  const fields = Object.keys(firstObject);
  const numberDomainCache = new Map<string, [number, number]>();
  const catDomainCache = new Map<string, unknown[]>();
  const zeroBaselineFields = getZeroBaselineFields(spec);

  for (const representation of spec.representation) {
    const mark = representation.mark;
    if (!representation.mapping) continue;
    // Arc marks (pie/donut) rely on Vega-Lite's implicit theta stacking,
    // which requires the scale to start at 0. Computing a padded domain
    // here would override that and collapse small slices — notably
    // regressed with the vega-lite v5 → v6 bump.
    if (mark === 'arc') continue;
    const mappingList = Array.isArray(representation.mapping)
      ? representation.mapping
      : [representation.mapping];
    for (const mapping of mappingList) {
      // @ts-expect-error: I'm checking if domain exists, don't give me a type checking saying domain might not exist.
      if (mapping.domain) continue;
      // @ts-expect-error: I'm checking if domainWhenFiltered exists
      if (mapping.domainWhenFiltered === 'filtered') continue;
      // @ts-expect-error: same, but for field.
      if (!mapping.field) continue;
      // @ts-expect-error: Again...
      const field: string = mapping.field;
      if (!fields.includes(field)) continue;
      // @ts-expect-error: Again...
      if (!mapping.type) continue;
      // @ts-expect-error: Again...
      const type: DataTypes = mapping.type;
      // @ts-expect-error: checking domainWhenFiltered
      const domainWhenFiltered: string | undefined = mapping.domainWhenFiltered;
      if (type === 'quantitative') {
        if (mark === 'bar' && domainWhenFiltered !== 'full') continue;
        // Rect marks (histograms) pair x with x2 and y with y2 on the
        // same scale. Without an explicit domain, vega-lite auto-fits
        // the scale to the *filtered* values flowing into the chart,
        // which collapses the x-axis as the brush narrows. Compute a
        // domain that unions both ends from allData so bin edges stay
        // anchored. Skip the partner encoding (x2/y2) — it shares the
        // x/y scale and doesn't need its own domain.
        if (mark === 'rect') {
          // @ts-expect-error: encoding is statically known
          const encoding: string = mapping.encoding;
          if (encoding === 'x2' || encoding === 'y2') continue;
          const partnerEncoding =
            encoding === 'x' ? 'x2' : encoding === 'y' ? 'y2' : null;
          const partner = partnerEncoding
            ? (mappingList as Array<{ encoding: string; field?: string }>).find(
                (m) => m.encoding === partnerEncoding,
              )
            : undefined;
          const partnerField = partner?.field;
          const valuesPrimary = data
            // @ts-expect-error: dynamic field access
            .map((d) => Number(d[field]))
            .filter((v: number) => isFinite(v));
          const valuesPartner = partnerField
            ? data
                // @ts-expect-error: dynamic field access
                .map((d) => Number(d[partnerField]))
                .filter((v: number) => isFinite(v))
            : [];
          const combined = [...valuesPrimary, ...valuesPartner];
          if (combined.length === 0) continue;
          let rectMin = Math.min(...combined);
          const rectMax = Math.max(...combined);
          // y on rect (histogram count) should include zero so bars
          // don't float off the baseline.
          if (encoding === 'y') rectMin = Math.min(rectMin, 0);
          // @ts-expect-error: mapping.domain assignment
          mapping.domain = [rectMin, rectMax];
          continue;
        }
        // In layered specs, sibling layers share a scale with any bar
        // or rect layer using this field — overriding that scale
        // pushes the zero baseline off-screen.
        if (zeroBaselineFields.has(field)) continue;
        if (numberDomainCache.has(field)) {
          // @ts-expect-error: Again...
          const [min, max] = numberDomainCache.get(field);
          if (mark === 'row') {
            // @ts-expect-error: Again...
            mapping.domain = { min, max };
          } else {
            // @ts-expect-error: Again...
            mapping.domain = [min, max];
          }
        } else {
          const values = data
            // @ts-expect-error: Again...
            .map((d) => Number(d[field]))
            .filter((v: number) => isFinite(v));
          if (values.length === 0) continue;
          let min = Math.min(...values);
          if (mark === 'bar') {
            min = Math.min(min, 0);
          }
          // const min = Math.min(...values, 0);
          const max = Math.max(...values);
          const extent = max - min;
          const padding = extent * 0.05;
          const paddedMin = min === 0 ? 0 : min - padding;
          const paddedMax = max + padding;
          if (mark === 'row') {
            // @ts-expect-error: Again...
            mapping.domain = { min: paddedMin, max: paddedMax };
          } else {
            // @ts-expect-error: Again...
            mapping.domain = [paddedMin, paddedMax];
          }
          numberDomainCache.set(field, [paddedMin, paddedMax]);
        }
      } else {
        // TODO, check if row categorical fields work here.
        if (catDomainCache.has(field)) {
          // @ts-expect-error: Again...
          mapping.domain = catDomainCache.get(field);
        } else {
          // @ts-expect-error: Again...
          const values = data.map((d) => d[field]);
          const uniqueValues = Array.from(new Set(values));
          // @ts-expect-error: Again...
          mapping.domain = uniqueValues;
          catDomainCache.set(field, uniqueValues);
        }
      }
    }
  }
}

// Pin axis tick values to the union of the two paired bin-boundary fields
// (e.g. x=start, x2=end for a histogram) so vega-lite's default "nice" step
// can't land ticks mid-bar. Reads from transformedDataFull so ticks reflect
// all bins, not just the filtered subset. No-op if data isn't ready or the
// fields aren't numeric.
function alignAxisToBinBoundaries(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vegaEncoding: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mapping: any[],
  primary: 'x' | 'y',
  partner: 'x2' | 'y2',
): void {
  const fullData = transformedDataFull.value;
  if (!fullData || fullData.length === 0) return;
  const primaryMap = mapping.find((m) => m.encoding === primary);
  const partnerMap = mapping.find((m) => m.encoding === partner);
  if (!primaryMap?.field || !partnerMap?.field) return;
  const boundaries = new Set<number>();
  for (const row of fullData) {
    const a = Number((row as Record<string, unknown>)[primaryMap.field]);
    const b = Number((row as Record<string, unknown>)[partnerMap.field]);
    if (Number.isFinite(a)) boundaries.add(a);
    if (Number.isFinite(b)) boundaries.add(b);
  }
  if (boundaries.size === 0) return;
  const values = Array.from(boundaries).sort((a, b) => a - b);
  if (vegaEncoding[primary].axis == null) {
    vegaEncoding[primary].axis = {};
  }
  vegaEncoding[primary].axis.values = values;
  vegaEncoding[primary].axis.labelOverlap = 'parity';
}

function isVegaLiteCompatible(spec: ParsedUDIGrammar): boolean {
  return !spec.representation.map((x) => x.mark).includes('row');
}

const transformError = ref();

const transformedData = ref<object[] | null>(null);
const transformedDataFull = ref<object[] | null>(null);
const isTransformedDataSubset = ref<boolean>(false);

function performDataTransformation(spec: ParsedUDIGrammar) {
  try {
    transformError.value = null;
    const dataObjects = dataSourcesStore.getDataObject(
      spec.source.map((x) => x.name),
      spec.transformation,
    );
    // Keep previous data visible while loading/null — avoids "Loading..." flash
    if (dataObjects == null) return;
    const { allData, displayData, isDisplayDataSubset } = dataObjects;

    transformedData.value = displayData;
    transformedDataFull.value = allData;
    isTransformedDataSubset.value = isDisplayDataSubset;
  } catch (error) {
    console.error('Failed to complete data transformation', error);
    transformError.value = error;
    // Clear stale data so the chart renders empty instead of keeping
    // the last successful state.
    transformedData.value = [];
    transformedDataFull.value = [];
  }
}

function convertToVegaSpec(spec: ParsedUDIGrammar): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vegaSpec: any = {
    $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
    // data: { url: './data/penguins.csv' },
    width: 'container',
    // height: 'container',
    data: { name: 'udi_data', values: [] },
  };

  // add data. Don't reset transformError here — performDataTransformation
  // owns it, and resetting would swallow an error set earlier in this
  // same buildVisualization cycle.
  vegaSpec.data!.values = transformedData.value;

  debugVegaData.value = vegaSpec.data.values;

  // add layers
  const inputLayers = spec.representation as VisualizationLayer[];
  if (!Array.isArray(inputLayers)) {
    throw new Error('invalid spec passed to vega conversion');
  }

  const zeroBaselineFields = getZeroBaselineFields(spec);

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
      if (
        (encoding === 'x' || encoding === 'y' || encoding === 'size') &&
        !('value' in map) &&
        map.type === 'quantitative' &&
        layer.mark !== 'bar' &&
        layer.mark !== 'rect' &&
        !zeroBaselineFields.has(map.field)
      ) {
        if (vegaEncoding[encoding].scale == null) {
          vegaEncoding[encoding].scale = {};
        }
        // scale.zero only applies to continuous scales; setting it on a
        // band (nominal) scale triggers "zero is dropped" in Vega-Lite v6
        // and breaks layered specs that mix quantitative + nominal axes.
        // Bar marks also need zero in their scale so the bar baseline
        // maps correctly — otherwise bars collapse to zero width when
        // the data range excludes 0. The shared-scale check via
        // zeroBaselineFields extends that to sibling layers in layered specs.
        vegaEncoding[encoding].scale['zero'] = false;
        // Note: no scale.padding here. setDefaultDomains already adds 5% padding
        // on each side for non-bar quantitative encodings. Adding scale.padding
        // on top of that caused axis ranges to extend well beyond the data
        // (e.g., a count axis starting at -20 for all-positive data).
      }
      if (layer.mark === 'area' && encoding === 'y') {
        vegaEncoding[encoding].stack = false;
      }
      // TODO: map our domain/range to vega format domain/range
      if ('domain' in map) {
        if (vegaEncoding[encoding].scale == null) {
          vegaEncoding[encoding].scale = {};
        }
        vegaEncoding[encoding].scale['domain'] = map.domain;
      }
      if ('range' in map) {
        if (vegaEncoding[encoding].scale == null) {
          vegaEncoding[encoding].scale = {};
        }
        vegaEncoding[encoding].scale['range'] = map.range;
      }
      if ('omitLegend' in map && map.omitLegend) {
        vegaEncoding[encoding].legend = null;
      }
      if ('title' in map && map.title != null) {
        vegaEncoding[encoding].title = map.title;
      }
    }

    let selectParam: {
      name: string;
      select: { type: 'point' | 'interval'; encodings?: string[]; on?: string };
      value?: RangeSelection | null;
    } | null = null;
    if (layer.select) {
      selectParam = {
        name: layer.select.name,
        select: {
          type: layer.select.how.type,
        },
      };
      if (layer.select.how.type === 'interval') {
        selectParam.select['encodings'] = layer.select.how.on.split('');
      }
      // else {
      //   // selectParam.select['on'] = 'click';
      //   // selectParam.select['encodings'] = 'sex';
      // }

      dataSourcesStore.watchDataSelection(
        layer.select.source,
        layer.select.name,
        layer.select.how.type, // TODO: set point if needed
      );
      if (selectParam.select.type === 'interval') {
        signalKeys.value = [layer.select.name];
        if (layer.select.how.type === 'interval' && layer.select.how.field) {
          const axes = layer.select.how.on.split('');
          const overrideField = layer.select.how.field;
          const fieldRemap: Record<string, string> = {};
          for (let i = 0; i < axes.length; i++) {
            const encodingMatch = mapping.find(
              (m) => m.encoding === axes[i] && 'field' in m,
            );
            if (encodingMatch && 'field' in encodingMatch) {
              const target = Array.isArray(overrideField)
                ? overrideField[i]
                : overrideField;
              if (target) {
                fieldRemap[encodingMatch.field] = target;
              }
            }
          }
          signalFieldMap.value[layer.select.name] = fieldRemap;
        }
      } else {
        pointSelect.value = layer.select;
      }
    }
    // For rect histograms (x/x2 or y/y2 pair), inset both anchors by a pixel
    // so adjacent bars have a symmetric 2px gap rather than touching or being
    // trimmed from one side only. Mirrors (and doubles) the default bin
    // spacing that vega-lite's `bar + bin: true` applies for free — rect
    // + explicit binby doesn't get it otherwise.
    // Also pin axis ticks to every bin boundary so tick marks line up with
    // bar edges instead of vega-lite's default "nice" step (which lands in
    // the middle of bars at coarse steps or oversamples at fine steps).
    // labelOverlap: 'parity' lets vega-lite drop crowded labels while
    // keeping all boundary ticks visible.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const markConfig: any = { type: layer.mark, tooltip: true };
    if (layer.mark === 'rect') {
      const hasXPair =
        mapping.some((m) => m.encoding === 'x') &&
        mapping.some((m) => m.encoding === 'x2');
      const hasYPair =
        mapping.some((m) => m.encoding === 'y') &&
        mapping.some((m) => m.encoding === 'y2');
      if (hasXPair) {
        markConfig.xOffset = 1;
        markConfig.x2Offset = -1;
        alignAxisToBinBoundaries(vegaEncoding, mapping, 'x', 'x2');
      }
      if (hasYPair) {
        markConfig.yOffset = 1;
        markConfig.y2Offset = -1;
        alignAxisToBinBoundaries(vegaEncoding, mapping, 'y', 'y2');
      }
    }
    const outputLayer: {
      mark: { type: VisualizationLayer['mark']; tooltip: boolean };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      encoding: any;
      params?: (typeof selectParam)[];
    } = {
      // tooltip: true shows a tooltip with all encoded field values on hover
      mark: markConfig,
      encoding: vegaEncoding,
    };
    if (selectParam && selectParam.select.type === 'interval') {
      outputLayer.params = [selectParam];
    }

    return outputLayer;
  });
  vegaSpec['layer'] = outputLayers;

  return JSON.stringify(vegaSpec);
}
const signalKeys = ref<string[]>([]);
const signalFieldMap = ref<Record<string, Record<string, string>>>({});
const pointSelect = ref<DataSelection>();

const debugVegaData = ref();

const slots = useSlots();
</script>

<template>
  <!-- Gate on per-instance readiness, not the shared dataSourcesStore.loading
       flag. Other consumers (e.g. queryData from a React host) can flip
       loading=true mid-session for their own fetches, which would otherwise
       make every mounted UDIVis flash back to "Loading..." even though its
       own data is already cached. -->
  <template v-if="instanceReady && visualizationBuilt">
    <div class="error-message" v-if="transformError">
      {{ transformError.message }}
    </div>
    <template v-if="slots.default">
      <slot
        :data="transformedData"
        :allData="transformedDataFull"
        :isSubset="isTransformedDataSubset"
      />
    </template>
    <template v-else-if="isVegaLiteComponent">
      <VegaLite
        :spec="vegaLiteSpec"
        :hide-actions="props.spec.config?.hideActions"
        :signal-keys="signalKeys"
        :signal-field-map="signalFieldMap"
        :point-select="pointSelect"
        :selections="props.selections"
      />
    </template>
    <template v-else>
      <TableComponent :data="transformedData" :spec="parsedSpec" />
    </template>
  </template>
  <template v-else>
    <p>Loading...</p>
  </template>
</template>

<style scoped lang="scss">
.error-message {
  color: #e53935; // $negative, but don't want quasar vars in component
  margin: 6px;
}
</style>
