<script setup lang="ts">
import type { CSSProperties } from 'vue';
import { computed } from 'vue';
import type { ICellRendererParams } from 'ag-grid-community';
import type { RowMarkOptions } from './GrammarTypes';
import {
  scaleLinear,
  scaleOrdinal,
  scaleSequential,
  scaleBand,
} from 'd3-scale';
import { defaultRange, type RowMappingWithDomain } from './TableUtil';

// Define props

export interface UDICellRendererParams<TData, TValue, TContext>
  extends ICellRendererParams<TData, TValue, TContext> {
  udiColumnMapping: RowMappingWithDomain[];
}

interface CellRendererProps {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  params: UDICellRendererParams<Record<string, unknown>, any, any>;
  // https://www.ag-grid.com/vue-data-grid/component-cell-renderer/#custom-components
}

const props = defineProps<CellRendererProps>();

const marks = computed(() => {
  if (!props.params.udiColumnMapping) return [];
  const marks = props.params.udiColumnMapping
    .filter((m) => {
      const d = props.params.data?.[m.field];
      return d !== null && typeof d !== 'undefined';
    })
    .map((m) => m.mark);
  // console.log({ marks });
  const uniqueMarks = [...new Set(marks)];
  // console.log({ uniqueMarks });
  return uniqueMarks;
});

const markMapping = computed<
  Partial<Record<RowMarkOptions, RowMappingWithDomain[]>>
>(() => {
  if (!props.params.udiColumnMapping) return {};
  const markEndodings = Object.groupBy(
    props.params.udiColumnMapping,
    (m) => m.mark,
  );
  return markEndodings;
});

function getTextValue() {
  if (!props.params.udiColumnMapping) return null;
  const rowMapping = markMapping.value['text'];
  if (!rowMapping) return null;
  const textMapping = rowMapping.find((m) => m.encoding === 'text');
  if (!textMapping) return null;
  return props.params.data?.[textMapping.field];
}

function getStyle(mark: RowMarkOptions): CSSProperties | null {
  if (!props.params.udiColumnMapping) return null;
  const rowMapping = markMapping.value[mark];
  if (!rowMapping) return null;
  const styleProps: CSSProperties = {};
  for (const mapping of rowMapping) {
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    const data = props.params.data?.[mapping.field] as any;
    if (
      typeof data !== 'number' &&
      typeof data !== 'string' &&
      data !== null &&
      typeof data !== 'undefined'
    ) {
      throw new Error(
        `Invalid data type for field ${mapping.field}: ${typeof data}`,
      );
    }
    const domain = mapping.domain;
    let numberDomain: [number, number] = [0, 1];
    let stringDomain: string[] = ['unknown'];
    if ('min' in domain && 'max' in domain) {
      numberDomain = [domain.min, domain.max];
    } else {
      stringDomain = domain.values;
    }

    switch (mapping.encoding) {
      case 'color': {
        let colorScale;
        if (mapping.type === 'quantitative') {
          colorScale = scaleSequential<string, string>(
            defaultRange.quantitativeColor,
          )
            .domain(numberDomain)
            .unknown(defaultRange.unknownColor);
        } else {
          colorScale = scaleOrdinal<string, string>(defaultRange.nominalColor)
            .domain(stringDomain)
            .range(defaultRange.nominalColor)
            .unknown(defaultRange.unknownColor);
        }
        const color = colorScale(data);

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
          .domain(numberDomain)
          .range(defaultRange.quantitative)
          .unknown(defaultRange.unknownQuantitative)(data);
        let percent = xPos * 100;
        if (percent < 0) percent = 0;
        if (mapping.mark === 'text') {
          styleProps.left = `${percent}%`;
          styleProps.transform = `translate(-${percent}%, -50%)`;
        } else if (mapping.mark === 'bar') {
          styleProps.width = `${percent}%`;
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
          .domain(numberDomain)
          .range(defaultRange.quantitative)
          .unknown(defaultRange.unknownQuantitative)(data);
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
        const yOffsetPos =
          scaleBand().domain(stringDomain).range(defaultRange.quantitative)(
            data,
          ) ?? 0;
        const height = 1 / stringDomain.length;
        if (mapping.mark === 'bar') {
          styleProps.bottom = `${yOffsetPos * 100}%`;
          styleProps.height = `${height * 100}%`;
        } else if (mapping.mark === 'line') {
          styleProps.top = `${100 - (yOffsetPos + height / 2) * 100}%`;
          styleProps.height = 0;
          styleProps.borderLeftWidth = 0;
          styleProps.borderRightWidth = 0;
        }
        break;
      }
      case 'xOffset': {
        const xOffsetPos =
          scaleBand().domain(stringDomain).range(defaultRange.quantitative)(
            data,
          ) ?? 0;
        const width = 1 / stringDomain.length;
        if (mapping.mark === 'bar') {
          styleProps.left = `${xOffsetPos * 100}%`;
          styleProps.width = `${width * 100}%`;
        } else if (mapping.mark === 'line') {
          styleProps.height = `100%`;
          styleProps.left = `${(xOffsetPos + width / 2) * 100}%`;
          styleProps.width = 0;
          styleProps.borderTopWidth = 0;
          styleProps.borderBottomWidth = 0;
        }
        break;
      }
      case 'size': {
        const size = scaleLinear()
          .domain(numberDomain)
          .range(defaultRange.quantitative)
          .unknown(defaultRange.unknownQuantitative)(data);
        if (mapping.mark === 'rect') {
          styleProps.width = `${size * 100}%`;
          styleProps.height = `${size * 100}%`;
          styleProps.left = `${(1 - size) * 50}%`;
          styleProps.bottom = `${(1 - size) * 50}%`;
        } else if (mapping.mark === 'point') {
          let rootSize = 0;
          if (size > 0) {
            rootSize = Math.sqrt(size);
          }
          const maxSize = 16;
          styleProps.width = `${rootSize * maxSize}px`;
          styleProps.height = `${rootSize * maxSize}px`;
        }
        break;
      }
      default: {
        break;
      }
    }
  }
  return styleProps;
}
</script>

<template>
  <div class="cell-container">
    <template v-for="mark in marks" :key="mark">
      <div
        v-if="mark === 'text'"
        :style="getStyle(mark)"
        class="pos-absolute text"
      >
        {{ getTextValue() }}
      </div>
      <div
        v-else-if="mark === 'bar'"
        :style="getStyle(mark)"
        class="pos-absolute bar"
      ></div>
      <div
        v-else-if="mark === 'rect'"
        :style="getStyle(mark)"
        class="pos-absolute rect"
      ></div>
      <div
        v-else-if="mark === 'point'"
        :style="getStyle(mark)"
        class="pos-absolute point"
      ></div>
      <div
        v-else-if="mark === 'line'"
        :style="getStyle(mark)"
        class="pos-absolute line"
      ></div>
    </template>
    <template v-if="marks.length === 0">
      <div class="empty-cell pos-absolute">∅</div>
    </template>
  </div>
</template>

<style scoped lang="scss">
$default-color: rgb(198, 207, 216);
.pos-absolute {
  position: absolute;
}

$container-margin-top: 2px;
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

.empty-cell {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  line-height: 1;
  color: rgb(94, 94, 94);
}
</style>
