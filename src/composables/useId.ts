import { ref } from 'vue'

const nextId = ref(0)

export const useId = (prefix = 'm-id-'): string => `${prefix}${nextId.value++}`
