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

const thumbnails = {
  donors: {
    table: './data/hubmap_examples/thumbnails/donors/table.png',
    by_sex: './data/hubmap_examples/thumbnails/donors/by-sex.png',
    by_race_and_sex: './data/hubmap_examples/thumbnails/donors/by-race-and-sex.png',
    by_age_and_sex: './data/hubmap_examples/thumbnails/donors/by-age-and-sex.png',
  },
  samples: {
    by_organ: './data/hubmap_examples/thumbnails/samples/by-organ.png',
  },
  datasets: {
    by_organ: './data/hubmap_examples/thumbnails/datasets/by-organ.png',
    by_assay_and_organ_bar: './data/hubmap_examples/thumbnails/datasets/by-assay-and-organ-bar.png',
    by_assay_and_organ_heatmap: './data/hubmap_examples/thumbnails/datasets/by-assay-and-organ-heatmap.png',
  }
}

const exampleGroups: ExampleGroup[] = [
  {
    name: 'Donors',
    examples: [
      {
        name: 'Table',
        thumbnail: thumbnails.donors.table,
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
        thumbnail: thumbnails.donors.by_sex,
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
        thumbnail: thumbnails.donors.by_race_and_sex,
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
        thumbnail: thumbnails.donors.by_age_and_sex,
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
      {
        name: 'Samples by Organ',
        thumbnail: thumbnails.samples.by_organ,
        spec: {
          source: {
            name: 'samples',
            source: links.samples
          },
          transformation: [
            {
              derive: {
                organ: `d.origin_samples_unique_mapped_organs`
              }
            },
            {
              groupby: ['organ']
            },
            {
              rollup: {
                count: { op: 'count' }
              }
            },
            {
              orderby: {
                field: "organ",
                order: "desc"
              }
            },
          ],
          representation: [
            {
              mark: 'row',
              mapping: [
                { mark: 'text', encoding: 'text', field: 'organ', type: 'nominal' },
                { mark: 'text', encoding: 'text', field: 'count', type: 'quantitative' }
              ]
            }
          ]
        }
      }
    ],
  },
  {
    name: 'Datasets',
    examples: [
      {
        name: 'Datasets by Organ',
        thumbnail: thumbnails.datasets.by_organ,
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
            },
            // TODO: why does this not work?
            {
              orderby: {
                field: "organ",
                order: "desc"
              }
            },
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
        thumbnail: thumbnails.datasets.by_assay_and_organ_bar,
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
      },
      {
        name: 'Datasets Heatmap by Organ and Assay',
        thumbnail: thumbnails.datasets.by_assay_and_organ_heatmap,
        spec: {
          source: {
            name: 'datasets',
            source: links.datasets,
          },
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
                {
                  encoding: 'color',
                  field: 'count',
                  type: 'quantitative',
                  // TODO: why does this not work?
                  // domain: ['1', '500'],
                },
                {
                  encoding: 'x',
                  field: 'origin_samples_unique_mapped_organs',
                  type: 'nominal',
                },
                { encoding: 'y', field: 'assay_category', type: 'nominal' },
              ],
            },
            {
              mark: 'text',
              mapping: [
                {
                  encoding: 'text',
                  field: 'count',
                  type: 'quantitative',
                },
                {
                  encoding: 'x',
                  field: 'origin_samples_unique_mapped_organs',
                  type: 'nominal',
                },
                {
                  encoding: 'y',
                  field: 'assay_category',
                  type: 'nominal',
                },
              ],
            },
          ],
        }
      }
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
