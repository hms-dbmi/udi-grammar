<script setup lang="ts">
import ParserComponent from 'src/components/ParserComponent.vue';
import { ref, computed, shallowRef } from 'vue';
import { useRoute } from 'vue-router';
import { decompressFromEncodedURIComponent } from 'lz-string';

const MONACO_EDITOR_OPTIONS = {
  automaticLayout: true,
  formatOnType: true,
  formatOnPaste: true,
};

// "$schema": "https://raw.githubusercontent.com/hms-dbmi/udi-grammar/refs/heads/main/UDIGrammarSchema.json",

const code = ref(`{
  "source": {
    "name": "donors",
    "source": "./data/example_donors.csv"
  },
  "representation": {
    "mark": "point",
    "mapping": [
      { "encoding": "y", "field": "height", "type": "quantitative" },
      { "encoding": "x", "field": "weight", "type": "quantitative" }
    ]
  }
}`);

const route = useRoute();
if (route.query.spec) {
  try {
    code.value = decompressFromEncodedURIComponent(route.query.spec as string);
    // formatCode();
  } catch (error) {
    console.error('Failed to decode spec from URL parameter:', error);
  }
}

const editorRef = shallowRef();

// your action
// function formatCode() {
//   editorRef.value?.getAction('editor.action.formatDocument').run();
// }

const splitterModel = ref(50);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleMount(editor: any) {
  editorRef.value = editor;
}

const spec = computed(() => {
  return JSON.parse(code.value);
});

const errorMessage = computed<string>(() => {
  try {
    JSON.parse(code.value);
    return '';
  } catch (error: unknown) {
    if (error instanceof Error) {
      return error.message;
    } else {
      return 'Error parsing specification.';
    }
  }
});

const validSpec = computed(() => {
  try {
    JSON.parse(code.value);
    return true;
  } catch (_error) {
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
        <div v-else>{{ errorMessage }}</div>
      </template>
    </q-splitter>
  </q-page>
</template>
<style scoped>
.flex-grow-1 {
  flex-grow: 1;
}
</style>
