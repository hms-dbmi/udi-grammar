// import { fn } from '@storybook/test'
import TestIntervalFilterHooks from './TestIntervalFilterHooks.vue';

// export const ActionsData = {
//   onPinTask: fn(),
//   onArchiveTask: fn(),
// }

export default {
  component: TestIntervalFilterHooks,
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

export const ReadFilterStateXYExtraCharts = {
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
    additionalSpecs: [
      {
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
            { encoding: 'x', field: 'weight_value', type: 'quantitative' },
          ],
        },
      },
      {
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
            { encoding: 'x', field: 'height_value', type: 'quantitative' },
          ],
        },
      },
      {
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
      },
    ],
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

// I was orignally thinking we could/should link brushes across specs. But it didn't work, plus it is reasonable
// enough to say that the brush is always tied to just the chart from a ui perspective. So, brush names should be
// unique across charts, even if they are selecting the same variable.
export const ReadWriteFilterStateTwoCharts = {
  args: {
    testType: 'linked',
    selections: [
      {
        selectionName: 'weight-select-1',
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
            name: 'weight-select-1',
          },
        },
        {
          filter: {
            name: 'weight-select-2',
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
          name: 'weight-select-1',
          how: {
            type: 'interval',
            on: 'x',
          },
        },
      },
    },
    additionalSpecs: [
      {
        source: {
          name: 'donors',
          source: './data/donors.csv',
        },
        transformation: [
          {
            filter: {
              name: 'weight-select-1',
            },
          },
          {
            filter: {
              name: 'weight-select-2',
            },
          },
        ],
        representation: {
          mark: 'point',
          mapping: [
            { encoding: 'x', field: 'height_value', type: 'quantitative' },
            { encoding: 'y', field: 'weight_value', type: 'quantitative' },
          ],
          select: {
            name: 'weight-select-2',
            how: {
              type: 'interval',
              on: 'y',
            },
          },
        },
      },
    ],
  },
};

export const ReadWriteFilterStateXYExtraCharts = {
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
        select: {
          name: 'height-weight-select',
          how: {
            type: 'interval',
            on: 'xy',
          },
        },
      },
    },
    additionalSpecs: [
      {
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
      {
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
            { encoding: 'x', field: 'height_value', type: 'quantitative' },
          ],
          select: {
            name: 'height-select',
            how: {
              type: 'interval',
              on: 'x',
            },
          },
        },
      },
    ],
  },
};
