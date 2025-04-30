<script setup lang="ts">
import { ref, computed, watch, onMounted, defineProps } from 'vue';
import { cloneDeep } from 'lodash';
import type { ColDef } from 'ag-grid-community';
import { type ParsedUDIGrammar } from './Parser';
import UDICellRenderer from './UDICellRenderer.vue';
defineExpose({
  UDICellRenderer,
});
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3'; // Vue Data Grid Component
import type { RowLayer } from './GrammarTypes';

ModuleRegistry.registerModules([AllCommunityModule]);

interface TableComponentProps {
  spec: ParsedUDIGrammar;
  data: object[];
}

const props = defineProps<TableComponentProps>();

const representation = computed<RowLayer | null>(() => {
  if (!props.spec) return null;
  if (props.spec.representation.length === 0) {
    return null;
  }
  if (props.spec.representation.length === 1) {
    const representation = props.spec.representation[0];
    if (representation?.mark !== 'row') {
      throw new Error(
        'The representation must be a row layer in the table component',
      );
    }
    return representation;
  }
  throw new Error(
    'Multiple representations are not supported in the table component',
  );
  // TODO: should also update the spec to reflect this.
});

const allFields = computed(() => {
  if (!props.data) return [];
  if (props.data.length === 0) {
    return [];
  }
  const keys = Object.keys(props.data[0] ?? []);
  return keys;
});

const columnMapping = computed(() => {
  // This will expand fields: "*" to include every possible field
  // and will populated empty column attributes with value from vield.
  const columnMapping = [];
  if (!representation.value) return [];
  let mapping = cloneDeep(representation.value.mapping);
  if (!Array.isArray(mapping)) {
    mapping = [mapping];
  }
  for (const part of mapping) {
    if (part.field === '*') {
      for (const field of allFields.value) {
        columnMapping.push({
          ...part,
          field: field,
          column: field,
        });
      }
    } else {
      if (!part.column) {
        part.column = part.field;
      }
      columnMapping.push(part);
    }
  }
  return columnMapping;
});

const colDefs = computed(() => {
  if (columnMapping.value.length === 0) {
    return [];
  }

  // group the column mapping by the column name
  const groupedMapping = columnMapping.value.reduce(
    (acc, part) => {
      if (!acc[part.column!]) {
        acc[part.column!] = [];
      }
      acc[part.column!]!.push(part);
      return acc;
    },
    {} as Record<string, typeof columnMapping.value>,
  );

  const keys = Object.keys(groupedMapping);
  return [
    ...keys.map((key) => ({
      headerName: key,
      field: key,
      cellRenderer: 'UDICellRenderer',
      cellRendererParams: {
        // pass the representation to the cell renderer
        udiColumnMapping: groupedMapping[key],
      },
      valueGetter: (params: any) => {
        // get the value from the data object
        const columnMapping = groupedMapping[key];
        if (!columnMapping) return null;
        if (columnMapping.length === 0) return null;
        const field = columnMapping[0]?.field ?? null;
        if (!field) return null;
        return params.data[field];
      },
      // valueGetter: (params: any) => {
      //   return params.data;
      // },
      // comparator: (a: any, b: any) => {
      //   // compare the values of the data object
      //   const columnMapping = groupedMapping[key];
      //   if (!columnMapping) return 0;
      //   if (columnMapping.length === 0) return 0;
      //   const field = columnMapping[0]?.field ?? null;
      //   if (!field) return 0;
      //   return a[field] - b[field];
      //   would have to look across all the relevant fields, and handle
      //   text fields, and order.
      // },
    })),
  ];
});
</script>

<template>
  <ag-grid-vue
    :rowData="props.data"
    :columnDefs="colDefs"
    style="height: 500px"
    :rowHeight="40"
  >
  </ag-grid-vue>
</template>

<style scoped lang="scss"></style>
