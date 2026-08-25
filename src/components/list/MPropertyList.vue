<template>
  <dl class="property-list">
    <div v-for="item in items" :key="item.field" class="item">
      <dt :title="item.hint ?? undefined" class="field">
        <slot :field="item.field" :name="`field-${item.field}`" :value="data[item.field]">
          <slot :field="item.field" :value="data[item.field]" name="field">
            {{ item.label ?? internalFormatField(item.field) }}
          </slot>
        </slot>
      </dt>

      <dd class="value">
        <slot :field="item.field" :name="`value-${item.field}`" :value="data[item.field]">
          <slot :field="item.field" :value="data[item.field]" name="value">
            {{ formatValue ? formatValue(data[item.field]) : (data[item.field] ?? emptyValue) }}
          </slot>
        </slot>
      </dd>
    </div>
  </dl>
</template>

<script lang="ts">
export type Data = Readonly<Record<string, unknown>>
export type Item = Readonly<{
  field: keyof Data
  label?: string
  hint?: string
}>

export type Properties = {
  data: Data
  items: Item[]
  emptyValue?: string
  formatValue?: (value: unknown) => string
}
</script>

<script lang="ts" setup>
type SlotProperties = {
  field: string
  value: unknown
}

type Slots = {
  field?: (properties: SlotProperties) => unknown
  value?: (properties: SlotProperties) => unknown
  [key: `field-${string}`]: ((properties: SlotProperties) => unknown) | undefined
  [key: `value-${string}`]: ((properties: SlotProperties) => unknown) | undefined
}

const { data, items, emptyValue = '-', formatValue } = defineProps<Properties>()

defineSlots<Slots>()

const internalFormatField = (field: string): string => {
  return field
    .replaceAll(/([a-z\d])([A-Z])/g, '$1 $2')
    .replaceAll(/[_-]+/g, ' ')
    .replace(/^./, character => character.toUpperCase())
}
</script>

<style scoped>
.property-list {
  --field-size: min(12rem, 38%);
  --column-gap: var(--space-md);
  --row-gap: var(--space-md);
  --row-padding: 0 var(--space-xs);
  --field-color: color-mix(in srgb, currentColor 68%, transparent);
  --border-style: dashed;

  &,
  & > .item {
    display: grid;
  }

  grid-template-columns:
    minmax(0, var(--field-size))
    minmax(0, 1fr);
  gap: var(--row-gap) var(--column-gap);

  > .item {
    grid-template-columns: subgrid;
    grid-column: 1 / -1;
    align-items: center;
    padding-block: var(--row-padding);
    border-block-end: 1px var(--border-style) var(--divider-color);

    > .field,
    > .value {
      min-inline-size: 0;
      display: flex;
      align-items: center;
      column-gap: var(--space-xs);
    }

    > .field {
      color: var(--field-color);
    }

    > .value {
      overflow-wrap: anywhere;
    }
  }
}
</style>
