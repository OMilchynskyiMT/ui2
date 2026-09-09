import { computed, type Slots, useAttrs } from 'vue'

export const getForwardedSlotNames = (slots: Slots, excluded: readonly string[] = []): string[] => {
  return Object.keys(slots).filter(name => !excluded.includes(name))
}

export const useSplitAttributes = (excludedFromControl: readonly string[] = []) => {
  const attributes = useAttrs()
  const excluded = new Set(['class', 'style', ...excludedFromControl])

  const rootAttributes = computed(() => ({
    class: attributes.class,
    style: attributes.style,
  }))

  const controlAttributes = computed(() => {
    return Object.fromEntries(Object.entries(attributes).filter(([name]) => !excluded.has(name)))
  })

  return {
    attributes,
    rootAttributes,
    controlAttributes,
  }
}
