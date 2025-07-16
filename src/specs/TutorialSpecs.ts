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
    highlightLines: [5, 13, 15],
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
        { orderby: { field: 'organ', order: 'desc' } },
      ],
      representation: {
        mark: 'bar',
        mapping: [
          { encoding: 'x', field: 'organ', type: 'nominal' },
          { encoding: 'y', field: 'count', type: 'quantitative' },
        ],
      },
    },
    highlightLines: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 32, 35, 36, 37, 40, 41, 42]
  },
  {
    name: '3. Stacked Bar Chart',
    spec: {
      source: { name: 'datasets', source: links.datasets },
      transformation: [
        {
          groupby: ['origin_samples_unique_mapped_organs', 'assay_category'],
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
          { encoding: 'x', field: 'origin_samples_unique_mapped_organs', type: 'nominal' },
          { encoding: 'y', field: 'count', type: 'quantitative' },
          { encoding: 'color', field: 'assay_category', type: 'nominal' },
        ],
      },
    },
  },
  {
    name: 'Datasets Heatmap by Organ and Assay',
    spec: {
      source: { name: 'datasets', source: links.datasets },
      transformation: [
        {
          groupby: ['origin_samples_unique_mapped_organs', 'assay_category'],
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
            { encoding: 'color', field: 'count', type: 'quantitative' },
            { encoding: 'x', field: 'origin_samples_unique_mapped_organs', type: 'nominal' },
            { encoding: 'y', field: 'assay_category', type: 'nominal' },
          ],
        },
        {
          mark: 'text',
          mapping: [
            { encoding: 'text', field: 'count', type: 'quantitative' },
            { encoding: 'x', field: 'origin_samples_unique_mapped_organs', type: 'nominal' },
            { encoding: 'y', field: 'assay_category', type: 'nominal' },
          ],
        },
      ],
    },
  },
];
