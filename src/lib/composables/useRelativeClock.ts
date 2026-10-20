import { onMounted, onUnmounted, readonly, type Ref, shallowRef, watch } from 'vue'

// single clock for all relative timestamps, rather than one interval per table row
const now = shallowRef(Date.now())
let subscribers = 0
let timer: ReturnType<typeof setInterval> | undefined

const refresh = (): void => {
  if (document.visibilityState !== 'hidden') now.value = Date.now()
}

const subscribe = (): void => {
  if (subscribers++ > 0) return
  refresh()
  timer = setInterval(refresh, 30_000)
  document.addEventListener('visibilitychange', refresh)
}

const unsubscribe = (): void => {
  if (--subscribers > 0) return
  clearInterval(timer)
  timer = undefined
  document.removeEventListener('visibilitychange', refresh)
}

// shared, visibility-aware clock that runs only while live timestamps are mounted
export const useRelativeClock = (live: Ref<boolean>) => {
  let isMounted = false
  let isSubscribed = false
  const sync = (): void => {
    if (!isMounted || isSubscribed === live.value) return
    isSubscribed = live.value
    if (isSubscribed) subscribe()
    else unsubscribe()
  }

  watch(live, sync)
  onMounted(() => {
    isMounted = true
    sync()
  })
  onUnmounted(() => {
    isMounted = false
    if (isSubscribed) unsubscribe()
  })
  return readonly(now)
}
