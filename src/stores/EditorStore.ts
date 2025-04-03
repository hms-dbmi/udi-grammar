// import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type { UDIGrammar } from 'src/components/GrammarTypes';
import { compressToEncodedURIComponent } from 'lz-string';

export const useEditorStore = defineStore('EditorStore', () => {
  function getUrlWithSpec(spec: UDIGrammar): string {
    console.log('getting url');
    const stringified = JSON.stringify(spec, null, 2);
    const compressed = compressToEncodedURIComponent(stringified);
    return `/Editor?spec=${compressed}`;
  }

  return { getUrlWithSpec };
});
