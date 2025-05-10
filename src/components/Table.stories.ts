// import { fn } from '@storybook/test'

import UDIVis from './UDIVis.vue';

// export const ActionsData = {
//   onPinTask: fn(),
//   onArchiveTask: fn(),
// }

export default {
  component: UDIVis,
  tags: ['autodocs'],
  title: 'Table',
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
        name: 'penguins',
        source: './data/penguins.csv',
      },
      representation: {
        mark: 'row',
        mapping: [
          { encoding: 'text', field: '*', type: 'quantitative', mark: 'text' },
        ],
      },
    },
  },
};

export const SelectedColumns = {
  args: {
    spec: {
      source: {
        name: 'penguins',
        source: './data/penguins.csv',
      },
      representation: {
        mark: 'row',
        mapping: [
          {
            mark: 'text',
            field: 'bill_length_mm',
            encoding: 'text',
            type: 'quantitative',
          },
          {
            mark: 'text',
            field: 'bill_depth_mm',
            encoding: 'text',
            type: 'quantitative',
          },
        ],
      },
    },
  },
};

export const NamedColumns = {
  args: {
    spec: {
      source: {
        name: 'penguins',
        source: './data/penguins.csv',
      },
      representation: {
        mark: 'row',
        mapping: [
          {
            column: 'Bill Length (mm)',
            mark: 'text',
            field: 'bill_length_mm',
            encoding: 'text',
            type: 'quantitative',
          },
          {
            column: 'Bill Depth (mm)',
            mark: 'text',
            field: 'bill_depth_mm',
            encoding: 'text',
            type: 'quantitative',
          },
        ],
      },
    },
  },
};

export const MultipleMarks = {
  args: {
    spec: {
      source: {
        name: 'penguins',
        source: './data/penguins.csv',
      },
      representation: [
        {
          mark: 'row',
          mapping: [
            {
              mark: 'rect',
              field: 'body_mass_g',
              encoding: 'color',
              type: 'quantitative',
            },
            {
              mark: 'text',
              field: 'body_mass_g',
              encoding: 'text',
              type: 'quantitative',
            },
          ],
        },
      ],
    },
  },
};

export const MultipleOfSameMarks = {
  args: {
    spec: {
      source: {
        name: 'penguins',
        source: './data/penguins.csv',
      },
      transformation: [
        {
          derive: {
            ratio: 'd.bill_length_mm / d.bill_depth_mm',
            difference: 'd.bill_length_mm - d.bill_depth_mm',
          },
        },
      ],
      representation: [
        {
          mark: 'row',
          mapping: [
            {
              mark: 'text',
              field: 'bill_depth_mm',
              encoding: 'text',
              type: 'quantitative',
            },
            {
              column: 'Bill Size',
              mark: 'point',
              field: 'bill_length_mm',
              encoding: 'x',
              type: 'quantitative',
            },
          ],
        },
        {
          mark: 'row',
          mapping: [
            {
              column: 'Bill Size',
              mark: 'point',
              field: 'bill_depth_mm',
              encoding: 'x',
              type: 'quantitative',
            },
            {
              mark: 'text',
              field: 'bill_length_mm',
              encoding: 'text',
              type: 'quantitative',
            },
            {
              mark: 'text',
              field: 'ratio',
              encoding: 'text',
              type: 'quantitative',
            },
            {
              mark: 'text',
              field: 'difference',
              encoding: 'text',
              type: 'quantitative',
            },
          ],
        },
      ],
    },
  },
};

export const MultipleEncodings = {
  args: {
    spec: {
      source: {
        name: 'penguins',
        source: './data/penguins.csv',
      },
      representation: {
        mark: 'row',
        mapping: [
          {
            mark: 'point',
            field: 'body_mass_g',
            encoding: 'size',
            type: 'quantitative',
          },
          {
            mark: 'point',
            field: 'body_mass_g',
            encoding: 'color',
            type: 'quantitative',
          },
        ],
      },
    },
  },
};

export const MultipleFields = {
  args: {
    spec: {
      source: {
        name: 'penguins',
        source: './data/penguins.csv',
      },
      representation: {
        mark: 'row',
        mapping: [
          {
            column: 'Body Mass + Sex',
            mark: 'bar',
            field: 'body_mass_g',
            encoding: 'x',
            type: 'quantitative',
          },
          {
            column: 'Body Mass + Sex',
            mark: 'bar',
            field: 'sex',
            encoding: 'color',
            type: 'nominal',
          },
          {
            field: 'body_mass_g',
            encoding: 'text',
            mark: 'text',
            type: 'quantitative',
          },
          {
            field: 'sex',
            encoding: 'text',
            mark: 'text',
            type: 'quantitative',
          },
        ],
      },
    },
  },
};

export const SortTargetEncodings = {
  args: {
    spec: {
      source: {
        name: 'penguins',
        source: './data/penguins.csv',
      },
      representation: {
        mark: 'row',
        mapping: [
          {
            column: 'size (sort by xPos)',
            mark: 'point',
            field: 'bill_length_mm',
            encoding: 'x',
            type: 'quantitative',
            orderby: 'bill_length_mm',
          },
          {
            column: 'size (sort by xPos)',
            mark: 'point',
            field: 'bill_depth_mm',
            encoding: 'size',
            type: 'quantitative',
            orderby: 'bill_length_mm',
          },
          {
            column: 'size (sort by size)',
            mark: 'point',
            field: 'bill_length_mm',
            encoding: 'x',
            type: 'quantitative',
            orderby: 'bill_depth_mm',
          },
          {
            column: 'size (sort by size)',
            mark: 'point',
            field: 'bill_depth_mm',
            encoding: 'size',
            type: 'quantitative',
            orderby: 'bill_depth_mm',
          },
        ],
      },
    },
  },
};

export const MultiSort = {
  args: {
    spec: {
      source: {
        name: 'penguins',
        source: './data/penguins.csv',
      },
      transformation: [
        {
          orderby: [
            { field: 'species', order: 'asc' },
            { field: 'island', order: 'asc' },
            { field: 'bill_length_mm', order: 'desc' },
          ],
        },
      ],
      representation: {
        mark: 'row',
        mapping: [
          {
            mark: 'rect',
            field: 'species',
            encoding: 'color',
            type: 'nominal',
          },
          {
            mark: 'rect',
            field: 'island',
            encoding: 'color',
            type: 'nominal',
          },
          {
            mark: 'text',
            field: 'species',
            encoding: 'text',
            type: 'quantitative',
          },
          {
            mark: 'text',
            field: 'island',
            encoding: 'text',
            type: 'quantitative',
          },
          {
            mark: 'bar',
            field: 'bill_length_mm',
            encoding: 'x',
            type: 'quantitative',
          },
        ],
      },
    },
  },
};

export const TextEncoding = {
  args: {
    spec: {
      source: {
        name: 'penguins',
        source: './data/penguins.csv',
      },
      representation: {
        mark: 'row',
        mapping: [
          {
            column: 'text',
            mark: 'text',
            field: 'body_mass_g',
            encoding: 'text',
            type: 'quantitative',
          },

          {
            column: 'color',
            mark: 'text',
            field: 'body_mass_g',
            encoding: 'text',
            type: 'quantitative',
          },
          {
            column: 'color',
            mark: 'text',
            field: 'body_mass_g',
            encoding: 'color',
            type: 'quantitative',
          },

          {
            column: 'x',
            mark: 'text',
            field: 'body_mass_g',
            encoding: 'text',
            type: 'quantitative',
          },
          {
            column: 'x',
            mark: 'text',
            field: 'body_mass_g',
            encoding: 'x',
            type: 'quantitative',
          },

          {
            column: 'y',
            mark: 'text',
            field: 'body_mass_g',
            encoding: 'text',
            type: 'quantitative',
          },
          {
            column: 'y',
            mark: 'text',
            field: 'body_mass_g',
            encoding: 'y',
            type: 'quantitative',
          },
        ],
      },
    },
  },
};

export const BarEncodingQuantitative = {
  args: {
    spec: {
      source: {
        name: 'penguins',
        source: './data/penguins.csv',
      },
      representation: {
        mark: 'row',
        mapping: [
          {
            column: 'reference',
            mark: 'text',
            field: 'body_mass_g',
            encoding: 'text',
            type: 'quantitative',
          },
          {
            column: 'x',
            mark: 'bar',
            field: 'body_mass_g',
            encoding: 'x',
            type: 'quantitative',
          },
          {
            column: 'y',
            mark: 'bar',
            field: 'body_mass_g',
            encoding: 'y',
            type: 'quantitative',
          },
          {
            column: 'color',
            mark: 'bar',
            field: 'body_mass_g',
            encoding: 'color',
            type: 'quantitative',
          },
        ],
      },
    },
  },
};

export const BarEncodingNominal = {
  args: {
    spec: {
      source: {
        name: 'penguins',
        source: './data/penguins.csv',
      },
      representation: {
        mark: 'row',
        mapping: [
          {
            column: 'reference',
            mark: 'text',
            field: 'species',
            encoding: 'text',
            type: 'nominal',
          },
          {
            column: 'xOffset',
            mark: 'bar',
            field: 'species',
            encoding: 'xOffset',
            type: 'nominal',
          },
          {
            column: 'yOffset',
            mark: 'bar',
            field: 'species',
            encoding: 'yOffset',
            type: 'nominal',
          },
          {
            column: 'color',
            mark: 'bar',
            field: 'species',
            encoding: 'color',
            type: 'nominal',
          },
        ],
      },
    },
  },
};

export const RectEncodingQuantitative = {
  args: {
    spec: {
      source: {
        name: 'penguins',
        source: './data/penguins.csv',
      },
      representation: {
        mark: 'row',
        mapping: [
          {
            column: 'size',
            mark: 'rect',
            field: 'body_mass_g',
            encoding: 'size',
            type: 'quantitative',
          },
          {
            column: 'color',
            mark: 'rect',
            field: 'body_mass_g',
            encoding: 'color',
            type: 'quantitative',
          },
        ],
      },
    },
  },
};

export const RectEncodingNominal = {
  args: {
    spec: {
      source: {
        name: 'penguins',
        source: './data/penguins.csv',
      },
      representation: {
        mark: 'row',
        mapping: [
          {
            column: 'color',
            mark: 'rect',
            field: 'species',
            encoding: 'color',
            type: 'nominal',
          },
        ],
      },
    },
  },
};

// point

export const PointEncodingQuantitative = {
  args: {
    spec: {
      source: {
        name: 'penguins',
        source: './data/penguins.csv',
      },
      representation: {
        mark: 'row',
        mapping: [
          {
            column: 'reference',
            mark: 'text',
            field: 'body_mass_g',
            encoding: 'text',
            type: 'quantitative',
          },
          {
            column: 'size',
            mark: 'point',
            field: 'body_mass_g',
            encoding: 'size',
            type: 'quantitative',
          },
          {
            column: 'color',
            mark: 'point',
            field: 'body_mass_g',
            encoding: 'color',
            type: 'quantitative',
          },
          {
            column: 'x',
            mark: 'point',
            field: 'body_mass_g',
            encoding: 'x',
            type: 'quantitative',
          },
          {
            column: 'y',
            mark: 'point',
            field: 'body_mass_g',
            encoding: 'y',
            type: 'quantitative',
          },
          {
            column: 'xy',
            mark: 'point',
            field: 'body_mass_g',
            encoding: 'x',
            type: 'quantitative',
          },
          {
            column: 'xy',
            mark: 'point',
            field: 'body_mass_g',
            encoding: 'y',
            type: 'quantitative',
          },
        ],
      },
    },
  },
};

export const PointEncodingNominal = {
  args: {
    spec: {
      source: {
        name: 'penguins',
        source: './data/penguins.csv',
      },
      representation: {
        mark: 'row',
        mapping: [
          {
            column: 'color',
            mark: 'point',
            field: 'species',
            encoding: 'color',
            type: 'nominal',
          },
          // TODO: should support shape encoding for points
          // {
          //   column: 'color',
          //   mark: 'point',
          //   field: 'species',
          //   encoding: 'shape',
          //   type: 'nominal',
          // },
        ],
      },
    },
  },
};

// line

export const LineEncodingQuantitative = {
  args: {
    spec: {
      source: {
        name: 'penguins',
        source: './data/penguins.csv',
      },
      representation: {
        mark: 'row',
        mapping: [
          {
            column: 'x',
            mark: 'line',
            field: 'body_mass_g',
            encoding: 'x',
            type: 'quantitative',
          },
          {
            column: 'y',
            mark: 'line',
            field: 'body_mass_g',
            encoding: 'y',
            type: 'quantitative',
          },
          {
            column: 'color',
            mark: 'line',
            field: 'body_mass_g',
            encoding: 'color',
            type: 'quantitative',
          },
        ],
      },
    },
  },
};

export const LineEncodingNominal = {
  args: {
    spec: {
      source: {
        name: 'penguins',
        source: './data/penguins.csv',
      },
      representation: {
        mark: 'row',
        mapping: [
          {
            column: 'color',
            mark: 'line',
            field: 'species',
            encoding: 'color',
            type: 'nominal',
          },
          {
            column: 'xOffset',
            mark: 'line',
            field: 'species',
            encoding: 'xOffset',
            type: 'nominal',
          },
          {
            column: 'yOffset',
            mark: 'line',
            field: 'species',
            encoding: 'yOffset',
            type: 'nominal',
          },
        ],
      },
    },
  },
};

export const PenguinsDemo = {
  args: {
    spec: {
      source: {
        name: 'penguins',
        source: './data/penguins.csv',
      },
      representation: {
        mark: 'row',
        mapping: [
          {
            field: 'species',
            encoding: 'color',
            mark: 'rect',
            type: 'nominal',
          },

          {
            field: 'island',
            encoding: 'color',
            mark: 'rect',
            type: 'nominal',
          },

          {
            field: 'bill_length_mm',
            encoding: 'x',
            mark: 'bar',
            type: 'quantitative',
          },
          {
            field: 'bill_length_mm',
            encoding: 'x',
            mark: 'text',
            type: 'quantitative',
          },

          {
            field: 'bill_depth_mm',
            encoding: 'x',
            mark: 'bar',
            type: 'quantitative',
          },
          {
            field: 'bill_depth_mm',
            encoding: 'x',
            mark: 'text',
            type: 'quantitative',
          },

          {
            field: 'flipper_length_mm',
            encoding: 'x',
            mark: 'bar',
            type: 'quantitative',
          },
          {
            field: 'flipper_length_mm',
            encoding: 'x',
            mark: 'text',
            type: 'quantitative',
          },

          {
            field: 'body_mass_g',
            encoding: 'x',
            mark: 'bar',
            type: 'quantitative',
          },
          {
            field: 'body_mass_g',
            encoding: 'x',
            mark: 'text',
            type: 'quantitative',
          },

          {
            field: 'sex',
            encoding: 'color',
            mark: 'rect',
            type: 'nominal',
          },

          { mark: 'text', field: '*', encoding: 'text', type: 'quantitative' },
        ],
      },
    },
  },
};

export const Lollipop = {
  args: {
    spec: {
      source: {
        name: 'penguins',
        source: './data/penguins.csv',
      },
      representation: {
        mark: 'row',
        mapping: [
          {
            column: 'Species',
            mark: 'bar',
            field: 'species',
            encoding: 'color',
            type: 'nominal',
          },
          {
            column: 'Species',
            mark: 'bar',
            field: 'species',
            encoding: 'xOffset',
            type: 'nominal',
          },
          {
            column: 'Size',
            mark: 'line',
            field: 'flipper_length_mm',
            encoding: 'color',
            type: 'quantitative',
          },

          {
            column: 'Sex',
            mark: 'bar',
            field: 'sex',
            encoding: 'color',
            type: 'ordinal',
          },
          {
            column: 'Sex',
            mark: 'bar',
            field: 'sex',
            encoding: 'yOffset',
            type: 'ordinal',
          },
          {
            column: 'Flipper Length (line color)',
            mark: 'text',
            field: 'flipper_length_mm',
            encoding: 'text',
            type: 'quantitative',
          },
          {
            column: 'Size',
            mark: 'point',
            field: 'bill_length_mm',
            encoding: 'x',
            type: 'quantitative',
          },
          {
            column: 'Bill Length (x)',
            mark: 'text',
            field: 'bill_length_mm',
            encoding: 'text',
            type: 'quantitative',
          },
          {
            column: 'Size',
            mark: 'point',
            field: 'bill_depth_mm',
            encoding: 'size',
            type: 'quantitative',
          },
          {
            column: 'Bill Depth (point size)',
            mark: 'text',
            field: 'bill_depth_mm',
            encoding: 'text',
            type: 'quantitative',
          },
          {
            column: 'Size',
            mark: 'point',
            field: 'body_mass_g',
            encoding: 'color',
            type: 'quantitative',
          },
          {
            column: 'Body Mass (point color)',
            mark: 'text',
            field: 'body_mass_g',
            encoding: 'text',
            type: 'quantitative',
          },
        ],
      },
    },
  },
};

// TODO:  geometry, select, and more x2,y2, point nominal shape, could maybe map size to more things, e.g. line/bar width
