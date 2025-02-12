// import { fn } from '@storybook/test'

import ParserComponent from './ParserComponent.vue';

// export const ActionsData = {
//   onPinTask: fn(),
//   onArchiveTask: fn(),
// }

export default {
  component: ParserComponent,
  tags: ['autodocs'],
  title: 'Pie Chart',
  //👇 Our exports that end in "Data" are not stories.
  // excludeStories: /.*Data$/,
  // args: {
  //   ...ActionsData,
  // },
};

export const Default = {
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
          filter: 'd.assay_category != null',
        },
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
        mark: 'arc',
        mapping: [
          { encoding: 'theta', field: 'freq', type: 'quantitative' },
          { encoding: 'color', field: 'assay_category', type: 'nominal' },
        ],
      },
    },
  },
};
