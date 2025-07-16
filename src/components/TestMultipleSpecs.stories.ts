// import { fn } from '@storybook/test'
import TestMultipleSpecs from './TestMultipleSpecs.vue';

// export const ActionsData = {
//   onPinTask: fn(),
//   onArchiveTask: fn(),
// }

export default {
  component: TestMultipleSpecs,
  tags: ['autodocs'],
  title: 'Interactions',
  //👇 Our exports that end in "Data" are not stories.
  // excludeStories: /.*Data$/,
  // args: {
  //   ...ActionsData,
  // },
};

export const Default = {
  args: {
    specs: [
      {
        source: {
          name: 'donors',
          source: './data/donors.csv',
        },
        representation: {
          mark: 'point',
          mapping: [
            { encoding: 'y', field: 'height_value', type: 'quantitative' },
            { encoding: 'x', field: 'weight_value', type: 'quantitative' },
          ],
          select: {
            name: 'scatter-select',
            how: {
              type: 'interval',
              on: 'xy',
            },
          },
        },
      },
      {
        source: {
          name: 'donors',
          source: './data/donors.csv',
        },
        transformation: [
          {
            filter: {
              name: 'scatter-select',
            },
          },
          {
            groupby: 'sex',
          },
          {
            rollup: {
              sex_count: { op: 'count' },
            },
          },
        ],
        representation: {
          mark: 'bar',
          mapping: [
            { encoding: 'x', field: 'sex', type: 'nominal' },
            { encoding: 'y', field: 'sex_count', type: 'quantitative' },
          ],
        },
      },
    ],
  },
};

export const Reversed = {
  args: {
    specs: [
      {
        source: {
          name: 'donors',
          source: './data/donors.csv',
        },
        transformation: [
          {
            filter: {
              name: 'scatter-select',
            },
          },
          {
            groupby: 'sex',
          },
          {
            rollup: {
              sex_count: { op: 'count' },
            },
          },
        ],
        representation: {
          mark: 'bar',
          mapping: [
            { encoding: 'x', field: 'sex', type: 'nominal' },
            { encoding: 'y', field: 'sex_count', type: 'quantitative' },
          ],
        },
      },
      {
        source: {
          name: 'donors',
          source: './data/donors.csv',
        },
        representation: {
          mark: 'point',
          mapping: [
            { encoding: 'y', field: 'height_value', type: 'quantitative' },
            { encoding: 'x', field: 'weight_value', type: 'quantitative' },
          ],
          select: {
            name: 'scatter-select',
            how: {
              type: 'interval',
              on: 'xy',
            },
          },
        },
      },
    ],
  },
};

export const ScatterDetailOverview = {
  args: {
    specs: [
      {
        source: {
          name: 'donors',
          source: './data/donors.csv',
        },
        transformation: [
          {
            filter: {
              name: 'scatter-select',
            },
          },
        ],
        representation: {
          mark: 'point',
          mapping: [
            { encoding: 'y', field: 'height_value', type: 'quantitative' },
            { encoding: 'x', field: 'weight_value', type: 'quantitative' },
          ],
        },
      },
      {
        source: {
          name: 'donors',
          source: './data/donors.csv',
        },
        representation: {
          mark: 'point',
          mapping: [
            { encoding: 'y', field: 'height_value', type: 'quantitative' },
            { encoding: 'x', field: 'weight_value', type: 'quantitative' },
          ],
          select: {
            name: 'scatter-select',
            how: {
              type: 'interval',
              on: 'xy',
            },
          },
        },
      },
    ],
  },
};

export const ScatterOverviewDetail = {
  args: {
    specs: [
      {
        source: {
          name: 'donors',
          source: './data/donors.csv',
        },
        representation: {
          mark: 'point',
          mapping: [
            { encoding: 'y', field: 'height_value', type: 'quantitative' },
            { encoding: 'x', field: 'weight_value', type: 'quantitative' },
          ],
          select: {
            name: 'blargen-flargen',
            how: {
              type: 'interval',
              on: 'xy',
            },
          },
        },
      },
      {
        source: {
          name: 'donors',
          source: './data/donors.csv',
        },
        transformation: [
          {
            filter: {
              name: 'blargen-flargen',
            },
          },
        ],
        representation: {
          mark: 'point',
          mapping: [
            { encoding: 'y', field: 'height_value', type: 'quantitative' },
            { encoding: 'x', field: 'weight_value', type: 'quantitative' },
          ],
        },
      },
    ],
  },
};

export const ScatterFilter = {
  args: {
    specs: [
      {
        source: {
          name: 'donors',
          source: './data/donors.csv',
        },
        representation: {
          mark: 'point',
          mapping: [
            {
              encoding: 'y',
              field: 'height_value',
              type: 'quantitative',
              domain: [60, 200],
            },
            {
              encoding: 'x',
              field: 'weight_value',
              type: 'quantitative',
              domain: [0, 160],
            },
          ],
          select: {
            name: 'blargen-flargen',
            how: {
              type: 'interval',
              on: 'xy',
            },
          },
        },
      },
      {
        source: {
          name: 'donors',
          source: './data/donors.csv',
        },
        transformation: [
          {
            filter: {
              name: 'blargen-flargen',
            },
          },
        ],
        representation: {
          mark: 'point',
          mapping: [
            {
              encoding: 'y',
              field: 'height_value',
              type: 'quantitative',
              domain: [60, 200],
            },
            {
              encoding: 'x',
              field: 'weight_value',
              type: 'quantitative',
              domain: [0, 160],
            },
          ],
        },
      },
    ],
  },
};

export const ScatterFilterSelf = {
  args: {
    specs: [
      {
        source: {
          name: 'donors',
          source: './data/donors.csv',
        },
        transformation: [
          {
            filter: {
              name: 'filter-self',
            },
          },
        ],
        representation: {
          mark: 'point',
          mapping: [
            {
              encoding: 'y',
              field: 'height_value',
              type: 'quantitative',
              domain: [60, 200],
            },
            {
              encoding: 'x',
              field: 'weight_value',
              type: 'quantitative',
              domain: [0, 160],
            },
          ],
          select: {
            name: 'filter-self',
            how: {
              type: 'interval',
              on: 'xy',
            },
          },
        },
      },
    ],
  },
};

export const ScatterTable = {
  args: {
    specs: [
      {
        source: {
          name: 'donors',
          source: './data/donors.csv',
        },
        representation: {
          mark: 'point',
          mapping: [
            { encoding: 'y', field: 'height_value', type: 'quantitative' },
            { encoding: 'x', field: 'weight_value', type: 'quantitative' },
          ],
          select: {
            name: 'blargen-flargen',
            how: {
              type: 'interval',
              on: 'xy',
            },
          },
        },
      },
      {
        source: {
          name: 'donors',
          source: './data/donors.csv',
        },
        transformation: [
          {
            filter: 'd.height_value && d.weight_value',
          },
          {
            filter: {
              name: 'blargen-flargen',
            },
          },
          {
            orderby: {
              field: 'height_value',
              order: 'desc',
            },
          },
        ],
        representation: {
          mark: 'row',
          mapping: [
            {
              field: 'hubmap_id',
              encoding: 'text',
              mark: 'text',
              type: 'nominal',
            },
            {
              mark: 'bar',
              field: 'height_value',
              encoding: 'x',
              type: 'quantitative',
              domain: { min: 60, max: 200 },
            },
            {
              mark: 'bar',
              field: 'weight_value',
              encoding: 'x',
              type: 'quantitative',
              domain: { min: 0, max: 160 },
            },
          ],
        },
      },
    ],
  },
};

export const KDEScatterTable = {
  args: {
    specs: [
      {
        source: {
          name: 'donors',
          source: './data/donors.csv',
        },
        transformation: [
          {
            kde: {
              field: 'age_value',
              output: {
                sample: 'age_value',
                density: 'density',
              },
            },
          },
        ],
        representation: {
          mark: 'area',
          mapping: [
            { encoding: 'y', field: 'density', type: 'quantitative' },
            { encoding: 'x', field: 'age_value', type: 'quantitative' },
          ],
          select: {
            name: 'age-filter',
            how: {
              type: 'interval',
              on: 'x',
            },
          },
        },
      },
      {
        source: {
          name: 'donors',
          source: './data/donors.csv',
        },
        representation: {
          mark: 'point',
          mapping: [
            { encoding: 'y', field: 'height_value', type: 'quantitative' },
            { encoding: 'x', field: 'weight_value', type: 'quantitative' },
          ],
          select: {
            name: 'height-weight-filter',
            how: {
              type: 'interval',
              on: 'xy',
            },
          },
        },
      },
      {
        source: {
          name: 'donors',
          source: './data/donors.csv',
        },
        transformation: [
          {
            filter: 'd.height_value && d.weight_value && d.age_value',
          },
          {
            filter: {
              name: 'age-filter',
            },
          },
          {
            filter: {
              name: 'height-weight-filter',
            },
          },
          {
            orderby: {
              field: 'height_value',
              order: 'desc',
            },
          },
        ],
        representation: {
          mark: 'row',
          mapping: [
            {
              field: 'hubmap_id',
              encoding: 'text',
              mark: 'text',
              type: 'nominal',
            },
            {
              mark: 'bar',
              field: 'height_value',
              encoding: 'x',
              type: 'quantitative',
              domain: { min: 60, max: 200 },
            },
            {
              mark: 'bar',
              field: 'weight_value',
              encoding: 'x',
              type: 'quantitative',
              domain: { min: 0, max: 160 },
            },
            {
              mark: 'bar',
              field: 'age_value',
              encoding: 'x',
              type: 'quantitative',
              domain: { min: 0, max: 100 },
            },
          ],
        },
      },
    ],
  },
};
