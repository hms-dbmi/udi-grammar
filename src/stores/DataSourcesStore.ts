import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type {
  AggregateFunction,
  DataSource,
  DataTransformation,
} from '../components/Parser.ts';
// import { DuckDB, init } from './dataWrappers/DuckDB.js';
import { loadCSV, all, desc, op, table, from, type ColumnTable } from 'arquero';

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
    const promises = dataSources.map((dataSource) =>
      initDataSource(dataSource),
    );
    await Promise.all(promises);
    loading.value = false;
  }

  async function initDataSource(dataSource: DataSource): Promise<void> {
    if (getDataSource(dataSource.key)) return;
    const dest: ColumnTable = await loadCSV(dataSource.source);
    dataSources.value[dataSource.key] = { source: dataSource, dest };
  }

  function getDataSource(key: string): DataInterface | null {
    if (!(key in dataSources.value)) return null;
    return dataSources.value[key];
  }

  function getDataObject(
    keys: string[],
    dataTransformations: DataTransformation[],
  ): any {
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

    if (!dataTransformations) {
      return namedTables.get(keys[0]).objects();
    }

    const table = PerformDataTransformations(namedTables, dataTransformations);

    return table.objects();
  }

  function PerformDataTransformations(
    namedTables: Map<string, ColumnTable>,
    dataTransformations: DataTransformation[],
  ): ColumnTable {
    let outTable: ColumnTable;
    for (const transform of dataTransformations) {
      if ('groupby' in transform) {
        const inTable = namedTables.get(transform.in);
        outTable = inTable.groupby(transform.groupby);
        namedTables.set(transform.out, outTable);
      } else if ('rollup' in transform) {
        const inTable = namedTables.get(transform.in);
        let aggregateFunctions = {};
        for (const [as, aggFunction] of Object.entries(transform.rollup)) {
          aggregateFunctions[as] = getArqueroAggregateFunction(aggFunction);
        }
        outTable = inTable.rollup(aggregateFunctions);
        namedTables.set(transform.out, outTable);
      } else if ('join' in transform) {
        // TODO
        const [leftKey, rightKey] = transform.in;
        const leftTable = namedTables.get(leftKey);
        const rightTable = namedTables.get(rightKey);
        outTable = leftTable.join(rightTable, transform.join.on);
        namedTables.set(transform.out, outTable);
      }
    }
    return outTable;
  }

  function getArqueroAggregateFunction(aggFunc: AggregateFunction): any {
    switch (aggFunc.op) {
      case 'count':
        return op.count();
      case 'min':
        return op.min(aggFunc.field);
      case 'max':
        return op.max(aggFunc.field);
      case 'mean':
        return op.mean(aggFunc.field);
      default:
        throw new Error(
          'unsupported Aggregate Function' + JSON.stringify(aggFunc),
        );
    }
  }

  return { dataSources, loading, initDataSources, getDataObject };
});
