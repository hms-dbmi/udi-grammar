import { ref } from 'vue';
import { defineStore } from 'pinia';
import type {
  AggregateFunction,
  DataSource,
  DataTransformation,
} from './GrammarTypes';
// import { DuckDB, init } from './dataWrappers/DuckDB.js';
import { loadCSV, op, from, bin, type ColumnTable } from 'arquero';
import type { ExprObject, TableExpr } from 'arquero/dist/types/table/types';

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
        const {
          field,
          bins = 10,
          nice = true,
          bin_start = 'bin_start',
          bin_end = 'bin_end',
        } = transform.binby;

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
        // TODO: handle normalization
      } else if ('orderby' in transform) {
        const inTable = getInTable(transform.in);
        currentTable.table = inTable.orderby(transform.orderby);
      } else if ('derive' in transform) {
        const inTable = getInTable(transform.in);
        //TODO: this typing conversion is ugly (something is probably wrong in typing somewhere)
        currentTable.table = inTable.derive(
          transform.derive as unknown as ExprObject,
        );
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
