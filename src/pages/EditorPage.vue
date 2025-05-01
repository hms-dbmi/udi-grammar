<script setup lang="ts">
import UDIVis from 'src/components/UDIVis.vue';
import { ref, computed, shallowRef } from 'vue';
import { useRoute } from 'vue-router';
import { decompressFromEncodedURIComponent } from 'lz-string';
// import { useQuasar } from 'quasar';
import { useEditorStore } from 'src/stores/EditorStore';
const editorStore = useEditorStore();

// const $q = useQuasar();

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

const showEncodingUrl = ref(false);
const encodedUrl = computed(() => {
  return editorStore.getUrlWithCode(code.value, true);
});

// const clipboardSupported = computed(() => {
//   return navigator.clipboard && navigator.clipboard.writeText;
// });

// function copyToClipboard(): void {
//   const text = 'alsdkjfalskdf';
//   navigator.clipboard.writeText(text);
//   $q.notify({
//     message: `Copied "${text}" to clipboard.`,
//     position: 'bottom',
//     icon: 'content_copy',
//     timeout: 2500,
//   });
// }
</script>
<template>
  <q-toolbar dense flat
    ><q-btn
      dense
      flat
      no-caps
      @click="showEncodingUrl = true"
      icon="share"
      label="Share"
    ></q-btn>
    <q-dialog v-model="showEncodingUrl">
      <q-card style="width: 100%">
        <q-card-section>
          <div class="text-h6">Copy Link To Example</div>
          <q-input
            v-model="encodedUrl"
            readonly
            filled
            class="q-mt-md"
          ></q-input>
        </q-card-section>
        <q-card-actions align="right">
          <!-- <q-btn
            v-if="clipboardSupported"
            flat
            label="Copy"
            @click="copyToClipboard()"
          /> -->
          <q-btn flat label="Close" @click="showEncodingUrl = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-toolbar>
  <q-separator />
  <q-page class="flex row">
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
        <UDIVis v-if="validSpec" :spec="spec"></UDIVis>
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
