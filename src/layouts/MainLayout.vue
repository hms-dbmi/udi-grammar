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
        <q-tabs v-model="tab" shrink inline-label dense>
          <q-route-tab
            no-caps
            to="/"
            label=" Universal Discovery Interface"
            icon="home"
          />
          <q-route-tab no-caps to="/Examples" label="Examples" />
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

    <!-- <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Essential Links </q-item-label>

        <EssentialLink
          v-for="link in linksList"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer> -->

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
// import { ref } from 'vue';
</script>
