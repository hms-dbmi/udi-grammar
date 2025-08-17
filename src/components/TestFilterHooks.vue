<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { ParsedUDIGrammar } from './Parser';
import type { DataSelections } from './DataSourcesStore';

interface TestFilterHooksProps {
  spec: ParsedUDIGrammar;
  selections?: SelectionParams[];
  testType: 'read' | 'write' | 'linked';
}

interface SelectionParams {
  selectionName: string;
  entity: string;
  field: string;
  minValue?: number;
  maxValue?: number;
}

const props = defineProps<TestFilterHooksProps>();

// const rangeModel = ref({
//   min: props?.selections?.minValue,
//   max: props?.selections?.maxValue,
// });

const rangeModels = ref<
  { min: number; max: number; selectionName: string; field: string }[]
>([]);
for (const selection of props.selections || []) {
  rangeModels.value.push({
    min: selection.minValue ?? 0,
    max: selection.maxValue ?? 100,
    selectionName: selection.selectionName,
    field: selection.field,
  });
}

const udiVisSelections = computed(() => {
  const visSelections = {};
  if (!props.selections) return visSelections;
  for (let i = 0; i < props.selections.length; i++) {
    const selection = props.selections[i];
    const rangeModel = rangeModels.value[i];
    if (!selection || !rangeModel) continue;
    if (!(selection.selectionName in visSelections)) {
      visSelections[selection.selectionName] = {
        type: 'interval',
        dataSourceKey: selection.entity,
        selection: {
          [selection.field]: [rangeModel.min, rangeModel.max],
        },
      };
    } else {
      visSelections[selection.selectionName].selection[selection.field] = [
        rangeModel.min,
        rangeModel.max,
      ];
    }
  }
  return visSelections;
});

function handleSelectionChange(selection: DataSelections) {
  // console.log('handle selection change: ', selection);
  for (const rangeModel of rangeModels.value) {
    const selectionName = rangeModel.selectionName;
    if (selection[selectionName]) {
      const updatedRange =
        selection[selectionName].selection[
          props.selections?.find((s) => s.field === rangeModel.field)?.field ??
            'UNKNOWN_FIELD'
        ];
      if (updatedRange) {
        rangeModel.min = updatedRange[0];
        rangeModel.max = updatedRange[1];
      }
    }
  }
}
</script>

<template>
  <template v-if="props.testType === 'read'">
    <h2>Read Test</h2>
    <template v-for="(rangeModel, index) in rangeModels" :key="index">
      <div>{{ props.selections[index].field }}</div>
      <div>Min: {{ rangeModel.min }}</div>
      <div>Max: {{ rangeModel.max }}</div>
      <hr />
    </template>
    <UDIVis :spec="spec" @selection-change="handleSelectionChange"> </UDIVis>
  </template>
  <template v-if="props.testType === 'write'">
    <h2>Write Test</h2>
    <template v-for="(rangeModel, index) in rangeModels" :key="index">
      <div>{{ props.selections[index].field }}</div>
      <div>
        <input
          type="range"
          v-model="rangeModel.min"
          :min="props.selections[index].minValue"
          :max="props.selections[index].maxValue"
        />
        Min: {{ rangeModel.min }}
      </div>
      <div>
        <input
          type="range"
          v-model="rangeModel.max"
          :min="props.selections[index].minValue"
          :max="props.selections[index].maxValue"
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
      <div>{{ props.selections[index].field }}</div>
      <div>
        <input
          type="range"
          v-model.number="rangeModel.min"
          :min="props.selections[index].minValue"
          :max="props.selections[index].maxValue"
        />
        Min: {{ rangeModel.min }}
      </div>
      <div>
        <input
          type="range"
          v-model.number="rangeModel.max"
          :min="props.selections[index].minValue"
          :max="props.selections[index].maxValue"
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
</template>

<style scoped lang="scss"></style>
