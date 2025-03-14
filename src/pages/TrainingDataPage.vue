<script setup lang="ts">
import ParserComponent from 'src/components/ParserComponent.vue';
import { ref, computed } from 'vue';

const trainingData = ref<TrainingData[]>();

const index = ref<number>(0);

function right() {
  index.value = index.value + 1;
  if (trainingData.value && index.value >= trainingData.value.length) {
    index.value = 0;
  }
}

function left() {
  index.value = index.value - 1;
  if (index.value < 0) {
    index.value = trainingData.value ? trainingData.value.length - 1 : 0;
  }
}

const currrentExample = computed<TrainingData | null>(() => {
  if (!trainingData.value) {
    return null;
  }
  return trainingData.value[index.value] ?? null;
});

interface TrainingData {
  query: string;
  spec: string;
  constraints: string;
  creation_method: string;
  dataset_schema: string;
  expertise: number;
  formality: number;
  query_base: string;
  query_template: string;
  query_type: string;
  spec_template: string;
}

fetch('./data/training_data.json')
  .then((response) => response.json())
  .then((data) => {
    console.log('Fetched data:', data);
    trainingData.value = data;
  })
  .catch((error) => {
    console.error('Error fetching data:', error);
  });

const validSpec = computed(() => {
  try {
    JSON.parse(currrentExample.value?.spec ?? '');
    return true;
  } catch (_error) {
    return false;
  }
});

const spec = computed(() => {
  return JSON.parse(currrentExample.value?.spec ?? '');
});
</script>
<template>
  <q-page class="column items-center justify-start q-ma-md">
    <q-toolbar class="text-primary">
      <q-btn flat round dense icon="menu" />
      <span>{{ index + 1 }} / {{ trainingData?.length ?? 0 }}</span>
      <!-- <q-toolbar-title> Toolbar </q-toolbar-title> -->
      <q-btn @click="left" flat label="Prev" />
      <q-btn @click="right" flat label="Next" />
      <q-btn @click="right" flat label="Open in Editor" />
    </q-toolbar>
    <div class="q-mt-lg q-ml-lg q-mr-lg">
      <template v-if="currrentExample">
        <p class="text-h5">
          {{ currrentExample.query }}
        </p>
        <!-- <p class="text-h5">
          {{ spec }}
        </p> -->
        <parser-component v-if="validSpec" :spec="spec"></parser-component>
      </template>
    </div>
  </q-page>
</template>

<style scoped></style>
