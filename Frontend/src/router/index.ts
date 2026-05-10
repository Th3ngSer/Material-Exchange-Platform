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

export default router
