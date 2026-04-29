import { createRouter, createWebHistory } from "vue-router"
import Chat from "../views/Chat.vue"

const routes = [
  {
    path: "/chat",
    name: "chat",
    component: Chat
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [],
})

export default router
