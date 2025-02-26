<script setup lang="ts">
import ParserComponent from 'src/components/ParserComponent.vue';
import { ref, computed, shallowRef, onMounted, onBeforeMount } from 'vue';

const MONACO_EDITOR_OPTIONS = {
  automaticLayout: true,
  formatOnType: true,
  formatOnPaste: true,
};

// "$schema": "https://raw.githubusercontent.com/hms-dbmi/udi-grammar/refs/heads/main/UDIGrammarSchema.json",
const code = ref(`{
  "source": {
    "name": "donors",
    "source": "./data/donors.csv"
  },
  "representation": {
    "mark": "point",
    "mapping": [
      { "encoding": "y", "field": "height_value", "type": "quantitative" },
      { "encoding": "x", "field": "weight_value", "type": "quantitative" }
    ]
  }
}`);
const editorRef = shallowRef();

// your action
function formatCode() {
  editorRef.value?.getAction('editor.action.formatDocument').run();
}

const splitterModel = ref(50);

function handleMount(editor: any) {
  editorRef.value = editor;
}

const spec = computed(() => {
  return JSON.parse(code.value);
});

const validSpec = computed(() => {
  try {
    JSON.parse(code.value);
    return true;
  } catch (e) {
    return false;
  }
});
</script>
<template>
  <q-page class="flex row">
    <!-- <q-toolbar dense flat><q-btn dense flat>Run</q-btn></q-toolbar> -->
    <q-splitter v-model="splitterModel" class="flex-grow-1 q-mt-lg">
      <template v-slot:before>
        <vue-monaco-editor
          v-model:value="code"
          language="json"
          theme="vs-light"
          :options="MONACO_EDITOR_OPTIONS"
          @mount="handleMount"
        />
      </template>
      <template v-slot:after>
        <parser-component v-if="validSpec" :spec="spec"></parser-component>
      </template>
    </q-splitter>
  </q-page>
</template>
<style scoped>
.flex-grow-1 {
  flex-grow: 1;
}
</style>
