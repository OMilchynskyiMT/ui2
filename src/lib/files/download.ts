import type { AxiosRequestConfig } from 'axios'

import { http } from '@/lib/http'

export type DownloadOptions = {
  filename?: string
  signal?: AbortSignal
  onDownloadProgress?: AxiosRequestConfig['onDownloadProgress']
}

const cleanFilename = (name: string): string | undefined => {
  const filename = name.split(/[/\\]/).at(-1)?.trim()
  return filename && filename !== '.' && filename !== '..' ? filename : undefined
}

// NOTE: RFC 6266: prefer a valid UTF-8 filename* to the basic filename parameter
export const getFilenameFromHeaders = (disposition: string): string | undefined => {
  const extended = /(?:^|;)\s*filename\*\s*=\s*UTF-8'[^']*'([^;]*)/i.exec(disposition)?.[1]
  if (extended) {
    try {
      const decoded = cleanFilename(decodeURIComponent(extended.trim()))
      if (decoded) return decoded
    } catch {
      // INFO: fall back to filename when the extended value is malformed
    }
  }

  const regular = /(?:^|;)\s*filename\s*=\s*(?:"((?:\\.|[^"\\])*)"|([^;]*))/i.exec(disposition)
  const name = regular?.[1]?.replaceAll(/\\([\\"])/g, '$1') ?? regular?.[2]
  return name ? cleanFilename(name) : undefined
}

const filenameFromUrl = (url: string): string => {
  try {
    const path = new URL(url, document.baseURI).pathname
    const name = path.split('/').at(-1) ?? ''
    return cleanFilename(decodeURIComponent(name)) ?? 'download'
  } catch {
    return 'download'
  }
}

export const downloadBlob = (blob: Blob, filename: string): void => {
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  link.style.display = 'none'

  try {
    document.body.append(link)
    link.click()
  } finally {
    link.remove()
    // allows the browser to start download before releasing the object URL
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
  }
}

export const downloadFile = async (url: string, options: DownloadOptions = {}): Promise<void> => {
  const { data, headers } = await http.get<Blob>(url, {
    responseType: 'blob',
    signal: options.signal,
    onDownloadProgress: options.onDownloadProgress,
  })

  const disposition = headers['content-disposition']
  const filename =
    options.filename ??
    (typeof disposition === 'string' ? getFilenameFromHeaders(disposition) : undefined) ??
    filenameFromUrl(url)

  downloadBlob(data, filename)
}
