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
          x: { source: 'donors', field: 'weight_value' },
          y: { source: 'donors', field: 'height_value' },
        },
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
