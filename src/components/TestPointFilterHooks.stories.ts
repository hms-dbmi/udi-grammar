// import { fn } from '@storybook/test'
import TestPointFilterHooks from './TestPointFilterHooks.vue';

// export const ActionsData = {
//   onPinTask: fn(),
//   onArchiveTask: fn(),
// }

export default {
  component: TestPointFilterHooks,
  tags: ['autodocs'],
  title: 'FilterHooksPoint',
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
        selectionName: 'race-select',
        entity: 'donors',
        field: 'race',
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
            name: 'race-select',
          },
        },
        {
          groupby: ['sex', 'race'],
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
          {
            encoding: 'x',
            field: 'race',
            type: 'nominal',
          },
          {
            encoding: 'color',
            field: 'count',
            type: 'quantitative',
          },
          {
            encoding: 'y',
            field: 'sex',
            type: 'nominal',
          },
        ],
        select: {
          name: 'race-select',
          how: {
            type: 'point',
          },
          fields: 'race',
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
        selectionName: 'sex-race-select',
        entity: 'donors',
        field: 'race',
      },
      {
        selectionName: 'sex-race-select',
        entity: 'donors',
        field: 'sex',
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
            name: 'sex-race-select',
          },
        },
        {
          groupby: ['sex', 'race'],
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
          {
            encoding: 'x',
            field: 'race',
            type: 'nominal',
          },
          {
            encoding: 'color',
            field: 'count',
            type: 'quantitative',
          },
          {
            encoding: 'y',
            field: 'sex',
            type: 'nominal',
          },
        ],
        select: {
          name: 'sex-race-select',
          how: {
            type: 'point',
          },
          fields: ['sex', 'race'],
        },
      },
    },
  },
};

export const ReadFilterStateXExtraCharts = {
  args: {
    testType: 'read',
    selections: [
      {
        selectionName: 'sex-race-select',
        entity: 'donors',
        field: 'race',
      },
      {
        selectionName: 'sex-race-select',
        entity: 'donors',
        field: 'sex',
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
            name: 'sex-race-select',
          },
        },
        {
          groupby: ['sex', 'race'],
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
          {
            encoding: 'x',
            field: 'race',
            type: 'nominal',
          },
          {
            encoding: 'color',
            field: 'count',
            type: 'quantitative',
          },
          {
            encoding: 'y',
            field: 'sex',
            type: 'nominal',
          },
        ],
        select: {
          name: 'sex-race-select',
          how: {
            type: 'point',
          },
          fields: ['sex', 'race'],
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
              name: 'sex-race-select',
            },
          },
        ],
        representation: {
          mark: 'point',
          mapping: [
            { encoding: 'x', field: 'weight_value', type: 'quantitative' },
            { encoding: 'y', field: 'height_value', type: 'quantitative' },
            { encoding: 'color', field: 'sex', type: 'nominal' },
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
              name: 'sex-race-select',
            },
          },
        ],
      },
    ],
  },
};

export const WriteFilterStateY = {
  args: {
    testType: 'write',
    selections: [
      {
        selectionName: 'sex-select',
        entity: 'donors',
        field: 'sex',
        values: ['Male', 'Female'],
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
            name: 'sex-select',
          },
        },
        {
          groupby: ['sex', 'race'],
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
          {
            encoding: 'x',
            field: 'race',
            type: 'nominal',
          },
          {
            encoding: 'color',
            field: 'count',
            type: 'quantitative',
          },
          {
            encoding: 'y',
            field: 'sex',
            type: 'nominal',
          },
        ],
      },
    },
  },
};

export const WriteFilterStateXY = {
  args: {
    testType: 'write',
    selections: [
      {
        selectionName: 'sex-race-select',
        entity: 'donors',
        field: 'sex',
        values: ['Male', 'Female'],
      },
      {
        selectionName: 'sex-race-select',
        entity: 'donors',
        field: 'race',
        values: [
          'Black or African American',
          'White',
          'Asian',
          'Unknown',
          'Native Hawaiian or Other Pacific Islander',
          'Other Race',
          'American Indian or Alaska native',
        ],
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
            name: 'sex-race-select',
          },
        },
        {
          groupby: ['sex', 'race'],
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
          {
            encoding: 'x',
            field: 'race',
            type: 'nominal',
          },
          {
            encoding: 'color',
            field: 'count',
            type: 'quantitative',
          },
          {
            encoding: 'y',
            field: 'sex',
            type: 'nominal',
          },
        ],
      },
    },
  },
};

export const ReadWriteFilterStateY = {
  args: {
    testType: 'linked',
    selections: [
      {
        selectionName: 'sex-select',
        entity: 'donors',
        field: 'sex',
        values: ['Male', 'Female'],
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
            name: 'sex-select',
          },
        },
        {
          groupby: ['sex', 'race'],
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
          {
            encoding: 'x',
            field: 'race',
            type: 'nominal',
          },
          {
            encoding: 'color',
            field: 'count',
            type: 'quantitative',
          },
          {
            encoding: 'y',
            field: 'sex',
            type: 'nominal',
          },
        ],
        select: {
          name: 'sex-select',
          how: {
            type: 'point',
          },
          fields: 'sex',
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
        selectionName: 'sex-race-select',
        entity: 'donors',
        field: 'sex',
        values: ['Male', 'Female'],
      },
      {
        selectionName: 'sex-race-select',
        entity: 'donors',
        field: 'race',
        values: [
          'Black or African American',
          'White',
          'Asian',
          'Unknown',
          'Native Hawaiian or Other Pacific Islander',
          'Other Race',
          'American Indian or Alaska native',
        ],
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
            name: 'sex-race-select',
          },
        },
        {
          groupby: ['sex', 'race'],
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
          {
            encoding: 'x',
            field: 'race',
            type: 'nominal',
          },
          {
            encoding: 'color',
            field: 'count',
            type: 'quantitative',
          },
          {
            encoding: 'y',
            field: 'sex',
            type: 'nominal',
          },
        ],
        select: {
          name: 'sex-race-select',
          how: {
            type: 'point',
          },
          fields: ['sex', 'race'],
        },
      },
    },
  },
};
