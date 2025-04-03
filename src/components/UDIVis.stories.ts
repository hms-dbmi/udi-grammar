// import { fn } from '@storybook/test'

import UDIVis from './UDIVis.vue';

// export const ActionsData = {
//   onPinTask: fn(),
//   onArchiveTask: fn(),
// }

export default {
  component: UDIVis,
  tags: ['autodocs'],
  title: 'Other',
  //👇 Our exports that end in "Data" are not stories.
  // excludeStories: /.*Data$/,
  // args: {
  //   ...ActionsData,
  // },
};

// export const Default = {
//   args: {
//     spec: {
//       source: {
//         name: 'penguins',
//         source: './data/penguins.csv',
//       },
//       representation: {
//         mark: 'point',
//         encoding: {
//           x: { field: 'bill_length_mm' },
//           y: { field: 'flipper_length_mm' },
//           color: { field: 'body_mass_g' },
//         },
//       },
//     },
//   },
// };

export const Default = {
  args: {
    spec: {
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
      },
    },
  },
};

export const Heatmap = {
  args: {
    spec: {
      source: {
        name: 'datasets',
        source: './data/datasets.csv',
      },
      transformation: [
        {
          groupby: ['origin_samples_unique_mapped_organs', 'assay_category'],
        },
        {
          rollup: {
            count: { op: 'count' },
          },
        },
        // {
        //   orderby: 'organ_count',
        // },
      ],
      representation: {
        mark: 'rect',
        mapping: [
          { encoding: 'color', field: 'count', type: 'quantitative' },
          {
            encoding: 'y',
            field: 'origin_samples_unique_mapped_organs',
            type: 'nominal',
          },
          { encoding: 'x', field: 'assay_category', type: 'nominal' },
        ],
      },
    },
  },
};

//  {
//   type: 'columnar'
//   mark: 'table',
//   mapping: {
//     // text, color, bar,

//     // other data representations

//     // map, images,
//   }
//  }

// export const Template = {
//   args: {
//     spec: {
//       source: {
//         name: 'penguins',
//         source: './data/penguins.csv',
//       },
//       representation: {
//         type: 'GoGComponent',
//         mark: '',
//         encoding: {

//         }
//       }
//     }
//   }
// }

// export const Layering = {
//   args: {
//     spec: {
//       source: {
//         name: 'penguins',
//         source: './data/penguins.csv',
//       },
//       representation: [
//         {
//           type: 'GoGComponent',
//           mark: 'point',
//           encoding: {
//             x: { field: 'bill_length_mm' },
//             y: { field: 'flipper_length_mm' },
//           },
//         },
//         {
//           type: 'GoGComponent',
//           mark: 'circle',
//           encoding: {
//             x: { field: 'bill_length_mm' },
//             y: { field: 'flipper_length_mm' },
//             color: { field: 'sex' },
//           },
//         },
//       ],
//     },
//   },
// };

export const Layering = {
  args: {
    spec: {
      source: {
        name: 'donors',
        source: './data/donors.csv',
      },
      transformation: [
        {
          groupby: 'sex',
        },
        {
          rollup: {
            mean_mass: { op: 'mean', field: 'weight_value' },
          },
        },
      ],
      representation: [
        {
          mark: 'bar',
          mapping: [
            { encoding: 'y', field: 'sex', type: 'nominal' },
            { encoding: 'x', field: 'mean_mass', type: 'quantitative' },
          ],
        },
        {
          mark: 'text',
          mapping: [
            { encoding: 'y', field: 'sex', type: 'nominal' },
            { encoding: 'x', field: 'mean_mass', type: 'quantitative' },
            { encoding: 'text', field: 'mean_mass', type: 'quantitative' },
          ],
        },
      ],
    },
  },
};

export const TableExample = {
  args: {
    spec: {
      source: {
        name: 'donors',
        source: './data/donors.csv',
      },
      representation: {
        mark: 'row',
        mapping: [
          {
            mark: 'rect',
            field: 'weight_value',
            encoding: 'color',
            type: 'quantitative',
          },
          {
            mark: 'point',
            field: 'height_value',
            encoding: 'size',
            type: 'quantitative',
          },
          { mark: 'text', field: '*', encoding: 'text' },
        ],
      },
    },
  },
};

// List of encodings
export const TableDefault = {
  args: {
    spec: {
      source: {
        name: 'donors',
        source: './data/donors.csv',
      },
      representation: {
        mark: 'row',
        mapping: { mark: 'text', field: '*', encoding: 'text' },
      },
    },
  },
};

export const LayeredTableExample1 = {
  args: {
    spec: {
      source: {
        name: 'donors',
        source: './data/donors.csv',
      },
      representation: [
        {
          mark: 'row',
          mapping: { mark: 'rect', field: '*', encoding: 'color' },
        },
        {
          mark: 'row',
          mapping: {
            mark: 'text',
            field: '*',
            value: 'white',
            encoding: 'color',
          },
        },
      ],
    },
  },
};

export const LayeredTableExample2 = {
  args: {
    spec: {
      source: {
        name: 'donors',
        source: './data/donors.csv',
      },
      representation: [
        {
          mark: 'row',
          mapping: [
            { mark: 'point', field: '*', encoding: 'size' },
            { mark: 'point', field: '*', encoding: 'color' },
          ],
        },
      ],
    },
  },
};

export const OrganMap = {
  args: {
    spec: {
      source: {
        name: 'donors',
        source: './data/organs.json', // e.g. a geojson format
      },
      ///
      representation: {
        mark: 'geometry',
        mapping: [
          { field: 'count', encoding: 'text', type: 'quantitative' },
          { field: 'name', encoding: 'color', type: 'quantitative' },
        ],
      },
    },
  },
};

export const Checkboxes = {
  args: {
    spec: {
      source: {
        name: 'donors',
        source: './data/donors.csv',
      },
      representation: {
        mark: 'checkbox',
        mapping: [{ field: 'sex', encoding: 'text', type: 'nominal' }],
      },
    },
  },
};
