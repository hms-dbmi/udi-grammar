<script setup lang="ts">
import UDIVis from 'src/components/UDIVis.vue';
import { hubmapExampleGroups } from 'src/specs/HuBMAPSpecs';
</script>

<template>
  <q-page class="q-pa-md column items-start">
    <div
      v-for="(group, groupIndex) in hubmapExampleGroups"
      :key="groupIndex"
      class="q-mb-xl full-width"
    >
      <!-- Entity heading -->
      <div class="text-h5 text-bold text-primary q-mb-md">
        {{ group.name }}
      </div>

      <!-- Example visualizations -->
      <div
        v-for="(example, exampleIndex) in group.examples"
        :key="exampleIndex"
        class="q-mb-xl full-width"
      >
        <div class="text-subtitle1 text-weight-medium q-mb-sm">
          {{ example.name }}
        </div>

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
