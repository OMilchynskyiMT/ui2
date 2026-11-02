import { expect, it, vi } from 'vitest'

const { get } = vi.hoisted(() => ({ get: vi.fn() }))
vi.mock('@/lib/http', () => ({ http: { get } }))

import { getDeviceStatus } from '../deviceStatus'

it('loads device-wide status without extending the session', async () => {
  const status = [{ guid: 'a', msg: 'Warning', timestamp: '07/22/2026 16:27:38', type: 'WARNING' }]
  get.mockResolvedValueOnce({ data: { status, system_dbDirty: true } })
  const controller = new AbortController()

  await expect(getDeviceStatus(controller.signal)).resolves.toEqual({ dbDirty: true, messages: status })
  expect(get).toHaveBeenCalledWith('/api', {
    params: { fields: 'status,system/dbDirty', inactivity: true },
    timeout: 7000,
    signal: controller.signal,
  })
})
