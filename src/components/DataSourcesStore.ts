import { ref } from 'vue';
import { density1d, nrd } from 'fast-kde';
import { cloneDeep, isEqual } from 'lodash';
import type {
  AggregateFunction,
  DataSource,
  DataTransformation,
  DirectionalOrder,
  FilterDataSelectionMapping,
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
    for (const [field, [min, max]] of Object.entries(selection)) {
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
      const innerFilters: string[] = [];
      for (const value of values) {
        innerFilters.push(`d['${field}'] === ${JSON.stringify(value)}`);
      }
      filters.push(innerFilters.join(' || '));
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

  function GetMappedArqueroFilter(
    selectionName: string,
    sourceTable: ColumnTable,
    mapping?: FilterDataSelectionMapping,
    mappingKey?: string,
    transformations: DataTransformation[] = [],
  ): string | null {
    console.groupCollapsed(`GetMappedArqueroFilter → ${selectionName} :: ${mappingKey}`);
    console.log({
      selectionName,
      sourceTable,
      mapping,
      mappingKey,
      transformations,
    });
    console.groupEnd();

    const dataSelection = dataSelections.value[selectionName];

    console.log('dataSelections.value', dataSelections.value);
    console.log('dataSelection', dataSelection);
    if (!dataSelection || !dataSelection.selection) return null;
  
    // Pull matching values from source selection
    const selection = dataSelection.selection;
    const originField = mapping?.origin;
    const targetField = mapping?.target;

    const relevantFilter = selectionToArqueroFilter(dataSelection);
  
    // assume same-entity filtering if these are not provided
    if (!originField || !targetField || !mappingKey) {
      return relevantFilter;
    }

    // Otherwise, we are doing cross-entity filtering
    // Get the relevant source table
    const relevantTable = dataSources.value[mappingKey];

    if (!relevantTable || !relevantFilter) {
      console.warn(`No relevant table or filter for mapping: ${mappingKey}`);
      return null;
    }
  
    console.log('relevant table', relevantTable);
    console.log('relevantFilter', relevantFilter);

    // Apply the filter to a copy of the table
    const updatedTable = relevantTable.dest.filter(relevantFilter).reify();
    console.log('updatedTable', updatedTable);

    // Extract the origin ids from the filtered table
    console.log('originField', originField);
    const originIds = updatedTable.array(originField) as string[];

    // Return a list of ORed ids as a filter string
    const orExpression = originIds
      .map((id) => `d['${targetField}'] === '${id}'`)
      .join(' || ');

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
    console.log('getDataSource', key, dataSources.value);
    if (loading.value) {
      console.warn('Data sources are still loading');
      return null;
    }
    if (!(key in dataSources.value)) return null;
    console.log('found data source', dataSources.value[key]);
    return dataSources.value[key] ?? null;
  }

  function getDataObject(
    keys: string[],
    dataTransformations?: DataTransformation[],
  ): {
    displayData: object[]; // only the data the should be displayed
    allData: object[]; // all data (needed for full domains)
    isDisplayDataSubset: boolean; // true if the returned data is a subset of the full data
  } | null {
    console.log('top of getDataObject');
    console.log('keys', keys);
    console.log('dataTransformations', dataTransformations);
  
    if (loading.value) return null;

    // make copy of tables from data sources
    const getNamedTables = () => {
      const namedTables = new Map();
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

    console.log('getNamedTables', getNamedTables());

    const { data: dataTable, containsNamedFilter } = PerformDataTransformations(
      getNamedTables(),
      dataTransformations ?? [],
      {
        skipNamedFilters: false,
      },
    );
    const displayData = dataTable.objects();

    console.log('displayData', displayData);

    let allData = displayData;
    if (containsNamedFilter) {
      const { data: fullData } = PerformDataTransformations(
        getNamedTables(),
        dataTransformations ?? [],
        {
          skipNamedFilters: true,
        },
      );
      allData = fullData.objects();
    }

    return {
      displayData,
      allData,
      isDisplayDataSubset: containsNamedFilter,
    };
  }

  function PerformDataTransformations(
    namedTables: Map<string, ColumnTable>,
    dataTransformations: DataTransformation[],
    config?: {
      skipNamedFilters?: boolean; // if true, skip named filters in transformations
    },
  ): { data: ColumnTable; containsNamedFilter: boolean } {
    console.log('PerformDataTransformations', namedTables, dataTransformations, config);

    let containsNamedFilter = false;
    const key = namedTables.keys().next().value ?? '';
    const table = namedTables.get(key);
    if (!table) {
      throw new Error('table not found');
    }
    const currentTable: {
      key: string;
      table: ColumnTable;
    } = { key, table };

    const getInTable = (key?: string): ColumnTable => {
      console.log('getInTable', key, currentTable, namedTables);
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

    for (const transform of dataTransformations) {
      if ('filter' in transform) {
        console.log('APPLYING FILTER', transform.filter);

        const inTable = getInTable(transform.in);
        if (typeof transform.filter === 'string') {
          currentTable.table = inTable.filter(transform.filter).reify();
        } else {
          containsNamedFilter = true;
          if (config?.skipNamedFilters) {
            continue;
          }

          const filter = GetMappedArqueroFilter(
            transform.filter.name,
            inTable,
            transform.filter.mapping,
            transform.filter.source,
            dataTransformations,
          );

          console.log('output filter', filter);
          console.log('inTable', inTable);
          // const stupidFakeFilter = "d['donor.hubmap_id'] === 'HBM253.KBSM.226' || d['donor.hubmap_id'] === 'HBM534.PKFT.943'";
          // const filterToUse = transform.filter.mapping?.target === 'samples' ? stupidFakeFilter : filter;

          if (filter) {
            currentTable.table = inTable.filter(filter).reify();
          }
          // TODO: handle multiple / different data sources
        }
      } else if ('groupby' in transform) {
        console.log('APPLYING GROUPBY', transform.groupby);
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
        console.log('APPLYING ROLLUP', transform.rollup);
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
    return { data: currentTable.table, containsNamedFilter };
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
  };
});
