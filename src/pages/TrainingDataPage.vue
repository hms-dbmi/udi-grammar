<script setup lang="ts">
import ParserComponent from 'src/components/ParserComponent.vue';
import { ref, computed } from 'vue';
import { useEditorStore } from 'src/stores/EditorStore';
const editorStore = useEditorStore();
import { useTrainingStore } from 'src/stores/TrainingStore';
import { isEqual } from 'lodash';
const trainingStore = useTrainingStore();

const trainingData = ref<TrainingData[]>();

// const index = ref<number>(0);

function prev() {
  trainingStore.index = trainingStore.index - 1;
  if (trainingStore.index < 0) {
    trainingStore.index = trainingData.value
      ? trainingData.value.length - 1
      : 0;
  }
}

function next() {
  trainingStore.index = trainingStore.index + 1;
  if (trainingData.value && trainingStore.index >= trainingData.value.length) {
    trainingStore.index = 0;
  }
}
function prevTemplate() {
  if (!trainingData.value || !currrentExample.value) {
    return;
  }
  const currentTemplate = currrentExample.value.spec_template;
  const currentConstraints = currrentExample.value.constraints;

  while (
    currentTemplate == currrentExample.value.spec_template &&
    isEqual(currentConstraints, currrentExample.value.constraints)
  ) {
    prev();
  }
}

function nextTemplate() {
  if (!trainingData.value || !currrentExample.value) {
    return;
  }
  const currentTemplate = currrentExample.value.spec_template;
  const currentConstraints = currrentExample.value.constraints;
  while (
    currentTemplate == currrentExample.value.spec_template &&
    isEqual(currentConstraints, currrentExample.value.constraints)
  ) {
    next();
  }
}

const currrentExample = computed<TrainingData | null>(() => {
  if (!trainingData.value) {
    return null;
  }
  return trainingData.value[trainingStore.index] ?? null;
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

function prettyPrintJson(json?: string): string {
  if (!json) {
    return '';
  }
  return JSON.stringify(JSON.parse(json), null, 2);
}
</script>
<template>
  <q-drawer v-model="trainingStore.leftDrawerOpen" bordered :width="400">
    <q-list separator>
      <q-item>
        <q-item-section>
          <q-item-label>{{ currrentExample?.query_type }}</q-item-label>
          <q-item-label caption>query_type</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label>{{ currrentExample?.creation_method }}</q-item-label>
          <q-item-label caption>creation_method</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label>{{ currrentExample?.query_template }}</q-item-label>
          <q-item-label caption>query_template</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label>{{ currrentExample?.constraints }}</q-item-label>
          <q-item-label caption>constraints</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label>{{ currrentExample?.dataset_schema }}</q-item-label>
          <q-item-label caption>dataset_schema</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label>{{ currrentExample?.query_base }}</q-item-label>
          <q-item-label caption>query_base</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label>{{ currrentExample?.query }}</q-item-label>
          <q-item-label caption>query</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label>{{ currrentExample?.expertise }}</q-item-label>
          <q-item-label caption>expertise</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label>{{ currrentExample?.formality }}</q-item-label>
          <q-item-label caption>formality</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label class="json-container">{{
            prettyPrintJson(currrentExample?.spec_template)
          }}</q-item-label>
          <q-item-label caption>spec_template</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label class="json-container">{{
            prettyPrintJson(currrentExample?.spec)
          }}</q-item-label>
          <q-item-label caption>spec</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-drawer>
  <q-page class="column items-center justify-start q-ma-md">
    <q-toolbar class="text-primary">
      <q-btn
        class="q-mr-lg"
        @click="trainingStore.toggleDrawer"
        flat
        round
        dense
        icon="menu"
      />
      <span class="q-mr-md"
        >{{ trainingStore.index + 1 }} / {{ trainingData?.length ?? 0 }}</span
      >
      <q-btn @click="prev" flat label="Prev" />
      <q-btn @click="next" flat label="Next" />
      <q-btn @click="prevTemplate" flat label="Prev Template" />
      <q-btn @click="nextTemplate" flat label="Next Template" />
      <q-btn
        v-if="validSpec"
        :to="editorStore.getUrlWithSpec(spec)"
        flat
        label="Open in Editor"
      />
    </q-toolbar>
    <div class="q-mt-lg q-ml-lg q-mr-lg">
      <template v-if="currrentExample">
        <p class="text-h5">
          {{ currrentExample.query }}
        </p>
        <parser-component v-if="validSpec" :spec="spec"></parser-component>
      </template>
    </div>
  </q-page>
</template>

<style scoped>
.json-container {
  white-space: pre-wrap;
  font-family: monospace;
}
</style>
