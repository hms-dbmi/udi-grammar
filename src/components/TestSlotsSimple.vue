<script setup lang="ts">
// `span` was an unused import from vega left over from a removed
// implementation. Dropping it silences the @typescript-eslint/no-unused-vars
// warning.
import { type ParsedUDIGrammar } from './Parser';
import UDIVis from 'src/components/UDIVis.vue';

interface TestSlotsSimpleProps {
  defaultSpec: ParsedUDIGrammar;
  customSpec: ParsedUDIGrammar;
}

const props = defineProps<TestSlotsSimpleProps>();
</script>

<template>
  <div class="flex-container">
    <div class="inner-container">
      <UDIVis :spec="props.defaultSpec" />
    </div>
    <div class="inner-container">
      <UDIVis :spec="props.customSpec">
        <template #default="{ data, allData, isSubset }">
          <div>data: {{ data }}</div>
          <div>allData: {{ allData }}</div>
          <div>isSubset: {{ isSubset }}</div>

          <!-- simple usage example -->
          <!-- <span v-if="data[0].count !== allData[0].count"
            >{{ data[0].count }} /
          </span>
          <span>{{ allData[0].count }}</span> -->
        </template>
      </UDIVis>
    </div>
  </div>
</template>

<style scoped lang="scss">
.flex-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  flex-direction: row;
}
.inner-container {
  flex: 1;
  min-width: 600px;
  max-width: 1200px;
}
</style>
