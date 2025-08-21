import { ref } from 'vue';
import { density1d, nrd } from 'fast-kde';
import { cloneDeep, isEqual } from 'lodash';
import type {
  AggregateFunction,
  DataSource,
  DataTransformation,
  DirectionalOrder,
  FilterEntityRelationship,
  FilterMatch,
} from './GrammarTypes';
// import { DuckDB, init } from './dataWrappers/DuckDB.js';
import {
  loadCSV,
  agg,
  op,
  from,
  bin,
  rolling,
  escape,
  desc,
  type ColumnTable,
} from 'arquero';
import type {
  ColumnGetter,
  ExprObject,
  OrderKey,
  TableExpr,
} from 'arquero/dist/types/table/types';
import { defineStore } from 'pinia';

interface DataInterface {
  source: DataSource;
  dest: ColumnTable; // TODO: make more generic
}

export interface DataSourcesState {
  [key: string]: DataInterface;
}

export interface DataSelection {
  dataSourceKey: string;
  selection: null | RangeSelection | PointSelection;
  type: 'interval' | 'point';
}

export interface DataSelections {
  [key: string]: DataSelection;
}

export interface RangeSelection {
  [field: string]: [min: number, max: number];
}

export interface PointSelection {
  // the field is the name of thing selected, e.g. "species"
  // and the values are the selected values, e.g. ["setosa", "versicolor"]
  [field: string]: string[];
}

export const useDataSourcesStore = defineStore('DataSourcesStore', () => {
  const dataSources = ref<DataSourcesState>({});
  const dataSelections = ref<DataSelections>({});

  function bindExternalDataSelections(
    externalSelections: DataSelections,
  ): void {
    // console.log('bind');
    for (const [selectionName, selection] of Object.entries(
      externalSelections,
    )) {
      if (selectionName in dataSelections.value) {
        console.warn(
          `Selection ${selectionName} already exists, overwriting it.`,
        );
      }
      dataSelections.value[selectionName] = selection;
    }
    selectionHash.value = JSON.stringify(dataSelections.value);
  }

  function watchDataSelection(
    dataSourceKey: string,
    selectionName: string,
    type: 'point' | 'interval',
  ): { alreadyExists: boolean } {
    if (selectionName in dataSelections.value) {
      return { alreadyExists: true };
    }
    dataSelections.value[selectionName] = {
      dataSourceKey,
      selection: null,
      type,
    };
    return { alreadyExists: false };
  }

  function updateDataSelection(
    selectionName: string,
    selection: RangeSelection | PointSelection | null,
  ) {
    if (!(selectionName in dataSelections.value)) {
      throw new Error(`Selection name ${selectionName} not found`);
    }
    dataSelections.value[selectionName]!.selection = selection;
    selectionHash.value = JSON.stringify(dataSelections.value);
  }

  function clearDataSelection(selectionName: string): void {
    updateDataSelection(selectionName, null);
  }

  function getDataSelection(
    selectionName: string,
  ): RangeSelection | PointSelection | null {
    if (!(selectionName in dataSelections.value)) {
      throw new Error(`Selection name ${selectionName} not found`);
    }
    return dataSelections.value[selectionName]!.selection;
  }

  function RangeSelectionToArqueroFilter(
    selection: RangeSelection | null,
  ): string | null {
    if (selection === null) return null;
    const filters: string[] = [];
    for (const [field, range] of Object.entries(selection)) {
      // console.log('range:', range);
      const [min, max] = range;
      if (min != null && max != null) {
        filters.push(`d['${field}'] >= ${min} && d['${field}'] <= ${max}`);
      } else if (min != null) {
        filters.push(`d['${field}'] >= ${min}`);
      } else if (max != null) {
        filters.push(`d['${field}'] <= ${max}`);
      }
    }
    return filters.join(' && ');
  }

  function PointSelectionToArqueroFilter(
    selection: PointSelection | null,
  ): string | null {
    if (selection === null) return null;
    const filters: string[] = [];
    for (const [field, values] of Object.entries(selection)) {
      if (values.length === 0) continue; // skip empty selections
      const innerFilters: string[] = [];
      for (const value of values) {
        innerFilters.push(`d['${field}'] === ${JSON.stringify(value)}`);
      }
      filters.push(`(${innerFilters.join(' || ')})`);
    }
    return filters.join(' && ');
  }

  function selectionToArqueroFilter(dataSelection: DataSelection) {
    const { type, selection } = dataSelection;

    if (type === 'point') {
      return PointSelectionToArqueroFilter(selection as PointSelection);
    }

    return RangeSelectionToArqueroFilter(selection as RangeSelection);
  }

  function GetMappedArqueroFilter({
    key,
    inTable,
    selectionName,
    selectionMatching = 'any',
    selectionEntityRelationship,
    selectionSourceKey,
  }: {
    key: string;
    inTable: ColumnTable;
    selectionName: string;
    selectionMatching?: FilterMatch | undefined;
    selectionEntityRelationship?: FilterEntityRelationship | null;
    selectionSourceKey?: string;
  }): string | null {
    // Check that the filter is being applied
    const dataSelection = dataSelections.value[selectionName];
    if (!dataSelection || !dataSelection.selection) return null;

    // Pull matching values from source selection
    const { originKey, targetKey } = selectionEntityRelationship || {
      originKey: null,
      targetKey: null,
    };

    const relevantFilter = selectionToArqueroFilter(dataSelection);

    // assume same-entity filtering if these are not provided
    if (!originKey || !targetKey || !selectionSourceKey) {
      return relevantFilter;
    }

    // Otherwise, we are doing cross-entity filtering

    // Get the relevant source table
    const relevantTable = dataSources.value[selectionSourceKey];

    if (!relevantTable || !relevantFilter) {
      console.warn(
        `No relevant table or filter for mapping: ${selectionSourceKey}`,
      );
      return null;
    }

    // Check that the targetKey is present in the in table
    if (!inTable.columnNames().includes(targetKey)) {
      throw new Error(
        `Identifying key [${targetKey}] not found in table [${key}]. Ensure any filters relying on the [${targetKey}] column are applied before other transformations that may remove it.`,
      );
    }

    const totalTable = relevantTable.dest.reify();
    const filteredTable = relevantTable.dest.filter(relevantFilter).reify();

    // If the matching is 'any' or not specified, we just return the filter expression
    if (selectionMatching != 'all') {
      const originIds = filteredTable.array(originKey) as string[];

      return originIds
        .map((id) => `d['${targetKey}'] === '${id}'`)
        .join(' || ');
    }

    // Otherwise, the matching is 'all', meaning we need to find entities that satisfy the filter completely

    // Count helper
    const toCounts = (ids: string[]) => {
      const m = new Map<string, number>();
      for (const id of ids) m.set(id, (m.get(id) ?? 0) + 1);
      return m;
    };

    // Per-entity counts
    const totalCounts = toCounts(totalTable.array(originKey) as string[]);
    const filteredCounts = toCounts(filteredTable.array(originKey) as string[]);

    // Entities whose entire set matches the filter
    const exclusiveOriginIds: string[] = [];
    for (const [id, f] of filteredCounts.entries()) {
      const t = totalCounts.get(id) ?? 0;
      if (f > 0 && f === t) exclusiveOriginIds.push(id);
    }

    // Return a list of OR-ed ids as a filter string for the target table
    const orExpression =
      exclusiveOriginIds.length > 0
        ? exclusiveOriginIds
            .map((id) => `d['${targetKey}'] === '${id}'`)
            .join(' || ')
        : 'false'; // nothing qualifies

    return orExpression;
  }

  const loading = ref<boolean>(true);
  const selectionHash = ref<string>('');

  async function initDataSources(dataSources: DataSource[]): Promise<void> {
    loading.value = true;
    const promises = dataSources.map((dataSource) =>
      initDataSource(dataSource),
    );
    await Promise.all(promises);
    loading.value = false;
  }

  async function initDataSource(dataSource: DataSource): Promise<void> {
    const currentSource = getDataSource(dataSource.name);
    if (currentSource && isEqual(currentSource.source, dataSource)) return;
    let delimiter = ',';
    if (dataSource.source.endsWith('.tsv')) {
      delimiter = '\t';
    }
    const dest: ColumnTable = await loadCSV(dataSource.source, { delimiter });
    dataSources.value[dataSource.name] = { source: dataSource, dest };
  }

  function getDataSource(key: string): DataInterface | null {
    if (loading.value) {
      console.warn('Data sources are still loading');
      return null;
    }
    if (!(key in dataSources.value)) return null;
    return dataSources.value[key] ?? null;
  }

  function getDataObject(
    keys: string[],
    dataTransformations?: DataTransformation[],
  ): {
    displayData: object[];     // only the data that should be displayed
    allData: object[];            // all data (needed for full domains)
    displayDataRows: object[];           // rows after named filters, before other transforms
    allDataRows: object[];           // all rows, before any transforms
    isDisplayDataSubset: boolean; // true if the returned data is a subset of the full data
  } | null {
    if (loading.value) return null;
  
    // make copy of tables from data sources
    const getNamedTables = () => {
      const namedTables = new Map<string, ColumnTable>();
      for (const key of keys) {
        const dataInterface = getDataSource(key);
        if (!dataInterface) {
          console.warn(`Skipping missing data source for key: ${key}`);
          continue;
        }
        namedTables.set(key, from(dataInterface.dest.reify()));
      }
      return namedTables;
    };
  
    const {
      data: dataTable,
      dataRows,
      containsNamedFilter,
    } = PerformDataTransformations(
      getNamedTables(),
      dataTransformations ?? [],
      { skipNamedFilters: false },
    );
  
    // materialize arrays of objects
    const displayData = dataTable.objects();
    const displayDataRowsObjects = dataRows.objects();
  
    let allData = displayData;
    let allDataRowsObjects = displayDataRowsObjects;
    if (containsNamedFilter) {
      const { data: fullData, dataRows: fullDataRows } = PerformDataTransformations(
        getNamedTables(),
        dataTransformations ?? [],
        { skipNamedFilters: true },
      );
      allData = fullData.objects();
      allDataRowsObjects = fullDataRows.objects();
    }
  
    return {
      displayData,
      allData,
      displayDataRows: displayDataRowsObjects,
      allDataRows: allDataRowsObjects,
      isDisplayDataSubset: containsNamedFilter,
    };
  }  

  function PerformDataTransformations(
    namedTables: Map<string, ColumnTable>,
    dataTransformations: DataTransformation[],
    config?: {
      skipNamedFilters?: boolean; // if true, skip named filters in transformations
    },
  ): { data: ColumnTable; dataRows: ColumnTable; containsNamedFilter: boolean } {
    let containsNamedFilter = false;
    const key = namedTables.keys().next().value ?? '';
    const table = namedTables.get(key);
    if (!table) {
      throw new Error(`Table not found for key: ${key}`);
    }
    const currentTable: {
      key: string;
      table: ColumnTable;
    } = { key, table };

    const getInTable = (key?: string): ColumnTable => {
      const columnTable = key ? namedTables.get(key) : currentTable.table;
      if (!columnTable) {
        throw new Error('in table not found');
      }
      return columnTable;
    };

    const setOutTable = (transform: DataTransformation) => {
      if (transform.out) {
        currentTable.key = transform.out;
      } else if (transform.in && !Array.isArray(transform.in)) {
        currentTable.key = transform.in;
      }
      namedTables.set(currentTable.key, currentTable.table);
    };

    let dataRows = currentTable.table;

    // console.log('we doing it');
    for (const transform of dataTransformations) {
      if ('filter' in transform) {
        const { filter, in: tableName } = transform;
        const inTable = getInTable(tableName);

        // Just apply the filter if it's a string
        if (typeof filter === 'string') {
          currentTable.table = inTable.filter(filter).reify();
        } else {
          // Otherwise, we assume it's a named filter
          containsNamedFilter = true;
          if (config?.skipNamedFilters) {
            continue;
          }

          // Weird spread syntax to handle optional properties
          const mappedFilter = GetMappedArqueroFilter({
            key,
            inTable,
            selectionName: filter.name,
            selectionSourceKey: filter.source,
            ...(filter.match !== undefined
              ? { selectionMatching: filter.match }
              : {}),
            ...(filter.entityRelationship !== undefined
              ? { selectionEntityRelationship: filter.entityRelationship }
              : {}),
          });

          if (mappedFilter) {
            currentTable.table = inTable.filter(mappedFilter).reify();
          }
        }
        // Keep track of the filtered data rows (without other transformations applied) for later use
        dataRows = currentTable.table;
      } else if ('groupby' in transform) {
        const inTable = getInTable(transform.in);
        if (Array.isArray(transform.groupby)) {
          currentTable.table = inTable.groupby(...transform.groupby);
        } else {
          currentTable.table = inTable.groupby(transform.groupby);
        }
      } else if ('binby' in transform) {
        const inTable = getInTable(transform.in);
        const { field, bins = 10, nice = true } = transform.binby;
        const { bin_start = 'start', bin_end = 'end' } = transform.binby
          .output ?? {
          bin_start: 'start',
          bin_end: 'end',
        };

        const groupbyObject: { [key: string]: string } = {};
        groupbyObject[bin_start] = bin(field, { maxbins: bins, nice });
        groupbyObject[bin_end] = bin(field, { maxbins: bins, nice, offset: 1 });

        currentTable.table = inTable.groupby(groupbyObject);
      } else if ('rollup' in transform) {
        const inTable = getInTable(transform.in);
        const aggregateFunctions: { [key: string]: TableExpr } = {};
        const frequencyKeys: string[] = [];
        for (const [as, aggFunction] of Object.entries(transform.rollup)) {
          aggregateFunctions[as] = getArqueroAggregateFunction(aggFunction);
          if (aggFunction.op === 'frequency') {
            frequencyKeys.push(as);
          }
        }
        currentTable.table = inTable.rollup(aggregateFunctions);
        for (const freqKey of frequencyKeys) {
          const deriveExpression: ExprObject = {};
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          deriveExpression[freqKey] = (d: any, $: any) =>
            d[$.freqKey] / op.sum(d[$.freqKey]);

          currentTable.table = currentTable.table
            .params({ freqKey: freqKey })
            .derive(deriveExpression);
        }
      } else if ('orderby' in transform) {
        const inTable = getInTable(transform.in);
        let orderbyList: (string | DirectionalOrder)[];
        if (!Array.isArray(transform.orderby)) {
          orderbyList = [transform.orderby];
        } else {
          orderbyList = transform.orderby;
        }
        const orderKeys: OrderKey[] = orderbyList.map((orderby) => {
          let orderKey: OrderKey;
          if (typeof orderby !== 'string') {
            const dir = orderby.order;
            orderKey = orderby.field;
            if (dir === 'desc') {
              orderKey = desc(orderKey);
            }
          } else {
            orderKey = orderby;
          }
          return orderKey;
        });
        currentTable.table = inTable.orderby(orderKeys);
      } else if ('derive' in transform) {
        const inTable = getInTable(transform.in);
        const derive = cloneDeep(transform.derive);
        for (const [as, expr] of Object.entries(derive)) {
          if (typeof expr !== 'string') {
            derive[as] = rolling(expr.rolling.expression, expr.rolling.window);
          }
        }
        currentTable.table = inTable.derive(derive);
      } else if ('join' in transform) {
        const [leftKey, rightKey] = transform.in;
        const leftTable = namedTables.get(leftKey);
        const rightTable = namedTables.get(rightKey);
        if (!leftTable || !rightTable) {
          throw new Error('join table not found');
        }
        if (
          typeof transform.join.on === 'string' ||
          transform.join.on.every((x) => typeof x === 'string')
        ) {
          currentTable.table = leftTable.join(rightTable, transform.join.on);
        } else {
          const [leftMultiKeys, rightMultiKeys] = transform.join.on;
          if (leftMultiKeys.length !== rightMultiKeys.length) {
            throw new Error(
              'left and right multi keys must be the same length',
            );
          }
          // multi key join. I first tried passing an anonymous function to arquero's
          // join method, but the limitations wrt closure made it difficult/impossible
          // to implement. So I am using a derived column to create a unique key for each
          // row in each table, and then joining on that.
          currentTable.table = leftTable
            .params({
              leftMultiKeys: transform.join.on[0],
            })
            .derive({
              udi_internal_multi_key_join: escape(
                (d: { [x: string]: unknown }, $: { leftMultiKeys: string[] }) =>
                  $.leftMultiKeys.map((k) => d[k]).join('¶'),
              ),
            })
            .join(
              rightTable
                .params({
                  rightMultiKeys: transform.join.on[1],
                })
                .derive({
                  udi_internal_multi_key_join: escape(
                    (
                      d: { [x: string]: unknown },
                      $: { rightMultiKeys: string[] },
                    ) => $.rightMultiKeys.map((k) => d[k]).join('¶'),
                  ),
                }),
              'udi_internal_multi_key_join',
            );
        }
      } else if ('kde' in transform) {
        const inTable = getInTable(transform.in);
        const { field, samples } = transform.kde;
        let { bandwidth } = transform.kde;
        if (bandwidth == null) {
          bandwidth = nrd(inTable.array(field), (x: number) => x);
        }
        bandwidth = bandwidth ?? 1;
        const { sample = 'sample', density = 'density' } = transform.kde
          .output ?? { sample: 'sample', density: 'density' };
        let kdeTable;

        const minVal = agg(inTable, op.min(field));
        const maxVal = agg(inTable, op.max(field));
        // console.log({ minVal, maxVal });
        const partitions = inTable.partitions();
        for (let i = 0; i < partitions.length; i++) {
          const partition = partitions[i];
          // partition is a list of indices that define a group
          // if no grouping is present, partition is an array of all indices
          if (!partition) {
            throw new Error('partition is undefined');
          }
          const values = partition.map((i) => inTable.get(field, i));
          const densityEstimates = density1d(values, {
            bandwidth,
            bins: samples,
            extent: [minVal, maxVal],
          }).points();
          let groupTable = from(densityEstimates);
          groupTable = groupTable.rename({ x: sample, y: density });
          if (inTable.isGrouped()) {
            const groups = inTable.groups();
            for (let j = 0; j < groups.names.length; j++) {
              const name = groups.names[j];
              if (name == null) {
                throw new Error('name is undefined');
              }
              const getGroupValue = groups.get[j] as ColumnGetter;
              const rowIndex = groups.rows[i];
              if (rowIndex == null) {
                throw new Error('rowIndex is undefined');
              }
              const value = getGroupValue(rowIndex);
              groupTable = groupTable.derive({ [name]: escape(value) });
            }
          }
          if (!kdeTable) {
            kdeTable = groupTable;
          } else {
            kdeTable = kdeTable.concat(groupTable);
          }
        }
        if (!kdeTable) {
          throw new Error('kdeTable is undefined');
        }
        currentTable.table = kdeTable;
      }
      setOutTable(transform);
    }
    return { data: currentTable.table, dataRows, containsNamedFilter };
  }

  function getArqueroAggregateFunction(aggFunc: AggregateFunction): TableExpr {
    switch (aggFunc.op) {
      case 'count':
        return op.count();
      case 'sum':
        if (!aggFunc.field) {
          throw new Error('Field is required for sum operation');
        }
        return op.sum(aggFunc.field);
      case 'min':
        if (!aggFunc.field) {
          throw new Error('Field is required for min operation');
        }
        return op.min(aggFunc.field);
      case 'median':
        if (!aggFunc.field) {
          throw new Error('Field is required for median operation');
        }
        return op.median(aggFunc.field);
      case 'max':
        if (!aggFunc.field) {
          throw new Error('Field is required for max operation');
        }
        return op.max(aggFunc.field);
      case 'mean':
        return op.mean(aggFunc.field);
      case 'frequency':
        // frequency is a two step process, step one is getting the counts.
        // normalizing the counts happens outside this function.
        return op.count();
      default:
        throw new Error(
          'unsupported Aggregate Function' + JSON.stringify(aggFunc),
        );
    }
  }

  return {
    dataSources,
    loading,
    selectionHash,
    initDataSources,
    getDataObject,
    watchDataSelection,
    getDataSelection,
    updateDataSelection,
    clearDataSelection,
    dataSelections,
    bindExternalDataSelections,
  };
});
