import { expect, it, vi } from 'vitest'

const { get } = vi.hoisted(() => ({ get: vi.fn() }))
vi.mock('@/lib/http', () => ({ http: { get } }))

import { getSystem } from '../system'

it('retrieves system information from the API', async () => {
  const result = { system: { capabilities: {}, softCapabilities: {} } }
  get.mockResolvedValueOnce({ data: result })

  await expect(getSystem()).resolves.toBe(result.system)
  expect(get).toHaveBeenCalledWith('/api', { params: { fields: 'system' } })
})
