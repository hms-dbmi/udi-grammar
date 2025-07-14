<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="bg-white text-primary">
        <!-- <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        /> -->
        <q-tabs shrink inline-label dense>
          <q-route-tab
            no-caps
            to="/"
            label=" Universal Discovery Interface"
            icon="home"
          />
          <q-route-tab no-caps to="/Examples" label="Examples" />
          <q-route-tab no-caps to="/HuBMAPExamples" label="HuBMAP Examples" />
          <q-route-tab no-caps to="/HuBMAPDemo" label="HuBMAP Demo" />
          <q-route-tab no-caps to="/Editor" label="Editor" />
        </q-tabs>
        <q-space />
        <!-- github -->
        <q-btn
          flat
          dense
          round
          icon="fab fa-github"
          aria-label="GitHub"
          href="https://github.com/hms-dbmi/udi-grammar"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
// import { ref } from 'vue';

// const leftDrawerOpen = ref(true);
</script>
