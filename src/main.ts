import '@/assets/styles/index.css'

import { createApp } from 'vue'

import App from '@/App.vue'
import { createResizeDirective } from '@/directives/resize'
import { ripple } from '@/directives/ripple'
import { createAppRouter } from '@/router'

const app = createApp(App)

app.use(createAppRouter())

app.directive('resize', createResizeDirective())
app.directive('ripple', ripple)

app.mount('#app')
