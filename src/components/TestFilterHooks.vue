<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { ParsedUDIGrammar } from './Parser';
import type { DataSelection, DataSelections } from './DataSourcesStore';

interface TestFilterHooksProps {
  spec: ParsedUDIGrammar;
  selections?: SelectionParams;
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

const rangeModel = ref({
  min: props?.selections?.minValue,
  max: props?.selections?.maxValue,
});

const selections = computed(() => {
  // console.log('filter hook selections recalculated');
  return {
    [props?.selections?.selectionName ?? 'UNKNOWN_SELECTION_NAME']: {
      type: 'interval',
      dataSourceKey: props?.selections?.entity,
      selection: {
        [props?.selections?.field ?? 'UNKONWN_FIELD']: [
          rangeModel.value.min,
          rangeModel.value.max,
        ],
      },
    },
  };
});

function handleSelectionChange(selection: DataSelections) {
  // console.log('handle selection change');
  const updatedRange =
    selection[props?.selections?.selectionName ?? 'UNKNOWN_SELECTION_NAME']
      ?.selection?.[props?.selections?.field ?? 'UNKNOWN_FIELD'];
  if (!updatedRange) return;
  if (updatedRange) {
    rangeModel.value.min = updatedRange[0];
    rangeModel.value.max = updatedRange[1];
  }
}
</script>

<template>
  <template v-if="props.testType === 'read'">
    <h2>Read Test</h2>
    <div>Min: {{ rangeModel.min }}</div>
    <div>Max: {{ rangeModel.max }}</div>
    <UDIVis :spec="spec" @selection-change="handleSelectionChange"> </UDIVis>
  </template>
  <template v-if="props.testType === 'write'">
    <h2>Read Test</h2>
    <div>
      <input
        type="range"
        v-model="rangeModel.min"
        :min="props.selections.minValue"
        :max="props.selections.maxValue"
      />
      Min: {{ rangeModel.min }}
    </div>
    <div>
      <input
        type="range"
        v-model="rangeModel.max"
        :min="props.selections.minValue"
        :max="props.selections.maxValue"
      />
      Max: {{ rangeModel.max }}
    </div>
    <UDIVis :spec="spec" :selections="selections"> </UDIVis>
  </template>

  <template v-if="props.testType === 'linked'">
    <h2>Read Test</h2>
    <div>
      <input
        type="range"
        v-model.number="rangeModel.min"
        :min="props.selections.minValue"
        :max="props.selections.maxValue"
      />
      Min: {{ rangeModel.min }}
    </div>
    <div>
      <input
        type="range"
        v-model.number="rangeModel.max"
        :min="props.selections.minValue"
        :max="props.selections.maxValue"
      />
      Max: {{ rangeModel.max }}
    </div>
    <UDIVis
      :spec="spec"
      :selections="selections"
      @selection-change="handleSelectionChange"
    >
    </UDIVis>
  </template>
</template>

<style scoped lang="scss"></style>
