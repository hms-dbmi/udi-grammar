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
import { defaultRange, type ExtendedRowMapping } from './TableUtil';

// Define props

export interface UDICellRendererParams<TData, TValue, TContext>
  extends ICellRendererParams<TData, TValue, TContext> {
  udiColumnMapping: ExtendedRowMapping[];
}

export interface UDICellRendererProps {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  params: UDICellRendererParams<Record<string, unknown>, any, any>;
  // https://www.ag-grid.com/vue-data-grid/component-cell-renderer/#custom-components
}

const props = defineProps<UDICellRendererProps>();

// const marks = computed(() => {
//   if (!props.params.udiColumnMapping) return [];
//   const marks = props.params.udiColumnMapping
//     .filter((m) => {
//       const d = props.params.data?.[m.field];
//       return d !== null && typeof d !== 'undefined';
//     })
//     .map((m) => m.mark);
//   // console.log({ marks });
//   const uniqueMarks = [...new Set(marks)];
//   // console.log({ uniqueMarks });
//   return uniqueMarks;
// });

const layeredMarks = computed(() => {
  if (!props.params.udiColumnMapping) return [];
  const layers = props.params.udiColumnMapping.map((m) => m.layer);
  const uniqueLayers = [...new Set(layers)];

  const marks = uniqueLayers.map((layer) => {
    const layerMarks = props.params.udiColumnMapping
      .filter((m) => m.layer === layer)
      .filter((m) => {
        const d = props.params.data?.[m.field];
        return d !== null && typeof d !== 'undefined';
      });
    const marks = layerMarks.map((m) => m.mark);
    const uniqueMarks = [...new Set(marks)];
    return {
      layer,
      marks: uniqueMarks,
    };
  });

  // flatten
  const flatMarks: { layer: string; mark: string }[] = [];
  for (const mark of marks) {
    for (const m of mark.marks) {
      flatMarks.push({
        layer: mark.layer,
        mark: m,
      });
    }
  }
  return flatMarks;
});

const markMapping = computed<
  Record<string, Partial<Record<RowMarkOptions, ExtendedRowMapping[]>>>
>(() => {
  if (!props.params.udiColumnMapping) return {};
  const layers = Object.groupBy(props.params.udiColumnMapping, (m) => m.layer);
  const outLayers: Record<
    string,
    Partial<Record<RowMarkOptions, ExtendedRowMapping[]>>
  > = {};
  for (const layer of Object.keys(layers)) {
    const layerMarks = layers[layer];
    if (!layerMarks) continue;
    const marks = Object.groupBy(layerMarks, (m) => m.mark);

    outLayers[layer] = marks;
  }
  return outLayers;
});

function getTextValue(layer: string) {
  if (!props.params.udiColumnMapping) return null;
  const rowMapping = markMapping.value[layer]?.['text'];
  if (!rowMapping) return null;
  const textMapping = rowMapping.find((m) => m.encoding === 'text');
  if (!textMapping) return null;
  let value = props.params.data?.[textMapping.field];
  if (value instanceof Date) {
    value = value.toLocaleDateString();
  }
  if (typeof value === 'boolean') {
    value = value.toString();
  }
  return value;
}

function getStyle(layer: string, mark: RowMarkOptions): CSSProperties | null {
  if (!props.params.udiColumnMapping) return null;
  const rowMapping = markMapping.value[layer]?.[mark];
  if (!rowMapping) return null;
  const styleProps: CSSProperties = {};
  let x1Percent = null;
  let x2Percent = null;
  for (const mapping of rowMapping) {
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    let data = props.params.data?.[mapping.field] as any;
    if (data instanceof Date) {
      data = data.toLocaleDateString();
    }
    if (typeof data === 'boolean') {
      data = data.toString();
    }
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
      stringDomain = domain;
    }
    let numberRange: [number, number] | null = null;
    let stringRange: string[] | null = null;
    if (mapping.range) {
      if ('min' in mapping.range && 'max' in mapping.range) {
        numberRange = [mapping.range.min, mapping.range.max];
      } else {
        stringRange = mapping.range;
      }
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
            .range(stringRange ?? defaultRange.nominalColor)
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
          .range(numberRange ?? defaultRange.quantitative)
          .unknown(defaultRange.unknownQuantitative)(data);
        let percent = xPos * 100;
        x1Percent = percent;
        if (percent < 0) percent = 0;
        if (mapping.mark === 'text') {
          styleProps.left = `${percent}%`;
          styleProps.transform = `translate(-${percent}%, -50%)`;
        } else if (mapping.mark === 'bar') {
          if (x2Percent !== null) {
            styleProps.left = `${Math.min(percent, x1Percent)}%`;
            styleProps.width = `${Math.abs(x2Percent - percent)}%`;
          } else {
            styleProps.width = `${percent}%`;
          }
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
      case 'x2': {
        const xPos = scaleLinear()
          .domain(numberDomain)
          .range(numberRange ?? defaultRange.quantitative)
          .unknown(defaultRange.unknownQuantitative)(data);
        let percent = xPos * 100;
        x2Percent = percent;
        if (percent < 0) percent = 0;
        if (mapping.mark === 'bar') {
          if (x1Percent !== null) {
            styleProps.left = `${Math.min(percent, x1Percent)}%`;
            styleProps.width = `${Math.abs(x1Percent - percent)}%`;
          } else {
            const left = 100 - percent;
            styleProps.left = `${100 - percent}%`;
            styleProps.width = `${100 - left}%`;
          }
        } else if (mapping.mark === 'line') {
          // TODO
          // styleProps.height = `100%`;
          // styleProps.left = `${percent}%`;
          // styleProps.width = 0;
          // styleProps.borderTopWidth = 0;
          // styleProps.borderBottomWidth = 0;
        }
        break;
      }
      case 'y': {
        const yPos = scaleLinear()
          .domain(numberDomain)
          .range(numberRange ?? defaultRange.quantitative)
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
          scaleBand()
            .domain(stringDomain)
            .range(numberRange ?? defaultRange.quantitative)(data) ?? 0;
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
          scaleBand()
            .domain(stringDomain)
            .range(numberRange ?? defaultRange.quantitative)(data) ?? 0;
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
          .range(numberRange ?? defaultRange.quantitative)
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
    <template v-for="{ layer, mark } in layeredMarks" :key="mark">
      <div
        v-if="mark === 'text'"
        :style="getStyle(layer, mark)"
        class="pos-absolute text"
      >
        {{ getTextValue(layer) }}
      </div>
      <div
        v-else-if="mark === 'bar'"
        :style="getStyle(layer, mark)"
        class="pos-absolute bar"
      ></div>
      <div
        v-else-if="mark === 'rect'"
        :style="getStyle(layer, mark)"
        class="pos-absolute rect"
      ></div>
      <div
        v-else-if="mark === 'point'"
        :style="getStyle(layer, mark)"
        class="pos-absolute point"
      ></div>
      <div
        v-else-if="mark === 'line'"
        :style="getStyle(layer, mark)"
        class="pos-absolute line"
      ></div>
    </template>
    <template v-if="layeredMarks.length === 0">
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
