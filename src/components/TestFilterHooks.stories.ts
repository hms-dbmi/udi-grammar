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

export const ReadFilterStateX = {
  args: {
    testType: 'read',
    selections: [
      {
        selectionName: 'weight-select',
        entity: 'donors',
        field: 'weight_value',
      },
    ],
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
export const ReadFilterStateXY = {
  args: {
    testType: 'read',
    selections: [
      {
        selectionName: 'height-weight-select',
        entity: 'donors',
        field: 'weight_value',
      },
      {
        selectionName: 'height-weight-select',
        entity: 'donors',
        field: 'height_value',
      },
    ],
    spec: {
      source: {
        name: 'donors',
        source: './data/donors.csv',
      },
      transformation: [
        {
          filter: {
            name: 'height-weight-select',
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
          name: 'height-weight-select',
          how: {
            type: 'interval',
            on: 'xy',
          },
        },
      },
    },
  },
};

export const WriteFilterStateX = {
  args: {
    testType: 'write',
    selections: [
      {
        selectionName: 'weight-select',
        entity: 'donors',
        field: 'weight_value',
        minValue: 0,
        maxValue: 160,
      },
    ],
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

export const WriteFilterStateXY = {
  args: {
    testType: 'write',
    selections: [
      {
        selectionName: 'weight-select',
        entity: 'donors',
        field: 'weight_value',
        minValue: 0,
        maxValue: 160,
      },
      {
        selectionName: 'height-select',
        entity: 'donors',
        field: 'height_value',
        minValue: 50,
        maxValue: 200,
      },
    ],
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
        {
          filter: {
            name: 'height-select',
          },
        },
      ],
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

export const ReadWriteFilterStateX = {
  args: {
    testType: 'linked',
    selections: [
      {
        selectionName: 'weight-select',
        entity: 'donors',
        field: 'weight_value',
        minValue: 0,
        maxValue: 160,
      },
    ],
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

export const ReadWriteFilterStateY = {
  args: {
    testType: 'linked',
    selections: [
      {
        selectionName: 'height-select',
        entity: 'donors',
        field: 'height_value',
        minValue: 50,
        maxValue: 200,
      },
    ],
    spec: {
      source: {
        name: 'donors',
        source: './data/donors.csv',
      },
      transformation: [
        {
          filter: {
            name: 'height-select',
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
          name: 'height-select',
          how: {
            type: 'interval',
            on: 'y',
          },
        },
      },
    },
  },
};
export const ReadWriteFilterStateXY = {
  args: {
    testType: 'linked',
    selections: [
      {
        selectionName: 'height-weight-select',
        entity: 'donors',
        field: 'height_value',
        minValue: 50,
        maxValue: 200,
      },
      {
        selectionName: 'height-weight-select',
        entity: 'donors',
        field: 'weight_value',
        minValue: 0,
        maxValue: 160,
      },
    ],
    spec: {
      source: {
        name: 'donors',
        source: './data/donors.csv',
      },
      transformation: [
        {
          filter: {
            name: 'height-weight-select',
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
          name: 'height-weight-select',
          how: {
            type: 'interval',
            on: 'xy',
          },
        },
      },
    },
  },
};
