<script setup lang="ts">
import { ref, shallowRef, onMounted, onBeforeMount } from 'vue';

const MONACO_EDITOR_OPTIONS = {
  automaticLayout: true,
  formatOnType: true,
  formatOnPaste: true,
};

// "$schema": "https://raw.githubusercontent.com/hms-dbmi/udi-grammar/refs/heads/main/UDIGrammarSchema.json",
const code = ref(`{
   "source": [],
"asdlfasdf0000": 4
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
</script>
<template>
  <q-page class="flex row">
    <q-toolbar dense flat><q-btn dense flat>Run</q-btn></q-toolbar>
    <q-splitter v-model="splitterModel" class="flex-grow-1">
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
