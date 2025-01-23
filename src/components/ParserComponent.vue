<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import {
  type ParsedUDIGrammar,
  type UDIGrammar,
  parseSpecification,
} from './Parser';
import { useDataSourcesStore } from '@/stores/DataSourcesStore';

const dataSourcesStore = useDataSourcesStore();

export interface ParserProps {
  spec: UDIGrammar;
}

const props = defineProps<ParserProps>();

const parsedSpec = ref<ParsedUDIGrammar | null>(null);

onMounted(() => {
  // parse/validate grammar
  parsedSpec.value = parseSpecification(props.spec);
  for (const dataSource of parsedSpec.value.dataSource) {
    dataSourcesStore.initDataSource(dataSource);
  }
});
</script>

<template>
  <div>Blargen Flargen</div>
  <div>{{ props.spec }}</div>
</template>

<style scoped lang="scss"></style>
