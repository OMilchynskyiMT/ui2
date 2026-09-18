import { ref } from 'vue'

const nextId = ref(0)

export const useId = (prefix = 'el-'): string => `${prefix}${nextId.value++}`
