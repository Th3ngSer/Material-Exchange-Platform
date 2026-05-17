import { createRouter, createWebHistory } from 'vue-router'
//  Admin Dashboard
import AdminActivity from '../views/AdminActivity.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import AdminListings from '../views/AdminListings.vue'
import AdminNotifications from '../views/AdminNotifications.vue'
import AdminReports from '../views/AdminReports.vue'
import AdminReviews from '../views/AdminReviews.vue'
import AdminTransactions from '../views/AdminTransactions.vue'
import AdminUsers from '../views/AdminUsers.vue'
// Chat System
import Chat from '../views/Chat.vue'
// Posts Create
import CreatePost from '../views/CreatePost.vue'
import EditPost from '../views/EditPost.vue'
import MaterialDetailView from '../views/MaterialDetailView.vue'
// HomeView
import HomeView from '../views/HomeView.vue'
// Auth 
import LoginView from '../views/LoginView.vue'
import PostsList from '../views/PostsList.vue'
import SignUpView from '../views/SignUpView.vue'
// Profile
import Profile from '../user/Personal.vue'
import EditProfile from '../user/EditProfile.vue'
import HelpProfile from '../user/HelpProfile.vue'
import LangaugeInformation from '../user/LangaugeInformation.vue'
import LogoutInformation from '@/user/LogoutInformation.vue'
import PaymentInformation from '@/user/PaymentInformation.vue'
import TrackingInformation from '@/user/TrackingInformation.vue'
import { useAuthStore } from '@/stores/auth'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/home' },
    { path: '/home', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/signup', name: 'signup', component: SignUpView },

    { path: '/posts', name: 'posts', component: PostsList },
    { path: '/posts/create', name: 'create-post', component: CreatePost },
    { path: '/posts/:id', name: 'post-detail', component: MaterialDetailView },
    { path: '/posts/:id/edit', name: 'edit-post', component: EditPost },

    { path: '/chat', name: 'chat', component: Chat },

    // Profile
    { path: '/profile', name: 'profile', component: Profile },
    { path: '/profile/edit', name: 'edit-profile', component: EditProfile },
    { path: '/profile/help', name: 'help-profile', component: HelpProfile },
    { path: '/profile/language', name: 'language-information', component: LangaugeInformation },
    { path: '/profile/logout', name: 'logout-information', component: LogoutInformation },
    { path: '/profile/payment', name: 'payment-information', component: PaymentInformation },
    { path: '/profile/tracker', name: 'trackItem', component: TrackingInformation},

    // Admin routes
    { path: '/admin', name: 'SuperAdmin', component: AdminDashboard, meta: { requiresAdmin: true } },
    { path: '/admin/activity', name: 'admin-activity', component: AdminActivity, meta: { requiresAdmin: true } },
    { path: '/admin/listings', name: 'admin-listings', component: AdminListings, meta: { requiresAdmin: true } },
    { path: '/admin/notifications', name: 'admin-notifications', component: AdminNotifications, meta: { requiresAdmin: true } },
    { path: '/admin/reports', name: 'admin-reports', component: AdminReports, meta: { requiresAdmin: true } },
    { path: '/admin/reviews', name: 'admin-reviews', component: AdminReviews, meta: { requiresAdmin: true } },
    { path: '/admin/transactions', name: 'admin-transactions', component: AdminTransactions, meta: { requiresAdmin: true } },
    { path: '/admin/users', name: 'admin-users', component: AdminUsers, meta: { requiresAdmin: true } },
  ],
})

function getRoleFromToken(token: string | null) {
  if (!token) return null

  const parts = token.split('.')
  if (parts.length < 2) return null

  try {
    const payload = JSON.parse(atob(parts[1])) as { role?: string }
    return payload.role ?? null
  } catch {
    return null
  }
}

router.beforeEach((to) => {
  if (!to.matched.some((record) => record.meta?.requiresAdmin)) {
    return true
  }

  const authStore = useAuthStore()
  const token = localStorage.getItem('authToken')
  const role = authStore.user?.role ?? getRoleFromToken(token)

  if (!token) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (role !== 'admin') {
    return { name: 'home' }
  }

  return true
})

export default router
