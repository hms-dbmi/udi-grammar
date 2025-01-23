import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type { DataSource } from '../components/Parser.ts';

export interface DataSourcesState {
  dataSources: DataSource[];
}

export const useDataSourcesStore = defineStore('DataSourcesStore', () => {
  const dataSources = ref<DataSource[]>([]);

  function initDataSource(dataSource: DataSource): void {
    if (getDataSource(dataSource.key)) return;
    dataSources.value.push(dataSource);
    // TODO: actually create data interface object
  }

  function getDataSource(key: string): DataSource | null {
    for (const source of dataSources.value) {
      if (source.key === key) {
        return source;
      }
    }
    return null;
  }

  return { dataSources, initDataSource };
});
