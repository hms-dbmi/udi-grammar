<script setup lang="ts">
// import { ref } from 'vue';
import type { UDIGrammar } from 'src/components/GrammarTypes';
import { useEditorStore } from 'src/stores/EditorStore';

const editorStore = useEditorStore();

interface ExampleGroup {
  name: string;
  examples: Example[];
}

interface Example {
  name: string;
  thumbnail: string;
  spec: UDIGrammar;
}

const exampleGroups: ExampleGroup[] = [
  {
    name: 'Tabular Charts',
    examples: [
      {
        name: 'Basic Table',
        thumbnail: './example_thumbnails/tables/basic_table.png',
        spec: {
          source: [
            {
              name: 'samples',
              source: './data/example_samples.csv',
            },
          ],
          representation: [
            {
              mark: 'row',
              mapping: [
                {
                  mark: 'text',
                  encoding: 'text',
                  field: '*',
                  type: 'nominal',
                },
              ],
            },
          ],
        },
      },

      {
        name: 'Visual Table',
        thumbnail: './example_thumbnails/tables/visual_table.png',
        spec: {
          source: [
            {
              name: 'samples',
              source: './data/example_samples.csv',
            },
          ],
          representation: [
            {
              mark: 'row',
              mapping: [
                {
                  mark: 'rect',
                  encoding: 'color',
                  field: 'organ',
                  type: 'nominal',
                },
                {
                  mark: 'rect',
                  encoding: 'color',
                  field: 'organ_condition',
                  type: 'nominal',
                },
                {
                  mark: 'bar',
                  encoding: 'x',
                  field: 'weight',
                  type: 'quantitative',
                },
                {
                  mark: 'rect',
                  encoding: 'color',
                  field: 'sample_category',
                  type: 'nominal',
                },
                {
                  mark: 'text',
                  encoding: 'text',
                  field: '*',
                  type: 'nominal',
                },
              ],
            },
          ],
        },
      },
      {
        name: 'Multiple Fields → One Column',
        thumbnail: './example_thumbnails/tables/multiple_fields_one_column.png',
        spec: {
          source: [
            {
              name: 'donors',
              source: './data/example_donors.csv',
            },
          ],
          transformation: [{ orderby: 'height' }],
          representation: [
            {
              mark: 'row',
              mapping: [
                {
                  column: 'Multiple Fields',
                  mark: 'line',
                  encoding: 'color',
                  field: 'sex',
                  type: 'nominal',
                },
                {
                  column: 'Multiple Fields',
                  mark: 'point',
                  encoding: 'x',
                  field: 'height',
                  type: 'quantitative',
                },
                {
                  column: 'Multiple Fields',
                  mark: 'point',
                  encoding: 'size',
                  field: 'weight',
                  type: 'quantitative',
                },
                {
                  column: 'height (circle position)',
                  mark: 'text',
                  encoding: 'text',
                  field: 'height',
                  type: 'nominal',
                },
                {
                  column: 'height (circle position)',
                  mark: 'text',
                  encoding: 'x',
                  field: 'height',
                  type: 'quantitative',
                },
                {
                  column: 'weight (circle size)',
                  mark: 'text',
                  encoding: 'text',
                  field: 'weight',
                  type: 'quantitative',
                },
                {
                  column: 'weight (circle size)',
                  mark: 'point',
                  encoding: 'size',
                  field: 'weight',
                  type: 'quantitative',
                },
                {
                  column: 'sex (circle size)',
                  mark: 'bar',
                  encoding: 'color',
                  field: 'sex',
                  type: 'nominal',
                },
                {
                  column: 'sex (circle size)',
                  mark: 'text',
                  encoding: 'text',
                  field: 'sex',
                  type: 'nominal',
                },
              ],
            },
          ],
        },
      },
    ],
  },
  {
    name: 'Bar Charts',
    examples: [
      {
        name: 'Total Record Count',
        thumbnail: './example_thumbnails/bar_charts/total_record_count.png',
        spec: {
          source: {
            name: 'donors',
            source: './data/example_donors.csv',
          },
          transformation: [
            {
              rollup: {
                count: { op: 'count' },
              },
            },
          ],
          representation: {
            mark: 'bar',
            mapping: { encoding: 'x', field: 'count', type: 'quantitative' },
          },
        },
      },
      {
        name: 'Count by Category',
        thumbnail: './example_thumbnails/bar_charts/count_by_category.png',
        spec: {
          source: {
            name: 'donors',
            source: './data/example_donors.csv',
          },
          transformation: [
            {
              groupby: 'sex',
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
              { encoding: 'x', field: 'sex', type: 'nominal' },
              { encoding: 'y', field: 'count', type: 'quantitative' },
            ],
          },
        },
      },
      {
        name: 'Aggregate by Category',
        thumbnail: './example_thumbnails/bar_charts/aggregate_by_cateogory.png',
        spec: {
          source: {
            name: 'donors',
            source: './data/example_donors.csv',
          },
          transformation: [
            {
              groupby: 'sex',
            },
            {
              rollup: {
                'average weight': { op: 'mean', field: 'weight' },
              },
            },
          ],
          representation: {
            mark: 'bar',
            mapping: [
              { encoding: 'x', field: 'sex', type: 'nominal' },
              { encoding: 'y', field: 'average weight', type: 'quantitative' },
            ],
          },
        },
      },
      {
        name: 'Combining Data Sources',
        thumbnail: './example_thumbnails/bar_charts/combining_data_sources.png',
        spec: {
          source: [
            {
              name: 'donors',
              source: './data/example_donors.csv',
            },
            {
              name: 'samples',
              source: './data/example_samples.csv',
            },
          ],
          transformation: [
            {
              in: ['donors', 'samples'],
              join: {
                on: ['id', 'donor_id'],
              },
              out: 'donor_sample_combined',
            },
            {
              groupby: 'sex',
            },
            {
              rollup: {
                'sample count': { op: 'count' },
              },
            },
          ],
          representation: {
            mark: 'bar',
            mapping: [
              { encoding: 'x', field: 'sex', type: 'nominal' },
              { encoding: 'y', field: 'sample count', type: 'quantitative' },
            ],
          },
        },
      },
      {
        name: 'Single Stacked Bar Chart',
        thumbnail:
          './example_thumbnails/bar_charts/single_stacked_bar_chart.png',
        spec: {
          source: {
            name: 'samples',
            source: './data/example_samples.csv',
          },
          transformation: [
            { groupby: 'organ' },
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
              { encoding: 'color', field: 'organ', type: 'nominal' },
            ],
          },
        },
      },
      {
        name: 'Single Stacked Bar Chart (relative)',
        thumbnail:
          './example_thumbnails/bar_charts/single_stacked_bar_chart_relative.png',
        spec: {
          source: {
            name: 'samples',
            source: './data/example_samples.csv',
          },
          transformation: [
            { groupby: 'organ' },
            {
              rollup: {
                frequency: { op: 'frequency' },
              },
            },
          ],
          representation: {
            mark: 'bar',
            mapping: [
              { encoding: 'x', field: 'frequency', type: 'quantitative' },
              { encoding: 'color', field: 'organ', type: 'nominal' },
            ],
          },
        },
      },
      {
        name: 'Multiple Stacked Bar Charts',
        thumbnail:
          './example_thumbnails/bar_charts/multiple_stacked_bar_charts.png',
        spec: {
          source: {
            name: 'samples',
            source: './data/example_samples.csv',
          },
          transformation: [
            { groupby: ['organ', 'organ_condition'] },
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
              { encoding: 'color', field: 'organ_condition', type: 'nominal' },
            ],
          },
        },
      },
      {
        name: 'Multiple Stacked Bar Charts (relative)',
        thumbnail:
          './example_thumbnails/bar_charts/multiple_stacked_bar_charts_relative.png',
        spec: {
          source: {
            name: 'samples',
            source: './data/example_samples.csv',
          },
          transformation: [
            {
              groupby: 'organ',
              out: 'groupCounts',
            },
            {
              rollup: {
                organ_count: { op: 'count' },
              },
            },
            {
              in: 'samples',
              groupby: ['organ', 'organ_condition'],
            },
            {
              rollup: {
                organ_and_condition_count: { op: 'count' },
              },
            },
            {
              in: ['samples', 'groupCounts'],
              join: { on: 'organ' },
              out: 'datasets',
            },
            {
              derive: {
                frequency: 'd.organ_and_condition_count / d.organ_count',
              },
            },
          ],
          representation: {
            mark: 'bar',
            mapping: [
              { encoding: 'x', field: 'frequency', type: 'quantitative' },
              { encoding: 'y', field: 'organ', type: 'nominal' },
              { encoding: 'color', field: 'organ_condition', type: 'nominal' },
            ],
          },
        },
      },
    ],
  },
  {
    name: 'Circular Charts',
    examples: [
      {
        name: 'Pie Chart',
        thumbnail: './example_thumbnails/circular_charts/pie_chart.png',
        spec: {
          source: [
            {
              name: 'samples',
              source: './data/example_samples.csv',
            },
          ],
          transformation: [
            {
              groupby: 'organ',
            },
            {
              rollup: {
                frequency: {
                  op: 'frequency',
                },
              },
            },
          ],
          representation: [
            {
              mark: 'arc',
              mapping: [
                {
                  encoding: 'color',
                  field: 'organ',
                  type: 'nominal',
                },
                {
                  encoding: 'theta',
                  field: 'frequency',
                  type: 'quantitative',
                },
              ],
            },
          ],
        },
      },
      {
        name: 'Donut Chart',
        thumbnail: './example_thumbnails/circular_charts/donut_chart.png',
        spec: {
          source: [
            {
              name: 'samples',
              source: './data/example_samples.csv',
            },
          ],
          transformation: [
            {
              groupby: 'organ',
            },
            {
              rollup: {
                frequency: {
                  op: 'frequency',
                },
              },
            },
          ],
          representation: [
            {
              mark: 'arc',
              mapping: [
                {
                  encoding: 'color',
                  field: 'organ',
                  type: 'nominal',
                },
                {
                  encoding: 'theta',
                  field: 'frequency',
                  type: 'quantitative',
                },
                {
                  encoding: 'radius2',
                  value: 60,
                },
              ],
            },
          ],
        },
      },
    ],
  },
  {
    name: 'Scatterplots',
    examples: [
      {
        name: 'Basic Scatter Plot',
        thumbnail: './example_thumbnails/scatterplots/scatterplot.png',
        spec: {
          source: {
            name: 'donors',
            source: './data/example_donors.csv',
          },
          representation: {
            mark: 'point',
            mapping: [
              { encoding: 'y', field: 'height', type: 'quantitative' },
              { encoding: 'x', field: 'weight', type: 'quantitative' },
            ],
          },
        },
      },
      {
        name: 'Scatter Plot with Categories',
        thumbnail:
          './example_thumbnails/scatterplots/scatterplot_with_categories.png',
        spec: {
          source: {
            name: 'donors',
            source: './data/example_donors.csv',
          },
          representation: {
            mark: 'point',
            mapping: [
              { encoding: 'y', field: 'height', type: 'quantitative' },
              { encoding: 'x', field: 'weight', type: 'quantitative' },
              { encoding: 'color', field: 'sex', type: 'nominal' },
              { encoding: 'shape', field: 'sex', type: 'nominal' },
            ],
          },
        },
      },
      {
        name: 'Bubble Plot',
        thumbnail: './example_thumbnails/scatterplots/bubble_plot.png',
        spec: {
          source: {
            name: 'donors',
            source: './data/example_donors.csv',
          },
          representation: {
            mark: 'point',
            mapping: [
              { encoding: 'y', field: 'height', type: 'quantitative' },
              { encoding: 'x', field: 'weight', type: 'quantitative' },
              { encoding: 'size', field: 'age', type: 'quantitative' },
            ],
          },
        },
      },
    ],
  },
  {
    name: 'Heatmaps',
    examples: [
      {
        name: 'Heatmap of Categories',
        thumbnail: './example_thumbnails/heatmaps/heatmap_of_categories.png',
        spec: {
          source: {
            name: 'samples',
            source: './data/example_samples.csv',
          },
          transformation: [
            {
              groupby: ['organ', 'organ_condition'],
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
                field: 'organ_condition',
                type: 'nominal',
              },
              {
                encoding: 'y',
                field: 'organ',
                type: 'nominal',
              },
              {
                encoding: 'color',
                field: 'count',
                type: 'quantitative',
              },
            ],
          },
        },
      },
    ],
  },
  {
    name: 'Distribution Plots',
    examples: [
      {
        name: 'Histogram',
        thumbnail: './example_thumbnails/distribution_plots/histogram.png',
        spec: {
          source: {
            name: 'penguins',
            source: './data/penguins.csv',
          },
          transformation: [
            {
              binby: {
                field: 'bill_length_mm',
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
                count: {
                  op: 'count',
                },
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
              },
              {
                encoding: 'x2',
                field: 'end',
                type: 'quantitative',
              },
              {
                encoding: 'y',
                field: 'count',
                type: 'quantitative',
              },
            ],
          },
        },
      },
      {
        name: 'KDE Density Plot',
        thumbnail:
          './example_thumbnails/distribution_plots/kde_density_plot.png',
        spec: {
          source: {
            name: 'penguins',
            source: './data/penguins.csv',
          },
          transformation: [
            {
              kde: {
                field: 'bill_length_mm',
                samples: 100,
                output: {
                  sample: 'bill_length_mm',
                  density: 'density',
                },
              },
            },
          ],
          representation: {
            mark: 'area',
            mapping: [
              {
                encoding: 'x',
                field: 'bill_length_mm',
                type: 'quantitative',
              },
              {
                encoding: 'y',
                field: 'density',
                type: 'quantitative',
              },
            ],
          },
        },
      },
      {
        name: 'KDE Density Plot (grouped)',
        thumbnail:
          './example_thumbnails/distribution_plots/kde_density_plot_grouped.png',
        spec: {
          source: {
            name: 'penguins',
            source: './data/penguins.csv',
          },
          transformation: [
            {
              groupby: 'species',
            },
            {
              kde: {
                field: 'bill_length_mm',
                samples: 100,
                output: {
                  sample: 'bill_length_mm',
                  density: 'density',
                },
              },
            },
          ],
          representation: [
            {
              mark: 'area',
              mapping: [
                {
                  encoding: 'x',
                  field: 'bill_length_mm',
                  type: 'quantitative',
                },
                {
                  encoding: 'y',
                  field: 'density',
                  type: 'quantitative',
                },
                {
                  encoding: 'color',
                  field: 'species',
                  type: 'nominal',
                },
                { encoding: 'opacity', value: 0.25 },
              ],
            },
            {
              mark: 'line',
              mapping: [
                {
                  encoding: 'x',
                  field: 'bill_length_mm',
                  type: 'quantitative',
                },
                {
                  encoding: 'y',
                  field: 'density',
                  type: 'quantitative',
                },
                {
                  encoding: 'color',
                  field: 'species',
                  type: 'nominal',
                },
              ],
            },
          ],
        },
      },
      {
        name: 'Empirical CDF',
        thumbnail: './example_thumbnails/distribution_plots/empirical_cdf.png',
        spec: {
          source: {
            name: 'penguins',
            source: './data/penguins.csv',
          },
          transformation: [
            {
              orderby: 'bill_length_mm',
            },
            {
              derive: { total: 'count()' },
            },
            {
              derive: {
                percentile: {
                  rolling: {
                    expression: 'count() / d.total',
                  },
                },
              },
            },
          ],
          representation: {
            mark: 'line',
            mapping: [
              {
                encoding: 'x',
                field: 'bill_length_mm',
                type: 'quantitative',
              },
              {
                encoding: 'y',
                field: 'percentile',
                type: 'quantitative',
              },
            ],
          },
        },
      },
      {
        name: 'Empirical CDF (grouped)',
        thumbnail:
          './example_thumbnails/distribution_plots/empirical_cdf_grouped.png',
        spec: {
          source: {
            name: 'penguins',
            source: './data/penguins.csv',
          },
          transformation: [
            {
              orderby: 'bill_length_mm',
            },
            {
              groupby: 'species',
            },
            {
              derive: {
                total: 'count()',
              },
            },
            {
              derive: {
                percentile: {
                  rolling: {
                    expression: 'count() / d.total',
                  },
                },
              },
            },
          ],
          representation: {
            mark: 'line',
            mapping: [
              {
                encoding: 'x',
                field: 'bill_length_mm',
                type: 'quantitative',
              },
              {
                encoding: 'y',
                field: 'percentile',
                type: 'quantitative',
              },
              { encoding: 'color', field: 'species', type: 'nominal' },
            ],
          },
        },
      },
    ],
  },
];
</script>
<template>
  <q-page class="column items-center justify-start q-ma-md">
    <div
      v-for="group in exampleGroups"
      :key="group.name"
      class="column full-width"
    >
      <div class="text-h6 text-primary">{{ group.name }}</div>
      <q-separator class="full-width" />
      <div class="row q-mb-md q-mt-sm">
        <q-card
          v-for="example in group.examples"
          :key="example.name"
          class="q-pa-sm q-ma-sm flex column items-center"
        >
          <!-- <q-img src="https://cdn.quasar.dev/img/parallax2.jpg">
            <div class="absolute-bottom text-subtitle2 text-center">Title</div>
          </q-img> -->

          <q-img
            ratio="1"
            fit="scale-down"
            :src="example.thumbnail"
            class="square"
          >
          </q-img>
          <q-card-actions vertical>
            <q-btn
              color="primary"
              rounded
              no-caps
              icon-right="open_in_new"
              :to="editorStore.getUrlWithSpec(example.spec)"
              :label="example.name"
            ></q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>
<style lang="scss">
.square {
  height: 240px;
  width: 240px;
}
</style>
