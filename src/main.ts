import '@/assets/styles/index.css'

import { createApp } from 'vue'

import { createResizeDirective } from '@/lib/directives/resize'
import { ripple } from '@/lib/directives/ripple'
import { initializeColorScheme } from '@/composables/useColorScheme'
import { createAppRouter } from '@/router'

const bootstrap = async (): Promise<void> => {
  initializeColorScheme()

  const { default: App } = import.meta.env.MODE === 'demo' ? await import('@/demo/App.vue') : await import('@/App.vue')

  if (import.meta.env.MODE !== 'demo') {
    const [{ setHttpUnauthorizedHandler }, { useUserSession }] = await Promise.all([
      import('@/lib/http'),
      import('@/state/userSession'),
    ])

    setHttpUnauthorizedHandler(() => useUserSession().expire())
    useUserSession().restore()
  }

  const app = createApp(App)
  app.use(await createAppRouter())
  app.directive('resize', createResizeDirective())
  app.directive('ripple', ripple)
  app.mount('#app')
}

void bootstrap()
