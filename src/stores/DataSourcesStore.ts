import { ref } from 'vue';
import { density1d } from 'fast-kde';
import { cloneDeep } from 'lodash';
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
    if (getDataSource(dataSource.name)) return;
    const dest: ColumnTable = await loadCSV(dataSource.source);
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
        currentTable.table = leftTable.join(rightTable, transform.join.on);
      } else if ('kde' in transform) {
        const inTable = getInTable(transform.in);
        const { field, bandwidth, samples } = transform.kde;
        const { sample = 'sample', density = 'density' } = transform.kde
          .output ?? { sample: 'sample', density: 'density' };
        let kdeTable;
        if (inTable.isGrouped()) {
          const minVal = agg(inTable, op.min(field));
          const maxVal = agg(inTable, op.max(field));
          console.log({ minVal, maxVal });
          const groups = inTable.groups();
          const partitions = inTable.partitions();
          for (let i = 0; i < partitions.length; i++) {
            const partition = partitions[i];
            // partition is a list of indices that define a group
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

          // exampole partisions() output
          // Array(4) [
          //   0: Array(2) [0, 5]
          //   1: Array(2) [1, 3]
          //   2: Array(1) [2]
          //   3: Array(1) [4]

          // example groups() output
          // keys: Uint32Array(6) [0, 1, 2, 1, 3, 0]
          // get: Array(2) [ƒ(e), ƒ(e)]
          // names: Array(2) ["country", "medal"]
          // rows: Array(4) [0, 1, 2, 4]
          // size: 4
        } else {
          const values = inTable.array(field);
          const densityEstimates = density1d(values, {
            bandwidth,
            bins: samples,
          }).points();
          let kdeTable = from(densityEstimates);
          kdeTable = kdeTable.rename({ x: sample, y: density });
          currentTable.table = kdeTable;
        }
      }
      setOutTable(transform);
    }
    return currentTable.table;
  }

  function getArqueroAggregateFunction(aggFunc: AggregateFunction): TableExpr {
    switch (aggFunc.op) {
      case 'count':
        return op.count();
      case 'min':
        if (!aggFunc.field) {
          throw new Error('Field is required for min operation');
        }
        return op.min(aggFunc.field);
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
