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
      dataSource: {
        key: 'donors',
        source: './data/donors.csv',
      },
      dataRepresentation: {
        type: 'GoGComponent',
        mark: 'point',
        encoding: {
          x: { field: 'weight_value' },
          y: { field: 'height_value' },
        },
      },
    },
  },
};

export const BarChartAverageWeight = {
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
      dataRepresentation: {
        type: 'GoGComponent',
        mark: 'bar',
        encoding: {
          x: { field: 'sex' },
          y: { field: 'mean_mass' },
        },
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
        encoding: {
          x: { field: 'sex' },
          y: { field: 'sex_count' },
        },
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
        encoding: {
          x: { field: 'sex' },
          y: { field: 'datasets_by_sex' },
        },
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
        encoding: {
          x: { field: 'count' },
        },
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
        encoding: {
          x: { field: 'count' },
          color: { field: 'assay_category' },
        },
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
        encoding: {
          x: { field: 'freq', type: 'quantitative' },
          color: { field: 'assay_category' },
        },
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
        encoding: {
          x: { field: 'count' },
          y: { field: 'origin_samples_unique_mapped_organs' },
          color: { field: 'assay_category' },
        },
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
        encoding: {
          x: { field: 'count' },
          color: { field: 'origin_samples_unique_mapped_organs' },
          y: { field: 'assay_category' },
        },
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
        encoding: {
          x: { field: 'freq', type: 'quantitative' },
          y: { field: 'origin_samples_unique_mapped_organs' },
          color: { field: 'assay_category' },
        },
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
        encoding: {
          x: { field: 'freq', type: 'quantitative' },
          y: { field: 'assay_category' },
          color: { field: 'origin_samples_unique_mapped_organs' },
        },
      },
    },
  },
};

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
          encoding: {
            y: { field: 'sex' },
            x: { field: 'mean_mass' },
          },
        },
        {
          type: 'GoGComponent',
          mark: 'text',
          encoding: {
            y: { field: 'sex' },
            x: { field: 'mean_mass' },
            text: { field: 'mean_mass' },
          },
        },
      ],
    },
  },
};

// export const Table = {
//   args: {
//     spec: {
//       dataSource: {
//         key: 'penguins',
//         source: './data/penguins.csv',
//       },
//       dataRepresentation: {
//         type: 'TableComponent',
//       },
//     },
//   },
// };

// export const OrganMap = {
//   args: {
//     spec: {
//       dataSource: {
//         key: 'penguins',
//         source: './data/penguins.csv',
//       },
//       dataRepresentation: {
//         type: 'OrganMapComponent',
//       },
//     },
//   },
// };

// export const FilterPanel = {
//   args: {
//     spec: {
//       dataSource: {
//         key: 'penguins',
//         source: './data/penguins.csv',
//       },
//       dataRepresentation: {
//         type: 'FilterPanelComponent',
//       },
//     },
//   },
// };
