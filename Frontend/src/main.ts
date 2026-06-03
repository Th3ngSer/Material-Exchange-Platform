import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import { useAuthStore } from './stores/auth'

import App from './App.vue'
import './assets/main.css'

const CANONICAL_HOST = 'localhost'
if (window.location.hostname === '127.0.0.1') {
    const { protocol, port, pathname, search, hash } = window.location
    window.location.replace(`${protocol}//${CANONICAL_HOST}:${port}${pathname}${search}${hash}`)
}

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize auth and wait for server refresh from MongoDB before mounting
const authStore = useAuthStore(pinia)
await authStore.initializeAuth()

app.mount('#app')
