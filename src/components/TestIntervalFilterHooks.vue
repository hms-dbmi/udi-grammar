<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ParsedUDIGrammar } from './Parser';
import type { DataSelections } from './DataSourcesStore';
import TestMultipleSpecs from './TestMultipleSpecs.vue';

interface TestIntervalHooksProps {
  spec: ParsedUDIGrammar;
  selections?: SelectionParams[];
  testType: 'read' | 'write' | 'linked';
  additionalSpecs?: ParsedUDIGrammar[];
}

interface SelectionParams {
  selectionName: string;
  entity: string;
  field: string;
  minValue?: number;
  maxValue?: number;
}

const props = defineProps<TestIntervalHooksProps>();

// Each row owns the data the template needs (min/max + the slider bounds)
// so the template can iterate `rangeModels` alone without re-indexing back
// into the optional `props.selections` array — which `noUncheckedIndexedAccess`
// would otherwise widen to `SelectionParams | undefined`.
interface RangeModel {
  min: number;
  max: number;
  selectionName: string;
  field: string;
  minValue: number;
  maxValue: number;
}

const rangeModels = ref<RangeModel[]>([]);
for (const selection of props.selections ?? []) {
  rangeModels.value.push({
    min: selection.minValue ?? 0,
    max: selection.maxValue ?? 100,
    selectionName: selection.selectionName,
    field: selection.field,
    minValue: selection.minValue ?? 0,
    maxValue: selection.maxValue ?? 100,
  });
}

// Shape of an interval entry the toolkit's DataSourcesStore expects when
// `selections` is forwarded externally.
interface VisIntervalSelection {
  type: 'interval';
  dataSourceKey: string;
  selection: Record<string, [number, number]>;
}

const udiVisSelections = computed<Record<string, VisIntervalSelection>>(() => {
  const visSelections: Record<string, VisIntervalSelection> = {};
  if (!props.selections) return visSelections;
  for (let i = 0; i < props.selections.length; i++) {
    const selection = props.selections[i];
    const rangeModel = rangeModels.value[i];
    if (!selection || !rangeModel) continue;
    const existing = visSelections[selection.selectionName];
    if (!existing) {
      visSelections[selection.selectionName] = {
        type: 'interval',
        dataSourceKey: selection.entity,
        selection: {
          [selection.field]: [rangeModel.min, rangeModel.max],
        },
      };
    } else {
      existing.selection[selection.field] = [rangeModel.min, rangeModel.max];
    }
  }
  return visSelections;
});

function handleSelectionChange(selection: DataSelections) {
  for (const rangeModel of rangeModels.value) {
    const active = selection[rangeModel.selectionName];
    if (!active || !active.selection) continue;
    // The stored selection payload is a union of `RangeSelection`
    // (`[number, number]` per field) and `PointSelection`
    // (`string[]` per field). For an interval test the runtime
    // guarantees the former — coerce defensively so `noImplicitAny`
    // doesn't trip if a stray point selection is delivered.
    const payload = active.selection as Record<string, [number, number]>;
    const updatedRange = payload[rangeModel.field];
    if (updatedRange) {
      rangeModel.min = Number(updatedRange[0]);
      rangeModel.max = Number(updatedRange[1]);
    }
  }
}
</script>

<template>
  <template v-if="props.testType === 'read'">
    <h2>Read Test</h2>
    <template v-for="(rangeModel, index) in rangeModels" :key="index">
      <div>{{ rangeModel.field }}</div>
      <div>Min: {{ rangeModel.min }}</div>
      <div>Max: {{ rangeModel.max }}</div>
      <hr />
    </template>
    <UDIVis :spec="spec" @selection-change="handleSelectionChange"> </UDIVis>
  </template>
  <template v-if="props.testType === 'write'">
    <h2>Write Test</h2>
    <template v-for="(rangeModel, index) in rangeModels" :key="index">
      <div>{{ rangeModel.field }}</div>
      <div>
        <input
          type="range"
          v-model="rangeModel.min"
          :min="rangeModel.minValue"
          :max="rangeModel.maxValue"
        />
        Min: {{ rangeModel.min }}
      </div>
      <div>
        <input
          type="range"
          v-model="rangeModel.max"
          :min="rangeModel.minValue"
          :max="rangeModel.maxValue"
        />
        Max: {{ rangeModel.max }}
      </div>
      <hr />
    </template>
    <UDIVis :spec="spec" :selections="udiVisSelections"></UDIVis>
  </template>

  <template v-if="props.testType === 'linked'">
    <h2>Linked Test</h2>
    <template v-for="(rangeModel, index) in rangeModels" :key="index">
      <div>{{ rangeModel.field }}</div>
      <div>
        <input
          type="range"
          v-model.number="rangeModel.min"
          :min="rangeModel.minValue"
          :max="rangeModel.maxValue"
        />
        Min: {{ rangeModel.min }}
      </div>
      <div>
        <input
          type="range"
          v-model.number="rangeModel.max"
          :min="rangeModel.minValue"
          :max="rangeModel.maxValue"
        />
        Max: {{ rangeModel.max }}
      </div>
    </template>
    <UDIVis
      :spec="spec"
      :selections="udiVisSelections"
      @selection-change="handleSelectionChange"
    >
    </UDIVis>
  </template>
  <TestMultipleSpecs v-if="additionalSpecs" :specs="additionalSpecs" />
</template>

<style scoped lang="scss"></style>
