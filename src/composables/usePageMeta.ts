import { computed } from 'vue'

export const APPLICATION_TITLE = 'MT-test-UI2'
export const APPLICATION_TITLE_SEPARATOR = '·'

const title = computed({
  get: (): string => {
    return document.title ?? ''
  },
  set: (value: string): void => {
    if (value.length > 0) {
      document.title = `${value} ${APPLICATION_TITLE_SEPARATOR} ${APPLICATION_TITLE}`
      return
    }
    document.title = APPLICATION_TITLE
  },
})

const meta = document.querySelector('meta[name="description"]')
const description = computed({
  get: (): string => {
    return meta?.getAttribute('content') ?? ''
  },
  set: (value: string): void => {
    if (meta) meta.setAttribute('content', value)
  },
})

export const usePageMeta = () => {
  return {
    title,
    description,
  }
}
