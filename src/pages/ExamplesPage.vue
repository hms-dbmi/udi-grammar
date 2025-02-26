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
        name: 'Simple Bar Chart',
        thumbnail: 'https://via.placeholder.com/50',
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
  return `./#/Editor?spec=${compressed}`;
}
</script>
<template>
  <q-page class="row items-center justify-evenly">
    <template v-for="group in exampleGroups" :key="group.name">
      <div>
        <h3>{{ group.name }}</h3>
        <ul>
          <li
            v-for="example in group.examples"
            :key="example.name"
            style="cursor: pointer"
          >
            <a :href="getUrlWithSpec(example.spec)">{{ example.name }}</a>
            <img :src="example.thumbnail" style="width: 50px" />
          </li>
        </ul>
      </div>
    </template>
  </q-page>
</template>
