import '@/assets/styles/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from '@/App.vue'
import { ripple } from '@/directives/ripple'
import { createNotificationsPlugin } from '@/features/notifications'
import router from '@/router'


const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(createNotificationsPlugin())

app.directive('ripple', ripple)

app.mount('#app')
