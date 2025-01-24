<script setup>
import ParserComponent from './ParserComponent.vue';

defineProps({
  msg: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div class="greetings">
    <h1 class="green">{{ msg }}</h1>
    <h3>
      You’ve successfully created a project with
      <a href="https://vitejs.dev/" target="_blank" rel="noopener">Vite</a> +
      <a href="https://vuejs.org/" target="_blank" rel="noopener">Vue 3</a>.
    </h3>
  </div>
  <!-- <ParserComponent
    :spec="{
      dataSource: {
        key: 'penguins',
        source: './data/penguins.csv',
      },
      dataRepresentation: {
        type: 'GoGComponent',
        mark: 'point',
        encoding: {
          x: { source: 'penguins', field: 'bill_length_mm' },
          y: { source: 'penguins', field: 'flipper_length_mm' },
        },
      },
    }"
  ></ParserComponent> -->
  <ParserComponent
    :spec="{
      dataSource: {
        key: 'penguins',
        source: './data/penguins.csv',
      },
      dataTransformations: [
        {
          groupby: 'sex',
        },
        {
          rollup: {
            sex_count: { op: 'count' },
          },
        },
      ],
      dataRepresentation: {
        type: 'GoGComponent',
        mark: 'bar',
        encoding: {
          x: { field: 'sex' },
          y: { field: 'sex_count' },
        },
      },
    }"
  ></ParserComponent>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
