<script setup lang="ts">
import { hubmapExampleGroups } from 'src/specs/HuBMAPSpecs';
import { useEditorStore } from 'src/stores/EditorStore';

const editorStore = useEditorStore();
</script>

<template>
  <q-page class="column items-center justify-start q-ma-md">
    <div
      v-for="group in hubmapExampleGroups"
      :key="group.name"
      class="column full-width"
    >
      <div class="text-h6 text-primary">{{ group.name }}</div>
      <q-separator class="full-width" />
      <div class="row q-mb-md q-mt-sm">
        <q-card
          v-for="example in group.examples"
          :key="example.name"
          class="q-pa-sm q-ma-sm flex column items-center"
        >
          <q-img
            ratio="1"
            fit="scale-down"
            :src="example.thumbnail"
            class="square"
          />
          <q-card-actions vertical>
            <q-btn
              color="primary"
              rounded
              no-caps
              icon-right="open_in_new"
              :to="editorStore.getUrlWithSpec(example.spec)"
              :label="example.name"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.square {
  height: 240px;
  width: 240px;
}
</style>
