<script setup lang="ts">
import { compressToEncodedURIComponent } from 'lz-string';
// import { ref } from 'vue';
import type { UDIGrammar } from '../stores/GrammarTypes';

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
    name: 'Scatter Plots',
    examples: [],
  },
  {
    name: 'Heatmaps',
    examples: [],
  },
  {
    name: 'Histograms',
    examples: [],
  },
  {
    name: 'Line Charts',
    examples: [],
  },
  {
    name: 'Area Charts',
    examples: [],
  },
  {
    name: 'Pie Charts',
    examples: [],
  },
];

function getUrlWithSpec(spec: UDIGrammar): string {
  const stringified = JSON.stringify(spec, null, 2);
  const compressed = compressToEncodedURIComponent(stringified);
  return `/Editor?spec=${compressed}`;
}
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
              :to="getUrlWithSpec(example.spec)"
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
  height: 200px;
  width: 200px;
}
</style>
