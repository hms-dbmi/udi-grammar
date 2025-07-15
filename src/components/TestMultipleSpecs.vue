<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { type ParsedUDIGrammar } from './Parser';
import UDIVis from 'src/components/UDIVis.vue';

interface TestMultipleSpecsProps {
  specs: ParsedUDIGrammar[];
}

const props = defineProps<TestMultipleSpecsProps>();
</script>

<template>
  <div class="flex-container">
    <div
      class="inner-container"
      v-for="(spec, index) in props.specs"
      :key="index"
    >
      <UDIVis :spec="spec"> </UDIVis>
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
