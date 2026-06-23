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
  values: string[];
}
const props = defineProps<TestIntervalHooksProps>();

interface PointFilter {
  allPossibleValues: string[];
  selectedValues: string[];
  selectionName: string;
  field: string;
}

const pointFilters = ref<PointFilter[]>([]);
for (const selection of props.selections ?? []) {
  pointFilters.value.push({
    allPossibleValues: selection.values,
    selectedValues: [],
    selectionName: selection.selectionName,
    field: selection.field,
  });
}

// Shape of a point selection entry the toolkit's DataSourcesStore expects
// when `selections` is forwarded externally — same union sibling as the
// interval variant in TestIntervalFilterHooks.
interface VisPointSelection {
  type: 'point';
  dataSourceKey: string;
  selection: Record<string, string[]>;
}

const udiVisSelections = computed<Record<string, VisPointSelection>>(() => {
  const visSelections: Record<string, VisPointSelection> = {};
  if (!props.selections) return visSelections;
  for (let i = 0; i < props.selections.length; i++) {
    const selection = props.selections[i];
    const pointFilter = pointFilters.value[i];
    if (!selection || !pointFilter) continue;
    const existing = visSelections[selection.selectionName];
    if (!existing) {
      visSelections[selection.selectionName] = {
        type: 'point',
        dataSourceKey: selection.entity,
        selection: {
          [selection.field]: pointFilter.selectedValues,
        },
      };
    } else {
      existing.selection[selection.field] = pointFilter.selectedValues;
    }
  }
  return visSelections;
});

function handleSelectionChange(selection: DataSelections) {
  for (const pointFilter of pointFilters.value) {
    const active = selection[pointFilter.selectionName];
    if (!active || !active.selection) {
      pointFilter.selectedValues = [];
      continue;
    }
    // Point-selection payloads are `Record<string, string[]>` at runtime;
    // the store types them as a union with the interval shape.
    const payload = active.selection as Record<string, string[]>;
    const updatedValues = payload[pointFilter.field];
    if (updatedValues) {
      pointFilter.selectedValues = updatedValues;
    }
  }
}
</script>

<template>
  <template v-if="props.testType === 'read'">
    <h2>Read Test</h2>
    <template v-for="(pointFilter, index) in pointFilters" :key="index">
      <div>{{ pointFilter.field }}</div>
      <ul>
        <li v-for="value in pointFilter.selectedValues" :key="value">
          {{ value }}
        </li>
      </ul>
      <hr />
    </template>
    <UDIVis :spec="spec" @selection-change="handleSelectionChange"> </UDIVis>
  </template>

  <template v-if="props.testType === 'write'">
    <h2>Write Test</h2>
    <template v-for="(pointFilter, index) in pointFilters" :key="index">
      <div>{{ pointFilter.field }}</div>
      <ul>
        <li
          v-for="possibleValue in pointFilter.allPossibleValues"
          :key="possibleValue"
        >
          <label>
            <!-- `<input>` is self-closing in HTML5; the previous markup
                 wrapped the label text *inside* the input which Vue's
                 template parser flagged as an invalid end tag. -->
            <input
              type="checkbox"
              v-model="pointFilter.selectedValues"
              :value="possibleValue"
            />
            {{ possibleValue }}
          </label>
        </li>
      </ul>
      <hr />
      <hr />
    </template>
    <UDIVis :spec="spec" :selections="udiVisSelections"></UDIVis>
  </template>

  <template v-if="props.testType === 'linked'">
    <h2>Linked Test</h2>
    <template v-for="(pointFilter, index) in pointFilters" :key="index">
      <div>{{ pointFilter.field }}</div>
      <ul>
        <li
          v-for="possibleValue in pointFilter.allPossibleValues"
          :key="possibleValue"
        >
          <label>
            <input
              type="checkbox"
              v-model="pointFilter.selectedValues"
              :value="possibleValue"
            />
            {{ possibleValue }}
          </label>
        </li>
      </ul>
      <hr />
      <hr />
    </template>
    <UDIVis
      :spec="spec"
      :selections="udiVisSelections"
      @selection-change="handleSelectionChange"
    ></UDIVis>
  </template>
  <TestMultipleSpecs v-if="additionalSpecs" :specs="additionalSpecs" />
</template>

<style scoped lang="scss"></style>
