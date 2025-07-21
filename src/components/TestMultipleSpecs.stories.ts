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
            },
          },
          {
            filter: {
              name: 'height-filter',
            },
          },
          {
            filter: {
              name: 'weight-filter',
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
            },
          },
          {
            filter: {
              name: 'height-filter',
            },
          },
          {
            filter: {
              name: 'weight-filter',
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
            },
          },
          {
            filter: {
              name: 'height-filter',
            },
          },
          {
            filter: {
              name: 'weight-filter',
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
            },
          },
          {
            filter: {
              name: 'height-filter',
            },
          },
          {
            filter: {
              name: 'weight-filter',
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
            },
          },
          {
            filter: {
              name: 'height-filter',
            },
          },
          {
            filter: {
              name: 'weight-filter',
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
            },
          },
          {
            filter: {
              name: 'height-filter',
            },
          },
          {
            filter: {
              name: 'weight-filter',
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
            },
          },
          {
            filter: {
              name: 'height-filter',
            },
          },
          {
            filter: {
              name: 'weight-filter',
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
            },
          },
          {
            filter: {
              name: 'height-filter',
            },
          },
          {
            filter: {
              name: 'weight-filter',
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

// export const PointSelection = {
//   args: {
//     specs: [
//       {
//         source: {
//           name: 'donors',
//           source: './data/donors.csv',
//         },
//         transformation: [
//           {
//             filter: {
//               name: 'scatter-select',
//             },
//           },
//           {
//             groupby: 'sex',
//           },
//           {
//             rollup: {
//               sex_count: { op: 'count' },
//             },
//           },
//         ],
//         representation: {
//           mark: 'bar',
//           mapping: [
//             { encoding: 'x', field: 'sex', type: 'nominal' },
//             { encoding: 'y', field: 'sex_count', type: 'quantitative' },
//           ],
//         },
//       },
//       {
//         source: {
//           name: 'donors',
//           source: './data/donors.csv',
//         },
//         representation: {
//           mark: 'point',
//           mapping: [
//             { encoding: 'y', field: 'height_value', type: 'quantitative' },
//             { encoding: 'x', field: 'weight_value', type: 'quantitative' },
//           ],
//           select: {
//             name: 'scatter-select',
//             how: {
//               type: 'interval',
//               on: 'xy',
//             },
//           },
//         },
//       },
//     ],
//   },
// };
