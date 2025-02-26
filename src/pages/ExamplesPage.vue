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
        name: 'Simple Bar Chart! 2asdf asdf asdf asdf asdf ',
        thumbnail: './example_thumbnails/bar_charts/simple_bar_chart.png',
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
                mean_mass: { op: 'mean', field: 'weight' },
              },
            },
          ],
          representation: {
            mark: 'bar',
            mapping: [
              { encoding: 'x', field: 'sex', type: 'nominal' },
              { encoding: 'y', field: 'mean_mass', type: 'quantitative' },
            ],
          },
        },
      },
    ],
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
