import type { Example } from "src/specs/types";

const links = {
  datasets: 'http://localhost:5001/metadata/v0/udi/datasets.tsv',
};

export const tutorialExamples: Example[] = [
  {
    name: '1. Plain Table',
    description: 'This is a table of raw metadata for every available dataset, with no transformations applied. All that is provided is the source and the representation spec.',
    spec: {
      source: [{ name: 'datasets', source: links.datasets }],
      representation: [
        {
          mark: 'row',
          mapping: [{ mark: 'text', encoding: 'text', field: '*', type: 'nominal' }],
        },
      ],
    },
    highlightLines: [1, 2, 3],
  },
  {
    name: 'Datasets by Organ',
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
  },
  {
    name: 'Datasets by Assay and Organ',
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
          { encoding: 'x', field: 'count', type: 'quantitative' },
          { encoding: 'y', field: 'origin_samples_unique_mapped_organs', type: 'nominal' },
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
