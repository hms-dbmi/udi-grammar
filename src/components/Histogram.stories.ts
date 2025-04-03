// import { fn } from '@storybook/test'

import UDIVis from './UDIVis.vue';

// export const ActionsData = {
//   onPinTask: fn(),
//   onArchiveTask: fn(),
// }

export default {
  component: UDIVis,
  tags: ['autodocs'],
  title: 'Histogram',
  //👇 Our exports that end in "Data" are not stories.
  // excludeStories: /.*Data$/,
  // args: {
  //   ...ActionsData,
  // },
};

// Mostly works (null doesn't), I don't like it.
export const Default = {
  args: {
    spec: {
      source: {
        name: 'donors',
        source: './data/donors.csv',
      },
      transformation: [
        {
          groupby: {
            start: `bin(d['weight_value'], ...bins(d['weight_value'], 10), 0)`,
            end: `bin(d['weight_value'], ...bins(d['weight_value'], 10), 1)`,
          },
        },
        {
          rollup: {
            count: { op: 'count' },
          },
        },
      ],
      representation: {
        mark: 'rect',
        mapping: [
          { encoding: 'x', field: 'start', type: 'quantitative' },
          { encoding: 'x2', field: 'end', type: 'quantitative' },
          { encoding: 'y', field: 'count', type: 'quantitative' },
        ],
      },
    },
  },
};

export const BinTransform2 = {
  args: {
    spec: {
      source: {
        name: 'donors',
        source: './data/donors.csv',
      },
      transformation: [
        {
          binby: {
            field: 'weight_value',
            bins: 10,
            nice: true,
            output: {
              bin_start: 'start',
              bin_end: 'end',
            },
          },
        },
        {
          rollup: {
            count: { op: 'count' },
          },
        },
      ],
      representation: {
        mark: 'rect',
        mapping: [
          { encoding: 'x', field: 'start', type: 'quantitative' },
          { encoding: 'x2', field: 'end', type: 'quantitative' },
          { encoding: 'y', field: 'count', type: 'quantitative' },
        ],
      },
    },
  },
};
