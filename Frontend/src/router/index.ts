import { createRouter, createWebHistory } from 'vue-router'
import AdminDashboard from '../views/AdminDashboard.vue'
import AdminActivity from '../views/AdminActivity.vue'
import AdminListings from '../views/AdminListings.vue'
import AdminNotifications from '../views/AdminNotifications.vue'
import AdminReports from '../views/AdminReports.vue'
import AdminReviews from '../views/AdminReviews.vue'
import AdminTransactions from '../views/AdminTransactions.vue'
import AdminUsers from '../views/AdminUsers.vue'
import Chat from '../views/Chat.vue'
import CreatePost from '../views/CreatePost.vue'
import EditPost from '../views/EditPost.vue'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import PostsList from '../views/PostsList.vue'
import SignUpView from '../views/SignUpView.vue'

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
