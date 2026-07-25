const setTitle = (title: string): void => {
  document.title = title
}

const setDescription = (description: string): void => {
  const meta = document.querySelector('meta[name="description"]')
  if (meta) meta.setAttribute('content', description)
}

export const usePageMeta = () => {
  return {
    setTitle,
    setDescription,
  }
}
