import { ref } from 'vue';
import { density1d, nrd } from 'fast-kde';
import { cloneDeep, isEqual } from 'lodash';
import type {
  AggregateFunction,
  DataSource,
  DataTransformation,
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
  type ColumnTable,
} from 'arquero';
import type {
  ColumnGetter,
  ExprObject,
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

export const useDataSourcesStore = defineStore('DataSourcesStore', () => {
  const dataSources = ref<DataSourcesState>({});
  // let connection = null;
  // let db = null;
  // init().then(async (value: DuckDB) => {
  //   db = value.db;
  //   console.log(value);
  //   connection = await db.connect();
  // });

  const loading = ref<boolean>(true);

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
    if (!(key in dataSources.value)) return null;
    return dataSources.value[key] ?? null;
  }

  function getDataObject(
    keys: string[],
    dataTransformations?: DataTransformation[],
  ): object[] | null {
    if (loading.value) return null;

    // make copy of tables from data sources
    const namedTables = new Map();
    for (const key of keys) {
      const dataInterface = getDataSource(key);
      if (dataInterface === null) {
        // continue;
        throw new Error(`key not found in data sources: [${key}]`);
      }
      namedTables.set(key, from(dataInterface.dest.reify()));
    }
    // TODO: incorporate data transformations
    // maybe filter to only fields used?

    const dataTable = PerformDataTransformations(
      namedTables,
      dataTransformations ?? [],
    );

    return dataTable.objects();
  }

  function PerformDataTransformations(
    namedTables: Map<string, ColumnTable>,
    dataTransformations: DataTransformation[],
  ): ColumnTable {
    console.log('perform data transforations');
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
      if ('groupby' in transform) {
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
        currentTable.table = inTable.orderby(transform.orderby);
      } else if ('derive' in transform) {
        const inTable = getInTable(transform.in);
        const derive = cloneDeep(transform.derive);
        for (const [as, expr] of Object.entries(derive)) {
          if (typeof expr !== 'string') {
            derive[as] = rolling(expr.rolling.expression, expr.rolling.window);
          }
        }
        currentTable.table = inTable.derive(derive);
      } else if ('filter' in transform) {
        const inTable = getInTable(transform.in);
        currentTable.table = inTable.filter(transform.filter);
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

        const minVal = agg(inTable, op.min(field)) - bandwidth * 3;
        const maxVal = agg(inTable, op.max(field)) + bandwidth * 3;
        console.log({ minVal, maxVal });
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
    return currentTable.table;
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

  return { dataSources, loading, initDataSources, getDataObject };
});
