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
      dataSource: [
        {
          key: 'donors',
          source: './data/donors.csv',
        },
        {
          key: 'datasets',
          source: './data/datasets.csv',
        },
      ],
      dataTransformations: [
        {
          in: ['donors', 'datasets'],
          join: {
            on: ['hubmap_id', 'donor.hubmap_id'],
          },
          out: 'donor_dataset_combined',
        },
        {
          in: 'donor_dataset_combined',
          groupby: 'sex',
          out: 'donor_dataset_combined',
        },
        {
          in: 'donor_dataset_combined',
          rollup: {
            datasets_by_sex: { op: 'count' },
          },
          out: 'donor_dataset_combined',
        },
      ],
      dataRepresentation: {
        type: 'GoGComponent',
        mark: 'bar',
        encoding: {
          x: { field: 'sex' },
          y: { field: 'datasets_by_sex' },
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
