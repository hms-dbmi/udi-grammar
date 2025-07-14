<script setup lang="ts">
import UDIVis from 'src/components/UDIVis.vue';
import { hubmapExampleGroups } from 'src/specs/HuBMAPSpecs';
</script>

<template>
  <q-page class="column items-center justify-start q-ma-md">
    <div class="text-column q-mt-lg q-ml-lg q-mr-lg">
      <p class="text-h5 text-primary text-bold">
          HuBMAP Demo Visualizations
      </p>
      <p class="text-body1">
        The following visualizations use metadata endpoints from the 
        <a href="https://portal.hubmapconsortium.org/apis">HuBMAP Data Portal</a>
        to demonstrate how the UDI grammar can be used in collaboration
        with projects like HuBMAP.
      </p>
    <div
      v-for="(group, groupIndex) in hubmapExampleGroups"
      :key="groupIndex"
      class="q-mb-xl full-width"
    >
      <!-- Entity heading -->
      <div class="text-h5 text-bold text-primary q-mb-md">
        {{ group.name }}
      </div>

      <!-- Entity description -->
      <div class="text-body1 q-mb-md">
        {{ group.description }}
      </div>

      <q-separator class="q-my-md" />

      <!-- Example visualizations -->
      <div
        v-for="(example, exampleIndex) in group.examples"
        :key="exampleIndex"
        class="q-mb-xl full-width"
      >
        <!-- Visualization heading -->
        <div class="text-subtitle1 text-bold q-mb-sm">
          {{ example.name }}
        </div>

        <!-- Visualization description -->
        <div class="text-subtitle1 q-mb-sm">
          {{ example.description }}
        </div>

        <!-- Visualization rendering -->
        <div class="viz-container">
          <UDIVis :spec="example.spec" />
        </div>

        <q-separator class="q-my-md" />
      </div>
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
