<script setup lang="ts">
import { ref } from 'vue';

const example1 = ref(`{
  "source": {
    "name": "donors",
    "source": "./data/donors.csv"
  },
  "transformation": [
    {
      "groupby": "sex"
    },
    {
      "rollup": {
        "mean_mass": { "op": "mean", "field": "weight_value" }
      }
    }
  ],
  "representation": {
    "mark": "bar",
    "mapping": [
      { "encoding": "x", "field": "sex", "type": "nominal" },
      { "encoding": "y", "field": "mean_mass", "type": "quantitative" }
    ]
  }
}
`);
</script>
<template>
  <q-page class="row items-center justify-evenly">
    <div>TODO EXAMPLES</div>
    <q-btn>Example 1</q-btn>
    <div>{{ example1 }}</div>
  </q-page>
</template>
