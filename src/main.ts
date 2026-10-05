import '@/assets/styles/index.css'

import { createApp } from 'vue'

import { createResizeDirective } from '@/lib/directives/resize'
import { ripple } from '@/lib/directives/ripple'
import App from '@/App.vue'
import { initializeColorScheme } from '@/composables/useColorScheme'
import { createAppRouter } from '@/router'
import { useUserSession } from '@/state/userSession'

initializeColorScheme()
useUserSession().restore()

const app = createApp(App)

app.use(createAppRouter())

app.directive('resize', createResizeDirective())
app.directive('ripple', ripple)

app.mount('#app')
