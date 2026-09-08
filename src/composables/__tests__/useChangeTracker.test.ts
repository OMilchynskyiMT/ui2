import { reactive, ref } from 'vue'
import { expect, it } from 'vitest'

import { useChangeTracker } from '../useChangeTracker'

it('stays clean until the tracked data is ready', () => {
  const current = ref({ hostname: 'router' })
  const baseline = ref({ hostname: 'gateway' })
  const ready = ref(false)
  const changes = useChangeTracker(current, baseline, ready)

  expect(changes.dirty.value).toBe(false)

  ready.value = true
  expect(changes.dirty.value).toBe(true)
})

it('tracks nested structural changes and becomes clean when they are reverted', () => {
  const initial = {
    hostname: 'router',
    services: ['dhcp'],
    updatedAt: new Date('2026-09-08T00:00:00Z'),
  }
  const current = reactive(structuredClone(initial))
  const baseline = ref(structuredClone(initial))
  const changes = useChangeTracker(() => current, baseline, true)

  expect(changes.dirty.value).toBe(false)

  current.services.push('smtp')
  expect(changes.dirty.value).toBe(true)

  current.services.pop()
  expect(changes.dirty.value).toBe(false)

  current.updatedAt = new Date('2026-09-09T00:00:00Z')
  expect(changes.dirty.value).toBe(true)
})

it('can project transient properties out of dirty tracking', () => {
  const current = ref({ hostname: 'router', selected: false })
  const baseline = ref({ hostname: 'router', selected: false })
  const changes = useChangeTracker(current, baseline, true, {
    project: value => value.hostname,
  })

  current.value.selected = true
  expect(changes.dirty.value).toBe(false)

  current.value.hostname = 'gateway'
  expect(changes.dirty.value).toBe(true)
})

it('supports a domain-specific equality function', () => {
  const current = ref('ROUTER')
  const baseline = ref('router')
  const changes = useChangeTracker(current, baseline, true, {
    equals: (left, right) => left.toLowerCase() === right.toLowerCase(),
  })

  expect(changes.dirty.value).toBe(false)
  expect(changes.isChanged('Gateway', 'gateway')).toBe(false)
  expect(changes.isChanged('router', 'gateway')).toBe(true)
})
