<script setup lang="ts">
import { ref, computed, watch, onMounted, defineProps } from 'vue';
import { cloneDeep } from 'lodash';
import type { ColDef } from 'ag-grid-community';
import { type ParsedUDIGrammar } from './Parser';
import type {
  Domain,
  NumberDomain,
  RowMappingWithDomain,
  StringDomain,
} from './TableUtil';
import { getDomainLookupKey } from './TableUtil';
import UDICellRenderer from './UDICellRenderer.vue';
defineExpose({
  UDICellRenderer,
});
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3'; // Vue Data Grid Component
import type { RowLayer, RowMapping } from './GrammarTypes';

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

function getNumberDomain(
  data: Record<string, any>[],
  field: string,
): NumberDomain {
  let min = Infinity;
  let max = -Infinity;
  for (const d of data) {
    const value = d[field];
    if (value === null || value === undefined) {
      continue;
    }
    if (value < min) {
      min = value;
    }
    if (value > max) {
      max = value;
    }
  }
  return { min, max };
}

function getStringDomain(
  data: Record<string, any>[],
  field: string,
): StringDomain {
  const valueList = data.map((d) => d[field]);
  const values = new Set<string>(valueList);
  return { values: Array.from(values) };
}
const fieldDomains = computed<Map<string, Domain>>(() => {
  const domainMap = new Map<string, Domain>();
  if (!columnMapping.value) return domainMap;
  if (!props.data) return domainMap;
  if (props.data.length === 0) return domainMap;

  for (const mapping of columnMapping.value) {
    const field = mapping.field;
    const type = mapping.type;
    const k = getDomainLookupKey(mapping);
    if (domainMap.has(k)) {
      continue;
    }
    if (type === 'quantitative') {
      const domain = getNumberDomain(props.data, field);
      domainMap.set(k, domain);
    } else if (type === 'nominal' || type === 'ordinal') {
      const domain = getStringDomain(props.data, field);
      domainMap.set(k, domain);
    }
  }
  return domainMap;
});

const colDefs = computed<ColDef[]>(() => {
  if (columnMapping.value.length === 0) {
    return [];
  }

  const mappingWithDomains: RowMappingWithDomain[] = columnMapping.value.map(
    (mapping) => {
      const k = getDomainLookupKey(mapping);
      if (fieldDomains.value.has(k)) {
        const domain = fieldDomains.value.get(k);
        return {
          ...mapping,
          domain: domain,
        } as RowMappingWithDomain;
      }
      throw new Error(
        `Domain not found for mapping ${JSON.stringify(mapping)}`,
      );
    },
  );

  // group the column mapping by the column name
  const groupedMapping = Object.groupBy(
    mappingWithDomains,
    (mapping) => mapping.column!,
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
