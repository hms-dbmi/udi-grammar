<template>
  <q-page class="column items-center justify-start q-ma-md">
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
    </div>
  </q-page>
</template>

<script setup lang="ts">
// import { ref } from 'vue';
</script>
<style scoped>
.text-column {
  max-width: 800px;
}
</style>
