// import { fn } from '@storybook/test'
import TestSlotsSimple from './TestSlotsSimple.vue';

// export const ActionsData = {
//   onPinTask: fn(),
//   onArchiveTask: fn(),
// }

export default {
  component: TestSlotsSimple,
  tags: ['autodocs'],
  title: 'Test Specs',
};

export const Default = {
  args: {
    defaultSpec: {
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
        select: {
          name: 'scatter-select',
          how: {
            type: 'interval',
            on: 'xy',
          },
        },
      },
    },
    customSpec: {
      source: {
        name: 'donors',
        source: './data/donors.csv',
      },
      transformation: [
        {
          filter: {
            name: 'scatter-select',
          },
        },
        {
          rollup: {
            count: {
              op: 'count',
            },
          },
        },
      ],
    },
  },
};

export const BarChart = {
  args: {
    defaultSpec: {
      source: {
        name: 'donors',
        source: './data/donors.csv',
      },
      transformation: [
        { filter: { name: 'scatter-select' } },
        {
          groupby: 'sex',
        },
        {
          rollup: {
            count: {
              op: 'count',
            },
          },
        },
      ],
      representation: {
        mark: 'bar',
        mapping: [
          { encoding: 'y', field: 'count', type: 'quantitative' },
          { encoding: 'x', field: 'sex', type: 'nominal' },
        ],
        select: {
          name: 'scatter-select',
          how: {
            type: 'point',
          },
          fields: 'sex',
        },
      },
    },
    customSpec: {
      source: {
        name: 'donors',
        source: './data/donors.csv',
      },
      transformation: [
        {
          filter: {
            name: 'scatter-select',
          },
        },
        {
          rollup: {
            count: {
              op: 'count',
            },
          },
        },
      ],
    },
  },
};

export const DiffTransform = {
  args: {
    defaultSpec: {
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
        select: {
          name: 'scatter-select',
          how: {
            type: 'interval',
            on: 'xy',
          },
        },
      },
    },
    customSpec: {
      source: {
        name: 'donors',
        source: './data/donors.csv',
      },
      transformation: [
        {
          filter: {
            name: 'scatter-select',
          },
        },
        {
          groupby: 'sex',
        },
        {
          rollup: {
            count: {
              op: 'count',
            },
          },
        },
      ],
    },
  },
};
