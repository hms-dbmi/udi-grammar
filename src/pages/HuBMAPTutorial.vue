<script setup lang="ts">
import UDIVis from 'src/components/UDIVis.vue';
import { tutorialExamples } from 'src/specs/TutorialSpecs';

</script>

<template>
  <q-page class="column items-center justify-start q-ma-md">
    <div class="text-column q-mt-lg q-ml-lg q-mr-lg">
      <p class="text-h4 text-primary text-bold">
        HuBMAP Visualization Tutorial
      </p>
      <p class="text-body1 q-mb-lg">
        This tutorial demonstrates how the UDI grammar can be used to create a heatmap visualization
        showing HuBMAP dataset counts by source organ and assay type.
      </p>

      <div
        v-for="(example, exampleIndex) in tutorialExamples"
        :key="exampleIndex"
        class="q-mb-xl full-width"
      >
      
        <!-- Example Header -->
        <div class="text-h5 text-bold text-primary q-mb-sm">
          {{ example.name }}
        </div>
        <div class="text-body1 q-mb-md">
          {{ example.description }}
        </div>

        <!-- Visualization -->
        <div class="col-12 col-md-6">
          <q-card flat bordered class="q-pa-md viz-container full-height">
            <UDIVis :spec="example.spec" />
          </q-card>
        </div>

          <!-- Spec / Code panel -->
          <div class="col-12 col-md-6">
            <q-card flat bordered class="q-pa-md bg-grey-1 full-height">
              <pre style="max-height: 300px; overflow: auto;">
        {{ JSON.stringify(example.spec, null, 2) }}
              </pre>
            </q-card>
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

.full-height {
  height: 100%;
}

.viz-container {
  width: 100%;
  min-height: 300px;
}
</style>
