<script setup lang="ts">
import { VueMonacoEditor } from '@guolao/vue-monaco-editor';

import { ref, shallowRef } from 'vue';

const MONACO_EDITOR_OPTIONS = {
  automaticLayout: true,
  formatOnType: true,
  formatOnPaste: true,
};

const code = ref('// some code...');
const editorRef = shallowRef();
const handleMount = (editor: any) => (editorRef.value = editor);

// your action
function formatCode() {
  editorRef.value?.getAction('editor.action.formatDocument').run();
}

const splitterModel = ref(50);
</script>
<template>
  <q-page class="flex row">
    <q-toolbar dense flat><q-btn dense flat>Run</q-btn></q-toolbar>
    <q-splitter v-model="splitterModel" class="flex-grow-1">
      <template v-slot:before>
        <vue-monaco-editor
          v-model:value="code"
          theme="vs-light"
          :options="MONACO_EDITOR_OPTIONS"
          @mount="handleMount"
        />
      </template>
      <template v-slot:after>
        <div>{{ code }}</div>
      </template>
    </q-splitter>
  </q-page>
</template>
<style scoped>
.flex-grow-1 {
  flex-grow: 1;
}
</style>
