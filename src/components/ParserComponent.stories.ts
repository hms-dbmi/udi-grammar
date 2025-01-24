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

export const Default = {
  args: {
    spec: {
      dataSource: {
        key: 'penguins',
        source: './data/penguins.csv',
      },
      dataRepresentation: {
        type: 'GoGComponent',
        mark: 'point',
        encoding: {
          x: { field: 'bill_length_mm' },
          y: { field: 'flipper_length_mm' },
          color: { field: 'body_mass_g' },
        },
      },
    },
  },
};

export const ScatterDonors = {
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

export const BarChartSexCounts = {
  args: {
    spec: {
      dataSource: {
        key: 'penguins',
        source: './data/penguins.csv',
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

export const BarChartMeanMass = {
  args: {
    spec: {
      dataSource: {
        key: 'penguins',
        source: './data/penguins.csv',
      },
      dataTransformations: [
        {
          groupby: 'sex',
        },
        {
          rollup: {
            mean_mass: { op: 'mean', field: 'body_mass_g' },
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

export const BarChartJoinExample = {
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
          join: {
            tables: ['donors', 'datasets'],
            on: ['hubmap_id', 'donor.hubmap_id'],
          },
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

export const Layering = {
  args: {
    spec: {
      dataSource: {
        key: 'penguins',
        source: './data/penguins.csv',
      },
      dataRepresentation: [
        {
          type: 'GoGComponent',
          mark: 'point',
          encoding: {
            x: { field: 'bill_length_mm' },
            y: { field: 'flipper_length_mm' },
          },
        },
        {
          type: 'GoGComponent',
          mark: 'circle',
          encoding: {
            x: { field: 'bill_length_mm' },
            y: { field: 'flipper_length_mm' },
            color: { field: 'sex' },
          },
        },
      ],
    },
  },
};

export const Table = {
  args: {
    spec: {
      dataSource: {
        key: 'penguins',
        source: './data/penguins.csv',
      },
      dataRepresentation: {
        type: 'TableComponent',
      },
    },
  },
};

export const OrganMap = {
  args: {
    spec: {
      dataSource: {
        key: 'penguins',
        source: './data/penguins.csv',
      },
      dataRepresentation: {
        type: 'OrganMapComponent',
      },
    },
  },
};

export const FilterPanel = {
  args: {
    spec: {
      dataSource: {
        key: 'penguins',
        source: './data/penguins.csv',
      },
      dataRepresentation: {
        type: 'FilterPanelComponent',
      },
    },
  },
};

// export const Test2 = {
//   args: {
//     blarg: 'test 2!',
//   },
// };

// export const Pinned = {
//   args: {
//     task: {
//       ...Default.args.task,
//       state: 'TASK_PINNED',
//     },
//   },
// }

// export const Archived = {
//   args: {
//     task: {
//       ...Default.args.task,
//       state: 'TASK_ARCHIVED',
//     },
//   },
// }
