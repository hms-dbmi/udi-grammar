// import { fn } from '@storybook/test'

import UDIVis from './UDIVis.vue';

// export const ActionsData = {
//   onPinTask: fn(),
//   onArchiveTask: fn(),
// }

export default {
  component: UDIVis,
  tags: ['autodocs'],
  title: 'Bar Chart',
  //👇 Our exports that end in "Data" are not stories.
  // excludeStories: /.*Data$/,
  // args: {
  //   ...ActionsData,
  // },
};

export const Default = {
  args: {
    spec: {
      source: {
        name: 'donors',
        source: './data/donors.csv',
      },
      transformation: [
        {
          groupby: 'sex',
        },
        {
          rollup: {
            mean_mass: { op: 'mean', field: 'weight_value' },
          },
        },
      ],
      representation: {
        mark: 'bar',
        mapping: [
          { encoding: 'x', field: 'sex', type: 'nominal' },
          { encoding: 'y', field: 'mean_mass', type: 'quantitative' },
        ],
      },
    },
  },
};

export const BarChartSexCounts = {
  args: {
    spec: {
      source: {
        name: 'donors',
        source: './data/donors.csv',
      },
      transformation: [
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
  },
};

export const BarChartJoin = {
  args: {
    spec: {
      source: [
        {
          name: 'donors',
          source: './data/donors.csv',
        },
        {
          name: 'datasets',
          source: './data/datasets.csv',
        },
      ],
      transformation: [
        {
          in: ['donors', 'datasets'],
          join: {
            on: ['hubmap_id', 'donor.hubmap_id'],
          },
          out: 'donor_dataset_combined',
        },
        {
          groupby: 'sex',
        },
        {
          rollup: {
            datasets_by_sex: { op: 'count' },
          },
        },
      ],
      representation: {
        mark: 'bar',
        mapping: [
          { encoding: 'x', field: 'sex', type: 'nominal' },
          { encoding: 'y', field: 'datasets_by_sex', type: 'quantitative' },
        ],
      },
    },
  },
};

export const SingleBarChart = {
  args: {
    spec: {
      source: [
        {
          name: 'datasets',
          source: './data/datasets.csv',
        },
      ],
      transformation: [
        {
          rollup: {
            count: { op: 'count' },
          },
        },
      ],
      representation: {
        mark: 'bar',
        mapping: { encoding: 'x', field: 'count', type: 'quantitative' },
      },
    },
  },
};

export const SingleBarChartStacked = {
  args: {
    spec: {
      source: [
        {
          name: 'datasets',
          source: './data/datasets.csv',
        },
      ],
      transformation: [
        { groupby: 'assay_category' },
        {
          rollup: {
            count: { op: 'count' },
          },
        },
      ],
      representation: {
        mark: 'bar',
        mapping: [
          { encoding: 'x', field: 'count', type: 'quantitative' },
          { encoding: 'color', field: 'assay_category', type: 'nominal' },
        ],
      },
    },
  },
};

export const SingleBarChartStackedRelative = {
  args: {
    spec: {
      source: [
        {
          name: 'datasets',
          source: './data/datasets.csv',
        },
      ],
      transformation: [
        {
          groupby: 'assay_category',
        },
        {
          rollup: {
            freq: { op: 'frequency' },
          },
        },
      ],
      representation: {
        mark: 'bar',
        mapping: [
          { encoding: 'x', field: 'freq', type: 'quantitative' },
          { encoding: 'color', field: 'assay_category', type: 'nominal' },
        ],
      },
    },
  },
};

// export const BarChartGrouped = {
//   args: {
//     spec: {
//       source: {
//         name: 'datasets',
//         source: './data/datasets.csv',
//       },
//       transformation: [
//         {
//           groupby: ['origin_samples_unique_mapped_organs', 'assay_category'],
//         },
//         {
//           rollup: {
//             count: { op: 'count' },
//           },
//         },
//         // {
//         //   orderby: 'organ_count',
//         // },
//       ],
//       representation: {
//         mark: 'bar',
//         encoding: {
//           x: { field: 'count' },
//           y: { field: 'origin_samples_unique_mapped_organs' },
//           color: { field: 'assay_category' },
//           yOffset: { field: 'assay_category' },
//         },
//       },
//     },
//   },
// };

export const MultipleBarChartStacked = {
  args: {
    spec: {
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
        // {
        //   orderby: 'organ_count',
        // },
      ],
      representation: {
        mark: 'bar',
        mapping: [
          { encoding: 'x', field: 'count', type: 'quantitative' },
          {
            encoding: 'y',
            field: 'origin_samples_unique_mapped_organs',
            type: 'nominal',
          },
          { encoding: 'color', field: 'assay_category', type: 'nominal' },
        ],
      },
    },
  },
};

export const MultipleBarChartStackedReverse = {
  args: {
    spec: {
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
        // {
        //   orderby: 'organ_count',
        // },
      ],
      representation: {
        mark: 'bar',
        mapping: [
          { encoding: 'x', field: 'count', type: 'quantitative' },
          {
            encoding: 'color',
            field: 'origin_samples_unique_mapped_organs',
            type: 'nominal',
          },
          { encoding: 'y', field: 'assay_category', type: 'nominal' },
        ],
      },
    },
  },
};

export const MultipleBarChartStackedRelative = {
  args: {
    spec: {
      source: {
        name: 'datasets',
        source: './data/datasets.csv',
      },
      transformation: [
        {
          groupby: 'origin_samples_unique_mapped_organs',
          out: 'groupCounts',
        },
        {
          rollup: {
            organ_count: { op: 'count' },
          },
        },
        {
          in: 'datasets',
          groupby: ['origin_samples_unique_mapped_organs', 'assay_category'],
        },
        {
          rollup: {
            organ_assay_count: { op: 'count' },
          },
        },
        {
          in: ['datasets', 'groupCounts'],
          join: { on: 'origin_samples_unique_mapped_organs' },
          out: 'datasets',
        },
        {
          derive: {
            freq: 'd.organ_assay_count / d.organ_count',
          },
        },
      ],
      representation: {
        mark: 'bar',
        mapping: [
          { encoding: 'x', field: 'freq', type: 'quantitative' },
          {
            encoding: 'y',
            field: 'origin_samples_unique_mapped_organs',
            type: 'nominal',
          },
          { encoding: 'color', field: 'assay_category', type: 'nominal' },
        ],
      },
    },
  },
};

export const MultipleBarChartStackedRelativeReverse = {
  args: {
    spec: {
      source: {
        name: 'datasets',
        source: './data/datasets.csv',
      },
      transformation: [
        {
          groupby: 'assay_category',
          out: 'groupCounts',
        },
        {
          rollup: {
            organ_count: { op: 'count' },
          },
        },
        {
          in: 'datasets',
          groupby: ['origin_samples_unique_mapped_organs', 'assay_category'],
        },
        {
          rollup: {
            organ_assay_count: { op: 'count' },
          },
        },
        {
          in: ['datasets', 'groupCounts'],
          join: 'origin_samples_unique_mapped_organs',
          out: 'datasets',
        },
        {
          derive: {
            freq: 'd.organ_assay_count / d.organ_count',
          },
        },
      ],
      representation: {
        mark: 'bar',
        mapping: [
          { encoding: 'x', field: 'freq', type: 'quantitative' },
          { encoding: 'y', field: 'assay_category', type: 'nominal' },
          {
            encoding: 'color',
            field: 'origin_samples_unique_mapped_organs',
            type: 'nominal',
          },
        ],
      },
    },
  },
};

export const MultipleBarChartStackedFiltered = {
  args: {
    spec: {
      source: {
        name: 'datasets',
        source: './data/datasets.csv',
      },
      transformation: [
        {
          filter: 'd.assay_category !== null',
        },
        {
          groupby: ['origin_samples_unique_mapped_organs', 'assay_category'],
        },
        {
          rollup: {
            count: { op: 'count' },
          },
        },
      ],
      representation: {
        mark: 'bar',
        mapping: [
          { encoding: 'x', field: 'count', type: 'quantitative' },
          {
            encoding: 'y',
            field: 'origin_samples_unique_mapped_organs',
            type: 'nominal',
          },
          { encoding: 'color', field: 'assay_category', type: 'nominal' },
        ],
      },
    },
  },
};
