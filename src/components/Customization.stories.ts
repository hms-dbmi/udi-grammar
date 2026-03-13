import UDIVis from './UDIVis.vue';

export default {
  component: UDIVis,
  tags: ['autodocs'],
  title: 'Customization',
};

export const CustomAxisLabels = {
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
          {
            encoding: 'x',
            field: 'start',
            type: 'quantitative',
            title: 'Weight (kg)',
          },
          { encoding: 'x2', field: 'end', type: 'quantitative' },
          {
            encoding: 'y',
            field: 'count',
            type: 'quantitative',
            title: 'Number of Donors',
          },
        ],
      },
    },
  },
};
