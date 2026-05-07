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
  { path: '/', name: 'home', component: HomeView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/signup', name: 'signup', component: SignUpView },
  { path: '/chat', name: 'chat', component: Chat },
  { path: '/posts', name: 'posts', component: PostsList },
  { path: '/posts/new', name: 'create-post', component: CreatePost },
  { path: '/posts/:id/edit', name: 'edit-post', component: EditPost },
  { path: '/admin', name: 'admin', component: AdminDashboard },
  { path: '/admin/users', name: 'admin-users', component: AdminUsers },
  { path: '/admin/listings', name: 'admin-listings', component: AdminListings },
  { path: '/admin/transactions', name: 'admin-transactions', component: AdminTransactions },
  { path: '/admin/reports', name: 'admin-reports', component: AdminReports },
  { path: '/admin/notifications', name: 'admin-notifications', component: AdminNotifications },
  { path: '/admin/activity', name: 'admin-activity', component: AdminActivity },
  { path: '/admin/reviews', name: 'admin-reviews', component: AdminReviews },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
