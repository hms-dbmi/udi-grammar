<script setup lang="ts">
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
    name: 'Donors',
    examples: [
      {
        name: 'Basic Table',
        thumbnail: './example_thumbnails/tables/basic_table.png',
        spec: {
          source: [
            {
              name: 'donors',
              source: './data/hubmap_examples/hubmap-donors-metadata-2025-07-09_17-17-11.tsv',
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
        name: 'Donors by Sex',
        thumbnail: './example_thumbnails/tables/visual_table.png',
        spec: {
            source: {
            name: "donors",
            source: "./data/hubmap_examples/hubmap-donors-metadata-2025-07-09_17-17-11.tsv"
          },
          transformation: [
            {
              groupby: "sex"
            },
            {
              rollup: {
                count: {
                  op: "count"
                }
              }
            }
          ],
          representation: {
            mark: "bar",
            mapping: [
              {
                encoding: "x",
                field: "sex",
                type: "nominal"
              },
              {
                encoding: "y",
                field: "count",
                type: "quantitative"
              }
            ]
          }
        },
      },
    ],
  },
  {
    name: 'Organs',
    examples: [

    ],
  },
  {
    name: 'Samples',
    examples: [

    ],
  },
  {
    name: 'Datasets',
    examples: [

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
