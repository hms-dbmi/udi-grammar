// import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type { UDIGrammar } from 'src/components/GrammarTypes';
import { compressToEncodedURIComponent } from 'lz-string';

export const useEditorStore = defineStore('EditorStore', () => {
  function getUrlWithSpec(spec: UDIGrammar): string {
    console.log('getting url');
    const stringified = JSON.stringify(spec, null, 2);
    return getUrlWithCode(stringified);
  }

  function getUrlWithCode(code: string, fullUrl = false): string {
    const compressed = compressToEncodedURIComponent(code);
    const relativePath = `/Editor?spec=${compressed}`;
    if (fullUrl) {
      const baseUrl = window.location.origin;
      const path = window.location.pathname;
      return `${baseUrl}${path}#${relativePath}`;
    }
    return relativePath;
  }

  return { getUrlWithSpec, getUrlWithCode };
});
