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
//       source: {
//         name: 'penguins',
//         source: './data/penguins.csv',
//       },
//       representation: {
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
      transformations: [
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
      transformations: [
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
      transformations: [
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
      transformations: [
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
      transformations: [
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
//       transformations: [
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
      transformations: [
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
      transformations: [
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
      transformations: [
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
      transformations: [
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
      transformations: [
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

export const Heatmap = {
  args: {
    spec: {
      source: {
        name: 'datasets',
        source: './data/datasets.csv',
      },
      transformations: [
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
//       source: {
//         name: 'penguins',
//         source: './data/penguins.csv',
//       },
//       representation: {
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
//       source: {
//         name: 'penguins',
//         source: './data/penguins.csv',
//       },
//       representation: [
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
      representation: [
        {
          mark: 'bar',
          mapping: [
            { encoding: 'y', field: 'sex', type: 'nominal' },
            { encoding: 'x', field: 'mean_mass', type: 'quantitative' },
          ],
        },
        {
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
      source: {
        name: 'donors',
        source: './data/donors.csv',
      },
      representation: {
        mark: 'row',
        mapping: [
          {
            mark: 'rect',
            field: 'weight_value',
            encoding: 'color',
            type: 'quantitative',
          },
          {
            mark: 'point',
            field: 'height_value',
            encoding: 'size',
            type: 'quantitative',
          },
          { mark: 'text', field: '*', encoding: 'text' },
        ],
      },
    },
  },
};

// List of encodings
export const TableDefault = {
  args: {
    spec: {
      source: {
        name: 'donors',
        source: './data/donors.csv',
      },
      representation: {
        mark: 'row',
        mapping: [{ mark: 'text', field: '*', encoding: 'text' }],
      },
    },
  },
};

export const LayeredTableExample1 = {
  args: {
    spec: {
      source: {
        name: 'donors',
        source: './data/donors.csv',
      },
      representation: [
        {
          mark: 'row',
          mapping: [{ mark: 'rect', field: '*', encoding: 'color' }],
        },
        {
          mark: 'row',
          mapping: [
            { mark: 'text', field: '*', value: 'white', encoding: 'color' },
          ],
        },
      ],
    },
  },
};

export const LayeredTableExample2 = {
  args: {
    spec: {
      source: {
        name: 'donors',
        source: './data/donors.csv',
      },
      representation: [
        {
          mark: 'row',
          mapping: [
            { mark: 'point', field: '*', encoding: 'size' },
            { mark: 'point', field: '*', encoding: 'color' },
          ],
        },
      ],
    },
  },
};

export const OrganMap = {
  args: {
    spec: {
      source: {
        name: 'donors',
        source: './data/organs.json', // e.g. a geojson format
      },
      ///
      representation: {
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
      source: {
        name: 'donors',
        source: './data/donors.csv',
      },
      representation: {
        mark: 'checkbox',
        mapping: [{ field: 'sex', encoding: 'text', type: 'nominal' }],
      },
    },
  },
};
