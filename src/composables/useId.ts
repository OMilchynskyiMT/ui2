import { ref } from "vue"

const id = ref(0)

export const useId = (prefix?: string): string => {
  return `${prefix ?? ''}${id.value++}`
}
