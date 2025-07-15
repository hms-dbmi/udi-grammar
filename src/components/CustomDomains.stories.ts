// import { fn } from '@storybook/test'

import { dom } from 'quasar';
import TestMultipleSpecs from './TestMultipleSpecs.vue';
import UDIVis from './UDIVis.vue';

// export const ActionsData = {
//   onPinTask: fn(),
//   onArchiveTask: fn(),
// }

export default {
  component: UDIVis,
  tags: ['autodocs'],
  title: 'Custom Domains and Ranges',
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
        source: './data/example_donors.csv',
      },
      transformation: [
        {
          orderby: 'height',
        },
      ],
      representation: {
        mark: 'row',
        mapping: [
          {
            mark: 'text',
            encoding: 'text',
            field: 'height',
            type: 'nominal',
          },
          {
            column: 'default',
            mark: 'bar',
            encoding: 'x',
            field: 'height',
            type: 'quantitative',
          },
          {
            column: 'domain [0, 100]',
            mark: 'bar',
            encoding: 'x',
            field: 'height',
            type: 'quantitative',
            domain: { min: 0, max: 100 },
          },

          {
            column: 'domain [0, -]',
            mark: 'bar',
            encoding: 'x',
            field: 'height',
            type: 'quantitative',
            domain: { min: 0 },
          },
          {
            column: 'range [0, 0.5]',
            mark: 'bar',
            encoding: 'x',
            field: 'height',
            type: 'quantitative',
            range: { min: 0, max: 0.5 },
          },
          {
            column: 'range [1, 0]',
            mark: 'bar',
            encoding: 'x',
            field: 'height',
            type: 'quantitative',
            range: { min: 1, max: 0 },
          },
        ],
      },
    },
  },
};

// Does not work yet :(
// export const Scatterplot = {
//   args: {
//     spec: {
//       source: {
//         name: 'donors',
//         source: './data/donors.csv',
//       },
//       representation: {
//         mark: 'point',
//         mapping: [
//           {
//             domain: { min: 0 },
//             encoding: 'y',
//             field: 'height_value',
//             type: 'quantitative',
//           },
//           { encoding: 'x', field: 'weight_value', type: 'quantitative' },
//         ],
//       },
//     },
//   },
// };
