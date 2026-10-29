import type { RouteLocationRaw, Router } from 'vue-router'

import { checkAccess } from '@/models/access/access'
import { loadSystem } from '@/models/system/system'

// synchronous check for navigation controls; unknown capabilities are not treated as available
export const canVisitRoute = (router: Router, to: RouteLocationRaw): boolean =>
  checkAccess(router.resolve(to).matched.map(record => record.meta)) === 'allowed'

export const installAccessGuard = (router: Router): void => {
  router.beforeEach(async to => {
    const requirements = to.matched.map(record => record.meta)
    let result = checkAccess(requirements)

    if (result === 'unknown-capabilities') {
      try {
        await loadSystem()
        result = checkAccess(requirements)
      } catch {
        // the device can expire the session while a system request is pending
        if (checkAccess(requirements) === 'unauthenticated') {
          return { name: 'access-denied', replace: true }
        }
        return { name: 'feature-unavailable', replace: true }
      }
    }

    switch (result) {
      case 'unauthenticated':
      case 'forbidden': {
        return { name: 'access-denied', replace: true }
      }
      case 'unknown-capabilities':
      case 'unsupported': {
        return { name: 'feature-unavailable', replace: true }
      }
      default: {
        return true
      }
    }
  })
}
