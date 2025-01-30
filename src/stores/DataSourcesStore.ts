import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type {
  AggregateFunction,
  DataSource,
  DataTransformation,
} from '../components/Parser.ts';
// import { DuckDB, init } from './dataWrappers/DuckDB.js';
import { loadCSV, all, desc, op, table, from, type ColumnTable } from 'arquero';
import { f } from 'msw/lib/core/HttpResponse-DE19n76Q.js';

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
    const key = namedTables.keys().next().value;
    const table = namedTables.get(key);
    const currentTable: {
      key: string;
      table: ColumnTable;
    } = { key, table };

    const getInTable = (key?: string): ColumnTable => {
      return key ? namedTables.get(key) : currentTable.table;
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
      } else if ('rollup' in transform) {
        const inTable = getInTable(transform.in);
        let aggregateFunctions = {};
        const frequencyKeys: string[] = [];
        for (const [as, aggFunction] of Object.entries(transform.rollup)) {
          aggregateFunctions[as] = getArqueroAggregateFunction(aggFunction);
          if (aggFunction.op === 'frequency') {
            frequencyKeys.push(as);
          }
        }
        currentTable.table = inTable.rollup(aggregateFunctions);
        for (const freqKey of frequencyKeys) {
          const deriveExpression = {};
          deriveExpression[freqKey] = (d, $) =>
            d[$.freqKey] / op.sum(d[$.freqKey]);

          currentTable.table = currentTable.table
            .params({ freqKey: freqKey })
            .derive(deriveExpression);
        }
        // TODO: handle normalization
      } else if ('orderby' in transform) {
        const inTable = getInTable(transform.in);
        currentTable.table = inTable.orderby(transform.orderby);
      } else if ('derive' in transform) {
        const inTable = getInTable(transform.in);
        currentTable.table = inTable.derive(transform.derive);
      } else if ('filter' in transform) {
        const inTable = getInTable(transform.in);
        currentTable.table = inTable.filter(transform.filter);
      } else if ('join' in transform) {
        const [leftKey, rightKey] = transform.in;
        const leftTable = namedTables.get(leftKey);
        const rightTable = namedTables.get(rightKey);
        currentTable.table = leftTable.join(rightTable, transform.join.on);
      }
      setOutTable(transform);
    }
    return currentTable.table;
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
