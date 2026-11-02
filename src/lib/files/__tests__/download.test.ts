import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const { get } = vi.hoisted(() => ({ get: vi.fn() }))
vi.mock('@/lib/http', () => ({ http: { get } }))

import { downloadBlob, downloadFile, getFilenameFromHeaders } from '../download'

const click = vi.fn()
const remove = vi.fn()
const append = vi.fn()
const revoke = vi.fn()
const create = vi.fn(() => 'blob:device/test')
const anchor = { href: '', download: '', style: { display: '' }, click, remove }

beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal('document', {
    baseURI: 'https://device.example/ui/',
    body: { append },
    createElement: () => anchor,
  })
  vi.spyOn(URL, 'createObjectURL').mockImplementation(create)
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(revoke)
  get.mockReset()
  click.mockClear()
  remove.mockClear()
  append.mockClear()
  create.mockClear()
  revoke.mockClear()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it('prefers valid UTF-8 filename* and fallbacks to quoted name', () => {
  expect(getFilenameFromHeaders('attachment; filename="old.zip"; filename*=UTF-8\'\'new%20file.zip')).toBe(
    'new file.zip'
  )
  expect(getFilenameFromHeaders('attachment; filename="old.zip"; filename*=UTF-8\'\'%ZZ')).toBe('old.zip')
  expect(getFilenameFromHeaders('attachment; filename="a\\\"b.txt"')).toBe('a"b.txt')
  expect(getFilenameFromHeaders(String.raw`attachment; filename="folder\config.txt"`)).toBe('config.txt')
  expect(getFilenameFromHeaders('attachment')).toBeUndefined()
})

it('downloads a Blob and releases its object URL after the download has started', async () => {
  const blob = new Blob(['contents'])
  downloadBlob(blob, 'configuration.zip')

  expect(create).toHaveBeenCalledWith(blob)
  expect(anchor.href).toBe('blob:device/test')
  expect(anchor.download).toBe('configuration.zip')
  expect(append).toHaveBeenCalledWith(anchor)
  expect(click).toHaveBeenCalledOnce()
  expect(remove).toHaveBeenCalledOnce()
  expect(revoke).not.toHaveBeenCalled()
  await vi.advanceTimersByTimeAsync(1000)
  expect(revoke).toHaveBeenCalledWith('blob:device/test')
})

it('downloads the exact binary response and uses its disposition filename', async () => {
  const blob = new Blob(['binary'])
  const progress = vi.fn()
  const controller = new AbortController()
  get.mockResolvedValueOnce({ data: blob, headers: { 'content-disposition': 'attachment; filename="backup.tar.gz"' } })

  await downloadFile('/api/backup', { signal: controller.signal, onDownloadProgress: progress })

  expect(get).toHaveBeenCalledWith('/api/backup', {
    responseType: 'blob',
    signal: controller.signal,
    onDownloadProgress: progress,
  })
  expect(create).toHaveBeenCalledWith(blob)
  expect(anchor.download).toBe('backup.tar.gz')
})

it('uses explicit name or URL filename when the header is absent', async () => {
  get.mockResolvedValue({ data: new Blob(), headers: {} })
  await downloadFile('/api/log%20file.txt?view=1')
  expect(anchor.download).toBe('log file.txt')

  await downloadFile('/api/backup', { filename: 'custom.zip' })
  expect(anchor.download).toBe('custom.zip')
})

it('does not attempt to download when the HTTP request fails', async () => {
  get.mockRejectedValueOnce(new Error('Unavailable'))
  await expect(downloadFile('/api/backup')).rejects.toThrow('Unavailable')
  expect(click).not.toHaveBeenCalled()
})
