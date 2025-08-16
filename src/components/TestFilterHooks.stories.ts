// import { fn } from '@storybook/test'
import TestFilterHooks from './TestFilterHooks.vue';

// export const ActionsData = {
//   onPinTask: fn(),
//   onArchiveTask: fn(),
// }

export default {
  component: TestFilterHooks,
  tags: ['autodocs'],
  title: 'FilterHooks',
  //👇 Our exports that end in "Data" are not stories.
  // excludeStories: /.*Data$/,
  // args: {
  //   ...ActionsData,
  // },
};

export const ReadFilterState = {
  args: {
    testType: 'read',
    selections: {
      selectionName: 'weight-select',
      entity: 'donors',
      field: 'weight_value',
    },
    spec: {
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
      ],
      representation: {
        mark: 'point',
        mapping: [
          { encoding: 'y', field: 'height_value', type: 'quantitative' },
          { encoding: 'x', field: 'weight_value', type: 'quantitative' },
        ],
        select: {
          name: 'weight-select',
          how: {
            type: 'interval',
            on: 'x',
          },
        },
      },
    },
  },
};

export const WriteFilterState = {
  args: {
    testType: 'write',
    selections: {
      selectionName: 'weight-select',
      entity: 'donors',
      field: 'weight_value',
      minValue: 0,
      maxValue: 160,
    },
    spec: {
      source: {
        name: 'donors',
        source: './data/donors.csv',
      },
      transformation: [
        {
          filter: {
            name: 'weight-select',
          },
        },
      ],
      representation: {
        mark: 'point',
        mapping: [
          { encoding: 'y', field: 'height_value', type: 'quantitative' },
          { encoding: 'x', field: 'weight_value', type: 'quantitative' },
        ],
        // select: {
        //   name: 'scatter-select',
        //   how: {
        //     type: 'interval',
        //     on: 'x',
        //   },
        // },
      },
    },
  },
};

export const ReadWriteLinkedFilterState = {
  args: {
    testType: 'linked',
    selections: {
      selectionName: 'weight-select',
      entity: 'donors',
      field: 'weight_value',
      minValue: 0,
      maxValue: 160,
    },
    spec: {
      source: {
        name: 'donors',
        source: './data/donors.csv',
      },
      transformation: [
        {
          filter: {
            name: 'weight-select',
          },
        },
      ],
      representation: {
        mark: 'point',
        mapping: [
          { encoding: 'y', field: 'height_value', type: 'quantitative' },
          { encoding: 'x', field: 'weight_value', type: 'quantitative' },
        ],
        select: {
          name: 'weight-select',
          how: {
            type: 'interval',
            on: 'x',
          },
        },
      },
    },
  },
};
