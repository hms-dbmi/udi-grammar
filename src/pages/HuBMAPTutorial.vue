<script setup lang="ts">
import UDIVis from 'src/components/UDIVis.vue';
import { tutorialExamples } from 'src/specs/TutorialSpecs';
// import { useEditorStore } from 'src/stores/EditorStore';

// const editorStore = useEditorStore();
</script>

<template>
  <q-page class="column items-center justify-start q-ma-md">
    <div class="text-column q-mt-lg q-ml-lg q-mr-lg">
      <p class="text-h4 text-primary text-bold">
          HuBMAP Visualization Tutorial
      </p>
      <p class="text-body1">
        This tutorial demonstrates how the UDI grammar can be used to create a heatmap visualization
        showing HuBMAP dataset counts by source organ and assay type.
      </p>
    <div
      v-for="(example, exampleIndex) in tutorialExamples"
      :key="exampleIndex"
      class="q-mb-xl full-width"
    >
      <!-- Visualization heading -->
      <div class="text-h5 text-bold text-primary q-mb-md">
        {{ example.name }}
      </div>

      <!-- Visualization description -->
      <div class="text-body1 q-mb-md">
        {{ example.description }}
      </div>

      <!-- Visualization rendering -->
        <div class="viz-container">
          <UDIVis :spec="example.spec" />
        </div>

      <q-separator class="q-my-md" />
    </div>
    </div>
  </q-page>
</template>

<style scoped>
.full-width {
  width: 100%;
}

.viz-container {
  width: 90%;
}
</style>
