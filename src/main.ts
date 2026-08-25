import '@/assets/styles/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from '@/App.vue'
import { ripple } from '@/directives/ripple'
import { createAppRouter } from '@/router'

const app = createApp(App)

app.use(createPinia())
app.use(createAppRouter())

app.directive('ripple', ripple)

app.mount('#app')
