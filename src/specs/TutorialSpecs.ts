import type { Example } from "src/specs/types";

const links = {
  datasets: 'http://localhost:5001/metadata/v0/udi/datasets.tsv',
};

export const tutorialExamples: Example[] = [
  {
    name: '1. Simple Table',
    description: 'This is a table of raw metadata for every available dataset, with no transformations applied. All that is defined is the source and the representation, which specifies that all data fields should be shown as rows of text.',
    spec: {
      source: [{ name: 'datasets', source: links.datasets }],
      representation: [
        {
          mark: 'row',
          mapping: [{ mark: 'text', encoding: 'text', field: '*', type: 'nominal' }],
        },
      ],
    },
  },
  {
    name: '2. Bar Chart',
    description: 'We can modify the previous spec to create a bar chart that shows the number of datasets per organ. This is done by applying a transformation that counts the datasets by their organ of origin, then displays these counts using a simple bar chart. We change the mark from "text" to "bar", and specify the x and y encodings to represent the organ and count, respectively.',
    spec: {
      source: { name: 'datasets', source: links.datasets },
      transformation: [
        { derive: { organ: `d.origin_samples_unique_mapped_organs` } },
        { groupby: ['organ'] },
        { rollup: { count: { op: 'count' } } },
      ],
      representation: {
        mark: 'bar',
        mapping: [
          { encoding: 'x', field: 'organ', type: 'nominal' },
          { encoding: 'y', field: 'count', type: 'quantitative' },
        ],
      },
    },
    highlightLines: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 26, 29, 30, 31, 33, 34, 35, 36, 37]
  },
  {
    name: '3. Stacked Bar Chart',
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
    name: '4. Heatmap',
    description: 'Finally, we can visualize the same data as a heatmap by modifying the mark type and mappings, then adding an additional representation to overlay the count text onto the heatmap.',
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
    highlightLines: [28, 37, 38, 42, 43, 44, 45, 46, 47, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70],
  },
];
