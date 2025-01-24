import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type {
  AggregateFunction,
  DataSource,
  DataTransformation,
} from '../components/Parser.ts';
// import { DuckDB, init } from './dataWrappers/DuckDB.js';
import { loadCSV, all, desc, op, table, type ColumnTable } from 'arquero';

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

  async function initDataSource(dataSource: DataSource): Promise<void> {
    if (getDataSource(dataSource.key)) return;
    const dest: ColumnTable = await loadCSV(dataSource.source);
    dataSources.value[dataSource.key] = { source: dataSource, dest };
    // TODO: actually create data interface object
    console.log(dataSources.value);
    loading.value = false;
  }

  function getDataSource(key: string): DataInterface | null {
    if (!(key in dataSources.value)) return null;
    return dataSources.value[key];
  }

  function getDataObject(
    key: string,
    dataTransformations: DataTransformation[],
  ): any {
    const dataInterface = getDataSource(key);
    if (dataInterface === null) return null;
    // TODO: incorporate data transformations
    // maybe filter to only fields used?

    let table = dataInterface.dest;
    if (dataTransformations) {
      table = PerformDataTransformations(table, dataTransformations);
    }

    // e.g.
    // dataInterface.dest.groupby('sex').rollup

    return table.objects();
  }

  function PerformDataTransformations(
    inTable: ColumnTable,
    dataTransformations: DataTransformation[],
  ): ColumnTable {
    let outTable = inTable;
    for (const transform of dataTransformations) {
      if ('groupby' in transform) {
        outTable = outTable.groupby(transform.groupby);
      } else if ('rollup' in transform) {
        let aggregateFunctions = {};
        for (const [as, aggFunction] of Object.entries(transform.rollup)) {
          aggregateFunctions[as] = getArqueroAggregateFunction(aggFunction);
        }
        outTable = outTable.rollup(aggregateFunctions);
      }
    }
    console.log('blargen flargen');
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

  return { dataSources, loading, initDataSource, getDataObject };
});
