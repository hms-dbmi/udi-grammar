<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
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

const udiVisSelections = computed(() => {
  const visSelections = {};
  if (!props.selections) return visSelections;
  for (let i = 0; i < props.selections.length; i++) {
    const selection = props.selections[i];
    const pointFilter = pointFilters.value[i];
    if (!selection || !pointFilter) continue;
    if (!(selection.selectionName in visSelections)) {
      visSelections[selection.selectionName] = {
        type: 'point',
        dataSourceKey: selection.entity,
        selection: {
          [selection.field]: pointFilter.selectedValues,
        },
      };
    } else {
      visSelections[selection.selectionName].selection[selection.field] = pointFilter.selectedValues;
    }
  }
  return visSelections;
});

function handleSelectionChange(selection: DataSelections) {
  // console.log('handle selection change: ', selection);
  for (const pointFilter of pointFilters.value) {
    const selectionName = pointFilter.selectionName;
    if (!selection[selectionName] || !selection[selectionName].selection) {
      pointFilter.selectedValues = [];
      continue;
    }
    const updatedValues =
      selection[selectionName].selection[
        props.selections?.find((s) => s.field === pointFilter.field)?.field ??
          'UNKNOWN_FIELD'
      ];
    if (updatedValues) {
      pointFilter.selectedValues = updatedValues;
    }
  }
}

function checked(possibleValue: string, pointFilter: PointFilter): boolean {
  return pointFilter.selectedValues.includes(possibleValue);
}
</script>

<template>
  <template v-if="props.testType === 'read'">
    <h2>Read Test</h2>
    <template v-for="(pointFilter, index) in pointFilters" :key="index">
      <div>{{ props.selections[index].field }}</div>
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
      <div>{{ props.selections[index].field }}</div>
      <ul>
        <li v-for="possibleValue in pointFilter.allPossibleValues" :key="possibleValue">
          <input type="checkbox" v-model="pointFilter.selectedValues" :value="possibleValue"> {{ possibleValue }}</input>
        </li>
      </ul>
      <hr />
      <hr />
    </template>
    <UDIVis :spec="spec" :selections="udiVisSelections"></UDIVis>
  </template>


  <template v-if="props.testType === 'linked'">
    <h2>Write Test</h2>
    <template v-for="(pointFilter, index) in pointFilters" :key="index">
      <div>{{ props.selections[index].field }}</div>
      <ul>
        <li v-for="possibleValue in pointFilter.allPossibleValues" :key="possibleValue">
          <input type="checkbox" v-model="pointFilter.selectedValues" :value="possibleValue"> {{ possibleValue }}</input>
        </li>
      </ul>
      <hr />
      <hr />
    </template>
    <UDIVis :spec="spec" :selections="udiVisSelections" @selection-change="handleSelectionChange"></UDIVis>
  </template>
  <TestMultipleSpecs v-if="additionalSpecs" :specs="additionalSpecs" />
</template>

<style scoped lang="scss"></style>
