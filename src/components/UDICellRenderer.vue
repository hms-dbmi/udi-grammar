<script setup lang="ts">
import type { CSSProperties } from 'vue';
import { ref, computed, watch, onMounted, onBeforeMount } from 'vue';
import type { ICellRendererParams } from 'ag-grid-community';
import type { RowMapping, RowMarkOptions } from './GrammarTypes';
import { scaleLinear } from 'd3-scale';
import { scale } from 'vega';
import { map } from 'lodash';

// Define props

interface CellRendererProps {
  params: UDICellRendererParams<any, any, any>;
  // https://www.ag-grid.com/vue-data-grid/component-cell-renderer/#custom-components
}

export interface UDICellRendererParams<TData, TValue, TContext>
  extends ICellRendererParams<TData, TValue, TContext> {
  udiColumnMapping: RowMapping[];
}

const props = defineProps<CellRendererProps>();

const cellValue = ref(null);

onBeforeMount(() => {
  // cellValue.value = props.params.value;
  // console.log(props.params.udiColumnMapping);
  // console.log(props.params);
  // cellValue.value = props.params.column?.getId() + ': ' + props.params.value;
  cellValue.value = props.params.value;
});

const marks = computed(() => {
  if (!props.params.udiColumnMapping) return [];
  const marks = props.params.udiColumnMapping.map((m) => m.mark);
  // console.log({ marks });
  const uniqueMarks = [...new Set(marks)];
  // console.log({ uniqueMarks });
  return uniqueMarks;
});

const markMapping = computed<Partial<Record<RowMarkOptions, RowMapping[]>>>(
  () => {
    if (!props.params.udiColumnMapping) return {};
    const markEndodings = Object.groupBy(
      props.params.udiColumnMapping,
      (m) => m.mark,
    );
    return markEndodings;
  },
);

function getTextValue() {
  if (!props.params.udiColumnMapping) return null;
  const rowMapping = markMapping.value['text'];
  if (!rowMapping) return null;
  const textMapping = rowMapping.find((m) => m.encoding === 'text');
  if (!textMapping) return null;
  return props.params.data[textMapping.field];
}

function getStyle(mark: RowMarkOptions): CSSProperties | null {
  if (!props.params.udiColumnMapping) return null;
  const rowMapping = markMapping.value[mark];
  if (!rowMapping) return null;
  const styleProps: CSSProperties = {};
  for (const mapping of rowMapping) {
    const data = props.params.data[mapping.field];
    switch (mapping.encoding) {
      case 'color': {
        const color = scaleLinear<string, string>()
          .domain([2700, 6300])
          .range(['red', 'blue'])
          .unknown('white')(data);
        if (mapping.mark === 'text') {
          styleProps.color = color;
        } else if (mapping.mark === 'line') {
          styleProps.borderColor = color;
        } else {
          styleProps.backgroundColor = color;
        }
        break;
      }
      case 'x': {
        const xPos = scaleLinear()
          .domain([2700, 6300])
          .range([0, 1])
          .unknown(0)(data);
        const percent = xPos * 100;
        if (mapping.mark === 'text') {
          styleProps.left = `${percent}%`;
          styleProps.transform = `translate(-${percent}%, -50%)`;
        } else if (mapping.mark === 'bar') {
          styleProps.width = `${xPos * 100}%`;
        } else if (mapping.mark === 'point') {
          styleProps.left = `${percent}%`;
        } else if (mapping.mark === 'line') {
          styleProps.height = `100%`;
          styleProps.left = `${percent}%`;
          styleProps.width = 0;
          styleProps.borderTopWidth = 0;
          styleProps.borderBottomWidth = 0;
        }
        break;
      }
      case 'y': {
        const yPos = scaleLinear()
          .domain([2700, 6300])
          .range([0, 1])
          .unknown(0)(data);
        const percent = yPos * 100;
        if (mapping.mark === 'text') {
          styleProps.top = `${100 - percent}%`;
          styleProps.transform = `translateY(-${100 - percent}%)`;
        } else if (mapping.mark === 'bar') {
          styleProps.height = `${yPos * 100}%`;
        } else if (mapping.mark === 'point') {
          styleProps.top = `${100 - percent}%`;
        } else if (mapping.mark === 'line') {
          styleProps.top = `${100 - percent}%`;
          styleProps.borderLeftWidth = 0;
          styleProps.borderRightWidth = 0;
        }
        break;
      }
      case 'yOffset': {
        const yOffsetPos = scaleLinear()
          .domain([2700, 6300])
          .range([0, 1])
          .unknown(0)(data);
        break;
      }
      case 'xOffset': {
        const xOffsetPos = scaleLinear()
          .domain([2700, 6300])
          .range([0, 1])
          .unknown(0)(data);
        break;
      }
      case 'size': {
        const size = scaleLinear()
          .domain([2700, 6300])
          .range([0, 1])
          .unknown(0)(data);
        if (mapping.mark === 'rect') {
          styleProps.width = `${size * 100}%`;
          styleProps.height = `${size * 100}%`;
          styleProps.left = `${(1 - size) * 50}%`;
          styleProps.bottom = `${(1 - size) * 50}%`;
        } else if (mapping.mark === 'point') {
          const rootSize = Math.sqrt(size);
          const maxSize = 30;
          styleProps.width = `${rootSize * maxSize}px`;
          styleProps.height = `${rootSize * maxSize}px`;
        }
        break;
      }
      default: {
        break;
      }
    }

    // if (mapping.encoding === 'color') {
    //   const colorData = props.params.data[mapping.field];
    //   const color = scaleLinear<string, string>()
    //     .domain([2700, 6300])
    //     .range(['red', 'blue'])(colorData);
    //   if (mapping.mark === 'text') {
    //     styleProps.color = color;
    //   } else {
    //     styleProps.backgroundColor = color;
    //   }
    // }
  }
  return styleProps;

  // if (!rowMapping) return null;
  // const styleMapping = rowMapping.find((m) => m.encoding === 'style');
  // if (!styleMapping) return null;
  // const styleData = props.params.data[styleMapping.field];

  // return {
  //   color: getColor(rowMapping),
  //   // backgroundColor: getColor(rowMapping),
  //   // width: '100%',
  //   // height: '100%',
  //   // top: 0,
  //   // left: 0,
  //   // position: 'absolute',
  // };
}
</script>

<template>
  <div class="cell-container">
    <template v-for="mark in marks" :key="mark">
      <div v-if="mark === 'text'" :style="getStyle(mark)" class="overlap text">
        {{ getTextValue() }}
      </div>
      <div
        v-else-if="mark === 'bar'"
        :style="getStyle(mark)"
        class="overlap bar"
      ></div>
      <div
        v-else-if="mark === 'rect'"
        :style="getStyle(mark)"
        class="overlap rect"
      ></div>
      <div
        v-else-if="mark === 'point'"
        :style="getStyle(mark)"
        class="overlap point"
      ></div>
      <div
        v-else-if="mark === 'line'"
        :style="getStyle(mark)"
        class="overlap line"
      ></div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.overlap {
  position: absolute;
}
$default-color: slategray;

$container-margin-top: 5px;
.cell-container {
  width: 100%;
  height: calc(100% - #{$container-margin-top * 2});
  top: $container-margin-top;
  position: relative;
  // outline: solid 1px rgba(0, 128, 0, 10%);
}

.text {
  color: black;
  top: 50%;
  transform: translateY(-50%);
  line-height: 1;
  // top: -$container-margin-top;
  // background-color: bisque;
  // top: 50%;
  // dominant-baseline: middle;
}

.bar {
  background-color: $default-color;
  width: 100%;
  height: 100%;
  bottom: 0;
}

.rect {
  background-color: $default-color;
  width: 100%;
  height: 100%;
  bottom: 0;
}
.point {
  background-color: $default-color;
  // border: solid 3px firebrick;
  border-radius: 50%;
  width: 10px;
  height: 10px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.line {
  border-color: $default-color;
  border-style: solid;
  width: 100%;
  top: 50%;
  border-width: 1px;
  transform: translateY(-50%);
}
</style>
