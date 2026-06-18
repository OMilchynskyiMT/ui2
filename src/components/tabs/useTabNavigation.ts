import { ref } from 'vue'

import type { TransitionName } from '../transitons/PageTransition.vue'

export const useTabNavigation = <T>(ids: T[], currentId?: T) => {
  const transtionName = ref<TransitionName>('page-enter')
  const current = ref<T | undefined>(currentId)

  const goto = (id: T, callback?: (id: T) => void) => {
    if (current.value === id) return
    if (!current.value || !ids.includes(current.value)) {
      transtionName.value = 'page-enter'
      return
    }

    const currentIndex = ids.indexOf(current.value)
    const newIndex = ids.indexOf(id)

    if (currentIndex > newIndex) {
      transtionName.value = 'page-back'
    } else if (currentIndex < newIndex) {
      transtionName.value = 'page-forward'
    }

    current.value = id
    callback?.(id)
  }

  return {
    transtionName,
    goto,
  }
}
