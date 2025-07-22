<template>
  <q-page class="column items-center justify-start q-ma-md">
    <UDIVis :spec="spec" class="q-mb-md"></UDIVis>
    <div class="text-column q-mt-lg q-ml-lg q-mr-lg">
      <p class="text-h5">
        The
        <span class="text-primary text-bold"
          >Universal Discovery Interface</span
        >
        is an active research project that aims to improve biomedical data
        portal interfaces. An essential component is the
        <span class="text-primary text-bold">visualization grammar</span>
        which can be used to generate many different visualizations.
      </p>
      <p class="text-body1">
        The grammar uses principles from
        <a href="https://link.springer.com/book/10.1007/0-387-28695-0"
          >The Grammar of Graphics</a
        >
        which is used in popular visualization libraries like
        <a href="https://vega.github.io/vega-lite/">Vega-Lite</a> and
        <a href="https://ggplot2.tidyverse.org/">ggplot2</a>. See
        <a href="#/Examples">examples</a> of visualizations that can be
        generated using the grammar or <a href="#/Editor">try it online</a>!
      </p>
      <p class="text-body1">
        The grammar includes three high-level sections. The
        <span class="snippet">source</span> defines the tabular data sources.
        The optional <span class="snippet">transformation</span> field provides
        flexibility when working with source data. The
        <span class="snippet">representation</span> maps fields in the
        transformed data to visual encodings.
      </p>
      <q-img src="grammar_explanation_figure.png"></q-img>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import UDIVis from 'src/components/UDIVis.vue';

const spec = {
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
        sex_count: { op: 'count' },
      },
    },
  ],
  representation: {
    mark: 'bar',
    mapping: [
      { encoding: 'x', field: 'sex', type: 'nominal' },
      { encoding: 'y', field: 'sex_count', type: 'quantitative' },
    ],
    select: {
      name: 'sex-select',
      how: {
        type: 'point',
      },
      fields: 'sex',
    },
  },
};
const signalKeys = [];
// import { ref } from 'vue';
</script>
<style scoped>
.text-column {
  max-width: 800px;
}

.snippet {
  background-color: #eff0f5;
  padding: 0 4px;
  border-radius: 4px;
  margin: 0 4px;
  font-family: monospace;
  color: #a31515;
}
</style>
