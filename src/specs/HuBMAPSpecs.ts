import { links, thumbnails } from "src/specs/constants";
import { getColorBarMapping, getColorCategoryMapping } from "src/specs/helpers";
import type { ExampleGroup } from "src/specs/types";

export const hubmapExampleGroups: ExampleGroup[] = [
  {
    name: 'Datasets',
    description: 'The following section explores metadata from HuBMAP datasets.',
    examples: [
      {
        name: 'Datasets by Organ',
        thumbnail: thumbnails.datasets.by_organ,
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
        thumbnail: thumbnails.datasets.by_assay_and_organ_bar,
        spec: {
          source: { name: 'datasets', source: links.datasets },
          transformation: [
            { derive: { organ: `d.origin_samples_unique_mapped_organs` } },
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
              { encoding: 'x', field: 'count', type: 'quantitative' },
              { encoding: 'y', field: 'organ', type: 'nominal' },
              { encoding: 'color', field: 'assay_category', type: 'nominal' },
            ],
          },
        },
      },
      {
        name: 'Datasets Heatmap by Organ and Assay',
        thumbnail: thumbnails.datasets.by_assay_and_organ_heatmap,
        spec: {
          source: { name: 'datasets', source: links.datasets },
          transformation: [
            { derive: { organ: `d.origin_samples_unique_mapped_organs` } },
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
                { encoding: 'color',
                  field: 'count',
                  type: 'quantitative',
                  range: [
                    "#eafab9",
                    "#528aeb"
                  ], 
                },
                { encoding: 'x', field: 'organ', type: 'nominal' },
                { encoding: 'y', field: 'assay_category', type: 'nominal' },
              ],
            },
            {
              mark: 'text',
              mapping: [
                { encoding: 'text', field: 'count', type: 'quantitative' },
                { encoding: 'x', field: 'organ', type: 'nominal' },
                { encoding: 'y', field: 'assay_category', type: 'nominal' },
              ],
            },
          ],
        },
      },
    ],
  },
  {
    name: 'Donors',
    description: 'The following section explores metadata from HuBMAP donors.',
    examples: [
      {
        name: 'Table',
        description: 'This is a plain table of raw metadata for every available donor, with no transformations applied. All that is provided is the source.',
        thumbnail: thumbnails.donors.table,
        spec: {
          source: { name: 'donors', source: links.donors },
        },
      },
      {
        name: 'Visual Table',
        description: 'This is a plain table of raw metadata for every available donor, with no transformations applied. All that is provided is the source.',
        thumbnail: thumbnails.donors.table,
        spec: {
          source: { name: 'donors', source: links.donors },
          representation: {
            mark: 'row',
            mapping: [
              {
                field: 'hubmap_id',
                encoding: 'text',
                mark: 'text',
                type: 'quantitative',
              },
              ...getColorCategoryMapping('sex'),
              ...getColorCategoryMapping('abo_blood_group_system'),
              ...getColorBarMapping('age_value'),
              ...getColorBarMapping('body_mass_index_value'),
              ...getColorBarMapping('weight_value'),
              ...getColorBarMapping('height_value'),
              ...getColorCategoryMapping('group_name'),
              ...getColorCategoryMapping('race'),
            ],
          },
        },
      },
      {
        name: 'Donors by Sex',
        description: 'This simple bar chart visualization uses the above metadata to compare the number of available donors of each sex via a rollup operation.',
        thumbnail: thumbnails.donors.by_sex,
        spec: {
          source: { name: 'donors', source: links.donors },
          transformation: [
            { groupby: 'sex' },
            { rollup: { count: { op: 'count' } } },
          ],
          representation: {
            mark: 'bar',
            mapping: [
              { encoding: 'x', field: 'sex', type: 'nominal' },
              { encoding: 'y', field: 'count', type: 'quantitative' },
            ],
          },
        },
      },
      {
        name: 'Donors by Race and Sex',
        description: 'This is a slightly more complex stacked bar chart showing the number of available donors of each race, with each bar divided to show the ratio of sexes within that group.',
        thumbnail: thumbnails.donors.by_race_and_sex,
        spec: {
          source: { name: 'donors', source: links.donors },
          transformation: [
            { groupby: ['sex', 'race'] },
            { rollup: { count: { op: 'count' } } },
          ],
          representation: {
            mark: 'bar',
            mapping: [
              { encoding: 'x', field: 'race', type: 'nominal' },
              { encoding: 'y', field: 'count', type: 'quantitative' },
              { encoding: 'color', field: 'sex', type: 'nominal' },
            ],
          },
        },
      },
      {
        name: 'Donors by Age Group and Sex',
        thumbnail: thumbnails.donors.by_age_and_sex,
        spec: {
          source: { name: 'donors', source: links.donors },
          transformation: [
            {
              derive: {
                age_group: `
                  d.age_value === undefined || d.age_value === "" ?
                    "Unknown" :
                    (Math.floor(+d.age_value / 10) * 10) + "s"
                `,
              },
            },
            { groupby: ['sex', 'age_group'] },
            { rollup: { count: { op: 'count' } } },
          ],
          representation: {
            mark: 'bar',
            mapping: [
              { encoding: 'x', field: 'age_group', type: 'nominal' },
              { encoding: 'y', field: 'count', type: 'quantitative' },
              { encoding: 'color', field: 'sex', type: 'nominal' },
            ],
          },
        },
      },
    ],
  },
  {
    name: 'Samples',
    description: 'The following section explores metadata from HuBMAP samples.',
    examples: [
      {
        name: 'Samples by Organ',
        thumbnail: thumbnails.samples.by_organ,
        spec: {
          source: { name: 'samples', source: links.samples },
          transformation: [
            {
              derive: { organ: `d.origin_samples_unique_mapped_organs` },
            },
            { groupby: ['organ'] },
            { rollup: { count: { op: 'count' } } },
            { orderby: { field: 'organ', order: 'desc' } },
          ],
          representation: [
            {
              mark: 'row',
              mapping: [
                { mark: 'text', encoding: 'text', field: 'organ', type: 'nominal' },
                { mark: 'text', encoding: 'text', field: 'count', type: 'quantitative' },
              ],
            },
          ],
        },
      },
    ],
  },
];
