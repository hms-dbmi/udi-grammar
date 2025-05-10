<script setup lang="ts">
import { computed, defineProps } from 'vue';
import { cloneDeep } from 'lodash';
import type { ColDef } from 'ag-grid-community';
import { type ParsedUDIGrammar } from './Parser';
import type { ExtendedRowMapping } from './TableUtil';
import { getDomainLookupKey } from './TableUtil';
import UDICellRenderer from './UDICellRenderer.vue';
defineExpose({
  UDICellRenderer,
});
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3'; // Vue Data Grid Component
import type {
  Domain,
  RowLayer,
  RowMapping,
  NumberDomain,
  StringDomain,
} from './GrammarTypes';

ModuleRegistry.registerModules([AllCommunityModule]);

interface TableComponentProps {
  spec: ParsedUDIGrammar | null;
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  data: Record<string, any>[] | null;
}

const props = defineProps<TableComponentProps>();

const representations = computed<RowLayer[] | null>(() => {
  if (!props.spec) return null;
  if (props.spec.representation.length === 0) {
    return null;
  }
  for (const representation of props.spec.representation) {
    if (representation.mark !== 'row') {
      throw new Error(
        'The representation must be a row layer in the table component for every layer',
      );
    }
  }
  return props.spec.representation as RowLayer[];
});

const allFields = computed(() => {
  if (!props.data) return [];
  if (props.data.length === 0) {
    return [];
  }
  const keys = Object.keys(props.data[0] ?? []);
  return keys;
});

const columnMappingLayers = computed<RowMapping[][]>(() => {
  // This will expand fields: "*" to include every possible field
  // and will populated empty column attributes with value from vield.
  if (!representations.value) return [];
  const columnMapping = [];
  for (const representation of representations.value) {
    const columnMappingLayer = [];
    if (!representation.mapping) {
      throw new Error('Mapping is required for the table component');
    }
    let mapping = cloneDeep(representation.mapping);
    if (!Array.isArray(mapping)) {
      mapping = [mapping];
    }
    for (const part of mapping) {
      if (part.field === '*') {
        for (const field of allFields.value) {
          columnMappingLayer.push({
            ...part,
            field: field,
            column: field,
          });
        }
      } else {
        if (!part.column) {
          part.column = part.field;
        }
        columnMappingLayer.push(part);
      }
    }
    columnMapping.push(columnMappingLayer);
  }

  return columnMapping;
});

interface LayeredRowMapping extends RowMapping {
  layer: string;
}

const flatColumnMapping = computed<LayeredRowMapping[]>(() => {
  if (columnMappingLayers.value.length === 0) return [];
  const flatColumnMapping: LayeredRowMapping[] = [];
  for (let i = 0; i < columnMappingLayers.value.length; i++) {
    const columnMappingLayer = columnMappingLayers.value[i];
    for (const columnMapping of columnMappingLayer!) {
      flatColumnMapping.push({ layer: i.toString(), ...columnMapping });
    }
  }
  return flatColumnMapping;
});

function getNumberDomain(
  data: Record<string, unknown>[],
  fields: string | string[],
): NumberDomain {
  let fieldList = fields;
  if (typeof fields === 'string') {
    fieldList = [fields];
  }
  if (fieldList.length === 0) {
    throw new Error('Field list is empty');
  }

  let min = Infinity;
  let max = -Infinity;
  for (const field of fieldList) {
    for (const d of data) {
      const value = d[field];
      if (value === null || value === undefined) {
        continue;
      }
      let numberValue: number = 0;
      if (typeof value !== 'number') {
        numberValue = +value;
        console.warn(
          // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
          `Value for field ${field} is not a number: ${value}. Converting to number.`,
        );
      } else {
        numberValue = value;
      }
      if (numberValue < min) {
        min = numberValue;
      }
      if (numberValue > max) {
        max = numberValue;
      }
    }
  }
  return { min, max };
}

function getStringDomain(
  data: Record<string, string>[],
  fields: string | string[],
): StringDomain {
  let fieldList = fields;
  if (typeof fields === 'string') {
    fieldList = [fields];
  }
  if (fieldList.length === 0) {
    throw new Error('Field list is empty');
  }
  const values = new Set<string>();
  for (const field of fieldList) {
    const valueList = data
      .filter((d) => d[field] !== null && typeof d[field] !== 'undefined')
      .map((d) => d[field]) as string[];
    for (const value of valueList) {
      values.add(value);
    }
  }
  return Array.from(values);
}
const fieldDomains = computed<Map<string, Domain>>(() => {
  const domainMap = new Map<string, Domain>();
  if (!flatColumnMapping.value) return domainMap;
  if (!props.data) return domainMap;
  if (props.data.length === 0) return domainMap;

  for (const mapping of flatColumnMapping.value) {
    const field = mapping.field;
    const type = mapping.type;
    const k = getDomainLookupKey(mapping);
    if (domainMap.has(k)) {
      continue;
    }
    if (mapping.domain) {
      if ('numberFields' in mapping.domain) {
        const domain = getNumberDomain(props.data, mapping.domain.numberFields);
        domainMap.set(k, domain);
      } else if ('categoryFields' in mapping.domain) {
        const domain = getStringDomain(
          props.data,
          mapping.domain.categoryFields,
        );
        domainMap.set(k, domain);
      } else {
        domainMap.set(k, mapping.domain);
      }
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
  if (flatColumnMapping.value.length === 0) {
    return [];
  }

  const mappingWithDomains: ExtendedRowMapping[] = flatColumnMapping.value.map(
    (mapping) => {
      const k = getDomainLookupKey(mapping);
      if (fieldDomains.value.has(k)) {
        const domain = fieldDomains.value.get(k);
        return {
          ...mapping,
          domain: domain,
        } as ExtendedRowMapping;
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
      /* eslint-disable  @typescript-eslint/no-explicit-any */
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
    :rowHeight="20"
  >
  </ag-grid-vue>
</template>

<style scoped lang="scss"></style>
