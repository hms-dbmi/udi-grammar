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
          x: { source: 'penguins', field: 'bill_length_mm' },
          y: { source: 'penguins', field: 'flipper_length_mm' },
        },
      },
    },
  },
};

export const example2 = {
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
          x: { source: 'penguins', field: 'flipper_length_mm' },
          y: { source: 'penguins', field: 'flipper_length_mm' },
          color: { source: 'penguins', field: 'flipper_length_mm' },
        },
      },
    },
  },
};

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
            x: { source: 'penguins', field: 'bill_length_mm' },
            y: { source: 'penguins', field: 'flipper_length_mm' },
          },
        },
        {
          type: 'GoGComponent',
          mark: 'circle',
          encoding: {
            x: { source: 'penguins', field: 'bill_length_mm' },
            y: { source: 'penguins', field: 'flipper_length_mm' },
            color: { source: 'penguins', field: 'sex' },
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
