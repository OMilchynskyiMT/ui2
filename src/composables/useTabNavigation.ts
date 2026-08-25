import { type MaybeRefOrGetter, ref, toValue } from 'vue'

import type { TransitionName } from '@/components/transitions/PageTransition.vue'

export const useTabNavigation = <T>(ids: readonly T[], currentId: MaybeRefOrGetter<T | undefined>) => {
  const transitionName = ref<TransitionName>('page-enter')

  const goto = (id: T, callback?: (id: T) => void): void => {
    const current = toValue(currentId)
    if (current === id) return

    const currentIndex = current === undefined ? -1 : ids.indexOf(current)
    const nextIndex = ids.indexOf(id)

    if (currentIndex === -1 || nextIndex === -1) {
      transitionName.value = 'page-enter'
    } else if (currentIndex > nextIndex) {
      transitionName.value = 'page-back'
    } else {
      transitionName.value = 'page-forward'
    }

    callback?.(id)
  }

  return {
    transitionName,
    goto,
  }
}
