// import { fn } from '@storybook/test'

import ParserComponent from './ParserComponent.vue';

// export const ActionsData = {
//   onPinTask: fn(),
//   onArchiveTask: fn(),
// }

export default {
  component: ParserComponent,
  title: 'Parser',
  tags: ['autodocs'],
  //👇 Our exports that end in "Data" are not stories.
  // excludeStories: /.*Data$/,
  // args: {
  //   ...ActionsData,
  // },
};

// export const Default = {
//   args: {
//     spec: {
//       dataSource: {
//         key: 'penguins',
//         source: './data/penguins.csv',
//       },
//       dataRepresentation: {
//         type: 'GoGComponent',
//         mark: 'point',
//         encoding: {
//           x: { field: 'bill_length_mm' },
//           y: { field: 'flipper_length_mm' },
//           color: { field: 'body_mass_g' },
//         },
//       },
//     },
//   },
// };

export const Default = {
  args: {
    spec: {
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
      },
    },
  },
};

export const BarChartAverageWeight = {
  args: {
    spec: {
      source: {
        name: 'donors',
        source: './data/donors.csv',
      },
      transformations: [
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
        type: 'GoGComponent',
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
      dataSource: {
        key: 'donors',
        source: './data/donors.csv',
      },
      dataTransformations: [
        {
          groupby: 'sex',
        },
        {
          rollup: {
            sex_count: { op: 'count' },
          },
        },
      ],
      dataRepresentation: {
        type: 'GoGComponent',
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
      dataSource: [
        {
          key: 'donors',
          source: './data/donors.csv',
        },
        {
          key: 'datasets',
          source: './data/datasets.csv',
        },
      ],
      dataTransformations: [
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
      dataRepresentation: {
        type: 'GoGComponent',
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
      dataSource: [
        {
          key: 'datasets',
          source: './data/datasets.csv',
        },
      ],
      dataTransformations: [
        {
          rollup: {
            count: { op: 'count' },
          },
        },
      ],
      dataRepresentation: {
        type: 'GoGComponent',
        mark: 'bar',
        mapping: [{ encoding: 'x', field: 'count', type: 'quantitative' }],
      },
    },
  },
};

export const SingleBarChartStacked = {
  args: {
    spec: {
      dataSource: [
        {
          key: 'datasets',
          source: './data/datasets.csv',
        },
      ],
      dataTransformations: [
        { groupby: 'assay_category' },
        {
          rollup: {
            count: { op: 'count' },
          },
        },
      ],
      dataRepresentation: {
        type: 'GoGComponent',
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
      dataSource: [
        {
          key: 'datasets',
          source: './data/datasets.csv',
        },
      ],
      dataTransformations: [
        {
          groupby: 'assay_category',
        },
        {
          rollup: {
            freq: { op: 'frequency' },
          },
        },
      ],
      dataRepresentation: {
        type: 'GoGComponent',
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
//       dataSource: {
//         key: 'datasets',
//         source: './data/datasets.csv',
//       },
//       dataTransformations: [
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
//       dataRepresentation: {
//         type: 'GoGComponent',
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
      dataSource: {
        key: 'datasets',
        source: './data/datasets.csv',
      },
      dataTransformations: [
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
      dataRepresentation: {
        type: 'GoGComponent',
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
      dataSource: {
        key: 'datasets',
        source: './data/datasets.csv',
      },
      dataTransformations: [
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
      dataRepresentation: {
        type: 'GoGComponent',
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
      dataSource: {
        key: 'datasets',
        source: './data/datasets.csv',
      },
      dataTransformations: [
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
          join: 'origin_samples_unique_mapped_organs',
          out: 'datasets',
        },
        {
          derive: {
            freq: 'd.organ_assay_count / d.organ_count',
          },
        },
      ],
      dataRepresentation: {
        type: 'GoGComponent',
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
      dataSource: {
        key: 'datasets',
        source: './data/datasets.csv',
      },
      dataTransformations: [
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
      dataRepresentation: {
        type: 'GoGComponent',
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
      dataSource: {
        key: 'datasets',
        source: './data/datasets.csv',
      },
      dataTransformations: [
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
      dataRepresentation: {
        type: 'GoGComponent',
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

export const Heatmap = {
  args: {
    spec: {
      dataSource: {
        key: 'datasets',
        source: './data/datasets.csv',
      },
      dataTransformations: [
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
      dataRepresentation: {
        type: 'GoGComponent',
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
    },
  },
};

//  {
//   type: 'columnar'
//   mark: 'table',
//   mapping: {
//     // text, color, bar,

//     // other data representations

//     // map, images,
//   }
//  }

// export const Template = {
//   args: {
//     spec: {
//       dataSource: {
//         key: 'penguins',
//         source: './data/penguins.csv',
//       },
//       dataRepresentation: {
//         type: 'GoGComponent',
//         mark: '',
//         encoding: {

//         }
//       }
//     }
//   }
// }

// export const Layering = {
//   args: {
//     spec: {
//       dataSource: {
//         key: 'penguins',
//         source: './data/penguins.csv',
//       },
//       dataRepresentation: [
//         {
//           type: 'GoGComponent',
//           mark: 'point',
//           encoding: {
//             x: { field: 'bill_length_mm' },
//             y: { field: 'flipper_length_mm' },
//           },
//         },
//         {
//           type: 'GoGComponent',
//           mark: 'circle',
//           encoding: {
//             x: { field: 'bill_length_mm' },
//             y: { field: 'flipper_length_mm' },
//             color: { field: 'sex' },
//           },
//         },
//       ],
//     },
//   },
// };

export const Layering = {
  args: {
    spec: {
      dataSource: {
        key: 'donors',
        source: './data/donors.csv',
      },
      dataTransformations: [
        {
          groupby: 'sex',
        },
        {
          rollup: {
            mean_mass: { op: 'mean', field: 'weight_value' },
          },
        },
      ],
      dataRepresentation: [
        {
          type: 'GoGComponent',
          mark: 'bar',
          mapping: [
            { encoding: 'y', field: 'sex', type: 'nominal' },
            { encoding: 'x', field: 'mean_mass', type: 'quantitative' },
          ],
        },
        {
          type: 'GoGComponent',
          mark: 'text',
          mapping: [
            { encoding: 'y', field: 'sex', type: 'nominal' },
            { encoding: 'x', field: 'mean_mass', type: 'quantitative' },
            { encoding: 'text', field: 'mean_mass', type: 'quantitative' },
          ],
        },
      ],
    },
  },
};

// List of encodings, column as a mark
export const TableExample = {
  args: {
    spec: {
      dataSource: {
        key: 'donors',
        source: './data/donors.csv',
      },
      dataRepresentation: {
        mark: 'row',
        mapping: [
          { field: 'weight_value', encoding: 'color', type: 'quantitative' },
          { field: 'height_value', encoding: 'size', type: 'quantitative' },
          { field: '*', encoding: 'text' },
        ],
      },
    },
  },
};

// List of encodings
export const TableDefault = {
  args: {
    spec: {
      dataSource: {
        key: 'donors',
        source: './data/donors.csv',
      },
      dataRepresentation: {
        mark: 'row',
        mapping: [{ field: '*', encoding: 'text' }],
      },
    },
  },
};

// List of encodings
export const ScatterWithMapping = {
  args: {
    spec: {
      dataSource: {
        key: 'donors',
        source: './data/donors.csv',
      },
      dataRepresentation: {
        mark: 'point',
        mapping: [
          { field: 'height_value', encoding: 'x', type: 'quantitative' },
          { field: 'weight_value', encoding: 'y', type: 'quantitative' },
          { field: 'bmi', encoding: 'color', type: 'quantitative' },
        ],
      },
    },
  },
};

export const OrganMap = {
  args: {
    spec: {
      dataSource: {
        key: 'donors',
        source: './data/organs.json', // e.g. a geojson format
      },
      ///
      dataRepresentation: {
        mark: 'geometry',
        mapping: [
          { field: 'count', encoding: 'text', type: 'quantitative' },
          { field: 'name', encoding: 'color', type: 'quantitative' },
        ],
      },
    },
  },
};

export const Checkboxes = {
  args: {
    spec: {
      dataSource: {
        key: 'donors',
        source: './data/donors.csv',
      },
      dataRepresentation: {
        mark: 'checkbox',
        mapping: [{ field: 'sex', encoding: 'text', type: 'nominal' }],
      },
    },
  },
};
