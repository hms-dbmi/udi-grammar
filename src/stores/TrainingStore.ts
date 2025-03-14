import { ref } from 'vue';
import { defineStore } from 'pinia';
// import type { UDIGrammar } from './GrammarTypes';
// import { compressToEncodedURIComponent } from 'lz-string';

export const useTrainingStore = defineStore('TrainingStore', () => {
  const index = ref<number>(0);

  const leftDrawerOpen = ref<boolean>(false);

  function toggleDrawer() {
    leftDrawerOpen.value = !leftDrawerOpen.value;
  }
  return { index, leftDrawerOpen, toggleDrawer };
});
