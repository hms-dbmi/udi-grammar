// import { fn } from '@storybook/test'
import { on } from 'events';
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
              source: 'donors',
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
              source: 'donors',
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
              source: 'donors',
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
              source: 'donors',
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
              source: 'donors',
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
              // domain: [60, 200],
            },
            {
              encoding: 'x',
              field: 'weight_value',
              type: 'quantitative',
              // domain: [0, 160],
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

export const ScatterFilterSelfMultiple = {
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
              source: 'donors',
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
      {
        source: {
          name: 'donors',
          source: './data/donors.csv',
        },
        transformation: [
          {
            filter: {
              name: 'filter-self-2',
              source: 'donors',
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
            name: 'filter-self-2',
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
              name: 'filter-self-3',
              source: 'donors',
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
            name: 'filter-self-3',
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
              name: 'filter-self-4',
              source: 'donors',
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
            name: 'filter-self-4',
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
              source: 'donors',
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
              // domain: { min: 60, max: 200 },
            },
            {
              mark: 'bar',
              field: 'weight_value',
              encoding: 'x',
              type: 'quantitative',
              // domain: { min: 0, max: 160 },
            },
            {
              mark: 'text',
              field: 'height_value',
              encoding: 'text',
              type: 'quantitative',
            },
            {
              mark: 'text',
              field: 'weight_value',
              encoding: 'text',
              type: 'quantitative',
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
              source: 'donors',
            },
          },
          {
            filter: {
              name: 'height-weight-filter',
              source: 'donors',
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

export const CrossFilterKDE = {
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
              name: 'age-filter',
              source: 'donors',
            },
          },
          {
            filter: {
              name: 'height-filter',
              source: 'donors',
            },
          },
          {
            filter: {
              name: 'weight-filter',
              source: 'donors',
            },
          },
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
            {
              encoding: 'y',
              field: 'density',
              type: 'quantitative',
              domain: [0, 0.02],
            },
            {
              encoding: 'x',
              field: 'age_value',
              type: 'quantitative',
              domain: [0, 90],
            },
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
        transformation: [
          {
            filter: {
              name: 'age-filter',
              source: 'donors',
            },
          },
          {
            filter: {
              name: 'height-filter',
              source: 'donors',
            },
          },
          {
            filter: {
              name: 'weight-filter',
              source: 'donors',
            },
          },
          {
            kde: {
              field: 'weight_value',
              output: {
                sample: 'weight_value',
                density: 'density',
              },
            },
          },
        ],
        representation: {
          mark: 'area',
          mapping: [
            { encoding: 'y', field: 'density', type: 'quantitative' },
            {
              encoding: 'x',
              field: 'weight_value',
              type: 'quantitative',
              domain: [0, 160],
            },
          ],
          select: {
            name: 'weight-filter',
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
        transformation: [
          {
            filter: {
              name: 'age-filter',
              source: 'donors',
            },
          },
          {
            filter: {
              name: 'height-filter',
              source: 'donors',
            },
          },
          {
            filter: {
              name: 'weight-filter',
              source: 'donors',
            },
          },
          {
            kde: {
              field: 'height_value',
              output: {
                sample: 'height_value',
                density: 'density',
              },
            },
          },
        ],
        representation: {
          mark: 'area',
          mapping: [
            { encoding: 'y', field: 'density', type: 'quantitative' },
            {
              encoding: 'x',
              field: 'height_value',
              type: 'quantitative',
              domain: [60, 200],
            },
          ],
          select: {
            name: 'height-filter',
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
        transformation: [
          {
            filter: 'd.height_value && d.weight_value && d.age_value',
          },
          {
            filter: {
              name: 'age-filter',
              source: 'donors',
            },
          },
          {
            filter: {
              name: 'height-filter',
              source: 'donors',
            },
          },
          {
            filter: {
              name: 'weight-filter',
              source: 'donors',
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

export const CrossFilterStripPlot = {
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
              name: 'age-filter',
              source: 'donors',
            },
          },
          {
            filter: {
              name: 'height-filter',
              source: 'donors',
            },
          },
          {
            filter: {
              name: 'weight-filter',
              source: 'donors',
            },
          },
        ],
        representation: {
          mark: 'point',
          mapping: [
            {
              encoding: 'x',
              field: 'age_value',
              type: 'quantitative',
              // domain: [0, 90],
            },
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
        transformation: [
          {
            filter: {
              name: 'age-filter',
              source: 'donors',
            },
          },
          {
            filter: {
              name: 'height-filter',
              source: 'donors',
            },
          },
          {
            filter: {
              name: 'weight-filter',
              source: 'donors',
            },
          },
        ],
        representation: {
          mark: 'point',
          mapping: [
            {
              encoding: 'x',
              field: 'weight_value',
              type: 'quantitative',
              // domain: [0, 160],
            },
          ],
          select: {
            name: 'weight-filter',
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
        transformation: [
          {
            filter: {
              name: 'age-filter',
              source: 'donors',
            },
          },
          {
            filter: {
              name: 'height-filter',
              source: 'donors',
            },
          },
          {
            filter: {
              name: 'weight-filter',
              source: 'donors',
            },
          },
        ],
        representation: {
          mark: 'point',
          mapping: [
            {
              encoding: 'x',
              field: 'height_value',
              type: 'quantitative',
              // domain: [60, 200],
            },
          ],
          select: {
            name: 'height-filter',
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
        transformation: [
          {
            filter: 'd.height_value && d.weight_value && d.age_value',
          },
          {
            filter: {
              name: 'age-filter',
              source: 'donors',
            },
          },
          {
            filter: {
              name: 'height-filter',
              source: 'donors',
            },
          },
          {
            filter: {
              name: 'weight-filter',
              source: 'donors',
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

export const CrossEntityStripPlot = {
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
              source: 'donors',
              name: 'age-filter',
            },
          },
          {
            filter: {
              source: 'samples',
              name: 'organ-filter',
              mapping: {
                origin: 'hubmap_id',
                target: 'd.donor.hubmap_id',
              },
            },
          },
        ],
        representation: {
          mark: 'point',
          mapping: [
            {
              encoding: 'x',
              field: 'age_value',
              type: 'quantitative',
            },
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
          name: 'samples',
          source: './data/samples.csv',
        },
        transformation: [
          {
            derive: {
              organ: 'd.origin_samples_unique_mapped_organs'
            }
          },
          {
            groupby: [
              'organ'
            ]
          },
          {
            rollup: {
              count: {
                op: 'count'
              }
            }
          },
          {
            orderby: {
              field: 'organ',
              order: 'desc'
            }
          },
          {
            filter: {
              name: 'age-filter',
              source: 'donors',
              mapping: {
                origin: 'd.donor.hubmap_id',
                target: 'hubmap_id',
              },
            },
          },
          {
            filter: {
              name: 'organ-filter',
              source: 'samples',
            },
          },
        ],
        representation: {
          mark: 'bar',
          mapping: [
            {
              encoding: 'x',
              field: 'organ',
              type: 'nominal',
            },
            {
              encoding: 'y',
              field: 'count',
              type: 'quantitative',
            },
          ],
          select: {
            name: 'organ-filter',
            how: {
              type: 'nominal',
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
        transformation: [
          {
            filter: 'd.age_value',
          },
          {
            filter: {
              name: 'age-filter',
              source: 'donors',
            },
          },
          {
            filter: {
              name: 'organ-filter',
              source: 'samples',
            },
          },
          {
            orderby: {
              field: 'age_value',
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

export const BasicStripPlot = {
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
              source: 'donors',
              name: 'time-filter',
            },
          },
          {
            filter: {
              source: 'donors',
              name: 'age-filter',
              mapping: {
                origin: 'd.donor.hubmap_id',
                target: 'hubmap_id',
              },
            },
          },
        ],
        representation: {
          mark: 'point',
          mapping: [
            {
              encoding: 'x',
              field: 'created_timestamp',
              type: 'quantitative',
            },
          ],
          select: {
            name: 'time-filter',
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
        transformation: [
          {
            filter: {
              source: 'donors',
              name: 'age-filter',
            },
          },
          {
            filter: {
              source: 'samples',
              name: 'time-filter',
              mapping: {
                origin: 'hubmap_id',
                target: 'd.donor.hubmap_id',
              },
            },
          },
        ],
        representation: {
          mark: 'point',
          mapping: [
            {
              encoding: 'x',
              field: 'age_value',
              type: 'quantitative',
            },
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
        transformation: [
          {
            filter: 'd.created_timestamp',
          },
          {
            filter: {
              name: 'time-filter',
              source: 'samples',
            },
          },
          {
            filter: {
              name: 'organ-filter',
              source: 'samples',
            },
          },
          {
            orderby: {
              field: 'created_timestamp',
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
              field: 'created_timestamp',
              encoding: 'x',
              type: 'quantitative',
            },
          ],
        },
      },
    ],
  },
};

export const AlternateCrossFilter = {
  args: {
    specs: [
      {
        source: {
          name: 'samples',
          source: './data/samples.csv',
        },
        transformation: [
          {
            filter: {
              source: 'samples',
              name: 'time-filter',
            },
          },
          {
            filter: {
              source: 'donors',
              name: 'age-filter',
              mapping: {
                origin: 'd.donor.hubmap_id',
                target: 'hubmap_id',
              },
            },
          },
        ],
        representation: {
          mark: 'point',
          mapping: [
            {
              encoding: 'x',
              field: 'created_timestamp',
              type: 'quantitative',
            },
          ],
          select: {
            name: 'time-filter',
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
        transformation: [
          {
            filter: {
              source: 'donors',
              name: 'age-filter',
            },
          },
          {
            filter: {
              source: 'samples',
              name: 'time-filter',
              mapping: {
                origin: 'd.donor.hubmap_id',
                target: 'hubmap_id',
              },
            },
          },
        ],
        representation: {
          mark: 'point',
          mapping: [
            {
              encoding: 'x',
              field: 'age_value',
              type: 'quantitative',
            },
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
        transformation: [
          {
            filter: 'd.age_value',
          },
          {
            filter: {
              name: 'time-filter',
              source: 'samples',
              mapping: {
                origin: 'hubmap_id',
                target: 'd.donor.hubmap_id',
              },
            },
          },
          {
            filter: {
              name: 'age-filter',
              source: 'samples',
            },
          },
          {
            orderby: {
              field: 'age_value',
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
              field: 'age_value',
              encoding: 'text',
              mark: 'text',
              type: 'nominal',
            },
          ],
        },
      },
    ],
  },
};

// Note, the brush doesn't actually do anything in this example, but this was to debug
// an error where layered specs weren't rendering if a brush was present.
export const FilterLayeredViz = {
  args: {
    specs: [
      {
        source: {
          name: 'datasets',
          source: './data/datasets.csv',
        },
        transformation: [
          {
            groupby: ['origin_samples_unique_mapped_organs', 'assay_category'],
          },
          {
            rollup: {
              count: { op: 'count' },
            },
          },
        ],
        representation: [
          {
            mark: 'rect',
            mapping: [
              { encoding: 'color', field: 'count', type: 'quantitative' },
              {
                encoding: 'y',
                field: 'origin_samples_unique_mapped_organs',
                type: 'nominal',
              },
              { encoding: 'x', field: 'assay_category', type: 'nominal' },
            ],
          },
          {
            mark: 'text',
            mapping: [
              { encoding: 'text', field: 'count', type: 'quantitative' },
              {
                encoding: 'y',
                field: 'origin_samples_unique_mapped_organs',
                type: 'nominal',
              },
              { encoding: 'x', field: 'assay_category', type: 'nominal' },
            ],
            select: {
              name: 'filter-from-heatmap',
              how: {
                type: 'interval',
                on: 'xy',
              },
            },
          },
        ],
      },
    ],
  },
};

export const SimplePointSelection = {
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
              name: 'sex-select',
              source: 'donors',
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
          select: {
            name: 'sex-select',
            how: {
              type: 'point',
            },
            fields: 'sex',
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
              name: 'sex-select',
              source: 'donors',
            },
          },
        ],
        representation: {
          mark: 'point',
          mapping: [
            { encoding: 'y', field: 'height_value', type: 'quantitative' },
            { encoding: 'x', field: 'weight_value', type: 'quantitative' },
            { encoding: 'color', field: 'sex', type: 'nominal' },
          ],
        },
      },
    ],
  },
};

export const PointSelectionRow = {
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
              name: 'race-select',
              source: 'donors',
            },
          },
          {
            groupby: ['sex', 'race'],
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
            { encoding: 'y', field: 'race', type: 'nominal' },
            { encoding: 'x', field: 'sex', type: 'nominal' },
            { encoding: 'color', field: 'race', type: 'nominal' },
          ],
          select: {
            name: 'race-select',
            how: {
              type: 'point',
            },
            fields: 'race',
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
              name: 'race-select',
              source: 'donors',
            },
          },
        ],
        representation: {
          mark: 'point',
          mapping: [
            { encoding: 'y', field: 'height_value', type: 'quantitative' },
            { encoding: 'x', field: 'weight_value', type: 'quantitative' },
            { encoding: 'color', field: 'race', type: 'nominal' },
          ],
        },
      },
    ],
  },
};

export const PointSelectionColumn = {
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
              name: 'sex-select',
              source: 'donors',
            },
          },
          {
            groupby: ['sex', 'race'],
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
            { encoding: 'y', field: 'race', type: 'nominal' },
            { encoding: 'x', field: 'sex', type: 'nominal' },
            { encoding: 'color', field: 'sex', type: 'nominal' },
          ],
          select: {
            name: 'sex-select',
            how: {
              type: 'point',
            },
            fields: 'sex',
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
              name: 'sex-select',
              source: 'donors',
            },
          },
        ],
        representation: {
          mark: 'point',
          mapping: [
            { encoding: 'y', field: 'height_value', type: 'quantitative' },
            { encoding: 'x', field: 'weight_value', type: 'quantitative' },
            { encoding: 'color', field: 'sex', type: 'nominal' },
          ],
        },
      },
    ],
  },
};

export const PointSelectionCell = {
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
              name: 'sex-select',
              source: 'donors',
            },
          },
          {
            groupby: ['sex', 'race'],
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
            { encoding: 'y', field: 'race', type: 'nominal' },
            { encoding: 'x', field: 'sex', type: 'nominal' },
            { encoding: 'color', field: 'sex_count', type: 'quantitative' },
          ],
          select: {
            name: 'sex-select',
            how: {
              type: 'point',
            },
            fields: ['sex', 'race'],
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
              name: 'sex-select',
              source: 'donors',
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

export const PointSelectionCellCrossFilter = {
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
              name: 'sex-select',
              source: 'donors',
            },
          },
          {
            filter: {
              name: 'height-weight-select',
              source: 'donors',
            },
          },
          {
            groupby: ['sex', 'race'],
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
            { encoding: 'y', field: 'race', type: 'nominal' },
            { encoding: 'x', field: 'sex', type: 'nominal' },
            { encoding: 'color', field: 'sex_count', type: 'quantitative' },
          ],
          select: {
            name: 'sex-select',
            how: {
              type: 'point',
            },
            fields: ['sex', 'race'],
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
              name: 'sex-select',
            },
          },
          {
            filter: {
              name: 'height-weight-select',
            },
          },
        ],
        representation: {
          mark: 'point',
          mapping: [
            { encoding: 'y', field: 'height_value', type: 'quantitative' },
            { encoding: 'x', field: 'weight_value', type: 'quantitative' },
          ],
          select: {
            name: 'height-weight-select',
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
