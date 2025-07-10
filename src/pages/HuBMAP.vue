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

const links = {
  donors: './data/hubmap_examples/hubmap-donors-metadata-2025-07-09_17-17-11.tsv',
  datasets: './data/hubmap_examples/hubmap-datasets-metadata-2025-07-10_14-41-55.tsv',
  samples: './data/hubmap_examples/hubmap-samples-metadata-2025-07-10_14-41-59.tsv',
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
              source: links.donors,
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
            source: links.donors,
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
      {
        name: 'Donors by Race and Sex',
        thumbnail: './example_thumbnails/bar_charts/donors_by_race_and_sex.png',
        spec: {
          source: {
            name: "donors",
            source: links.donors,
          },
          transformation: [
            {
              groupby: ["sex", "race"]
            },
            {
              rollup: {
                count: { op: "count" }
              }
            }
          ],
          representation: {
            mark: "bar",
            mapping: [
              { encoding: "x", field: "race", type: "nominal" },
              { encoding: "y", field: "count", type: "quantitative" },
              { encoding: "color", field: "sex", type: "nominal" }
            ]
          }
        }
      },
      {
        name: 'Donors by Age Group and Sex',
        thumbnail: './example_thumbnails/bar_charts/donors_by_age_group_and_sex.png',
        spec: {
          source: {
            name: "donors",
            source: links.donors,
          },
          transformation: [
            {
              derive: {
                age_group: `
                  d.age_value === undefined || d.age_value === "" ?
                    "Unknown" :
                    (Math.floor(+d.age_value / 10) * 10) + "s"
                `
              }
            },
            {
              groupby: ["sex", "age_group"]
            },
            {
              rollup: {
                count: { op: "count" }
              }
            }
          ],
          representation: {
            mark: "bar",
            mapping: [
              { encoding: "x", field: "age_group", type: "nominal" },
              { encoding: "y", field: "count", type: "quantitative" },
              { encoding: "color", field: "sex", type: "nominal" }
            ]
          }
        }
      }
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
      {
        name: 'Datasets by Organ',
        thumbnail: './example_thumbnails/bar_charts/datasets_by_organ.png',
        spec: {
          source: {
            name: "datasets",
            source: links.datasets
          },
          transformation: [
            {
              derive: {
                organ: `d.origin_samples_unique_mapped_organs`
              }
            },
            {
              groupby: ["organ"]
            },
            {
              rollup: {
                count: { op: "count" }
              }
            }
          ],
          representation: {
            mark: "bar",
            mapping: [
              { encoding: "x", field: "organ", type: "nominal" },
              { encoding: "y", field: "count", type: "quantitative" }
            ]
          }
        }
      },
      {
        name: 'Datasets by Assay and Organ',
        thumbnail: './example_thumbnails/bar_charts/datasets_by_organ.png',
        spec: {
          source: {
            name: "datasets",
            source: links.datasets
          },
          transformation: [
            {
              groupby: [
                "origin_samples_unique_mapped_organs",
                "assay_category"
              ]
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
                field: "count",
                type: "quantitative"
              },
              {
                encoding: "y",
                field: "origin_samples_unique_mapped_organs",
                type: "nominal"
              },
              {
                encoding: "color",
                field: "assay_category",
                type: "nominal"
              }
            ]
          }
        }
      }
    ],
  },
  {
    name: 'Visualizations',
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
