import { links } from "src/specs/constants";
import type { Example } from "src/specs/types";

export const tutorialExamples: Example[] = [
  {
    name: '1. Simple Table',
    description: 'The simplest specification just lists the source of the data. That is it! If no representation is specified a table will display all fields in the data.',
    spec: {
      source: { name: 'datasets', source: links.datasets },
    },
  },
  {
    name: '2. Table with Derived Fields',
    description: 'We can modify the previous spec to derive a new field from the existing data. In this case, we derive the organ of origin for each dataset from the `origin_samples_unique_mapped_organs` field, then group the datasets by this derived organ field and count how many datasets correspond to each organ.',
    spec: {
      source: { name: 'datasets', source: links.datasets },
      transformation: [
        { derive: { organ: `d.origin_samples_unique_mapped_organs` } },
        { groupby: ['organ'] },
        { rollup: { count: { op: 'count' } } },
      ],
    },
    highlightLines: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
  },
  {
    name: '3. Bar Chart',
    description: 'To create a simple bar chart that shows the number of datasets per organ, we can add a representation that specifies the mark type ("bar") and the x and y encodings to represent the organ and count, respectively.',
    spec: {
      source: { name: 'datasets', source: links.datasets },
      transformation: [
        { derive: { organ: `d.origin_samples_unique_mapped_organs` } },
        { groupby: ['organ'] },
        { rollup: { count: { op: 'count' } } },
      ],
      representation: [
        {
          mark: 'bar',
          mapping: [
            { encoding: 'x', field: 'organ', type: 'nominal' },
            { encoding: 'y', field: 'count', type: 'quantitative' },
          ],
        },
      ],
    },
    highlightLines: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41]
  },
  {
    name: '4. Stacked Bar Chart',
    description: 'We can further enhance the bar chart by stacking it based on the assay category. This allows us to see not only the number of datasets per organ but also how many datasets correspond to each assay type within those organs. We achieve this by adding an additional encoding for color, which represents the assay category.',
    spec: {
      source: { name: 'datasets', source: links.datasets },
      transformation: [
        {
          derive: {
            organ: "d.origin_samples_unique_mapped_organs"
          }
        },
        {
          groupby: ['organ', 'assay_category'],
        },
        {
          rollup: {
            count: { op: 'count' },
          },
        },
      ],
      representation: {
        mark: 'bar',
        mapping: [
          { encoding: 'x', field: 'organ', type: 'nominal' },
          { encoding: 'y', field: 'count', type: 'quantitative' },
          { encoding: 'color', field: 'assay_category', type: 'nominal' },
        ],
      },
    },
    highlightLines: [15, 39, 40, 41, 42, 43],
  },
  {
    name: '5. Heatmap',
    description: 'Now we can visualize the same data as a heatmap by modifying the mark type and mappings.',
    spec: {
      source: { name: 'datasets', source: links.datasets },
      transformation: [
        {
          derive: {
            organ: "d.origin_samples_unique_mapped_organs"
          }
        },
        {
          groupby: ['organ', 'assay_category'],
        },
        {
          rollup: {
            count: { op: 'count' },
          },
        },
      ],
      representation: [
        {
          mark: 'rect',
          mapping: [
            { encoding: 'x', field: 'organ', type: 'nominal' },
            { encoding: 'y', field: 'assay_category', type: 'nominal' },
            { encoding: 'color',
              field: 'count',
              type: 'quantitative',
              range: [
                "#eafab9",
                "#528aeb"
              ]              
            },
          ],
        },
      ],
    },
    highlightLines: [28, 37, 38, 42, 43, 44, 45, 46, 47],
  },
  {
    name: '6. Heatmap with Text Overlay',
    description: 'Finally, we add an additional representation spec to overlay the count text onto the heatmap.',
    spec: {
      source: { name: 'datasets', source: links.datasets },
      transformation: [
        {
          derive: {
            organ: "d.origin_samples_unique_mapped_organs"
          }
        },
        {
          groupby: ['organ', 'assay_category'],
        },
        {
          rollup: {
            count: { op: 'count' },
          },
        },
      ],
      representation: [
        {
          mark: 'rect',
          mapping: [
            { encoding: 'x', field: 'organ', type: 'nominal' },
            { encoding: 'y', field: 'assay_category', type: 'nominal' },
            { encoding: 'color',
              field: 'count',
              type: 'quantitative',
              range: [
                "#eafab9",
                "#528aeb"
              ]              
            },
          ],
        },
        {
          mark: 'text',
          mapping: [
            { encoding: 'x', field: 'organ', type: 'nominal' },
            { encoding: 'y', field: 'assay_category', type: 'nominal' },
            { encoding: 'text', field: 'count', type: 'quantitative' },
          ],
        },
      ],
    },
    highlightLines: [51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70],
  },
];
