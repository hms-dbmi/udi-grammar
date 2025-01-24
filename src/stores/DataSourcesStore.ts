import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type { DataSource } from '../components/Parser.ts';
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

  function getDataObject(key: string): any {
    const dataInterface = getDataSource(key);
    if (dataInterface === null) return null;
    // TODO, incorporate data transformations
    // maybe filter to only fields used?
    return dataInterface.dest.objects();
  }

  return { dataSources, loading, initDataSource, getDataObject };
});
