<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';

export interface ParserProps {
  blarg: string;
}

const props = defineProps<ParserProps>();
</script>

<template>
  <div>TODO: Take in grammar and build components</div>
  <div>{{ props.blarg }}</div>
</template>

<style scoped lang="scss"></style>
