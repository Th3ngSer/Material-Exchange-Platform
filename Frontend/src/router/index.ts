import { createRouter, createWebHistory } from "vue-router"
import Chat from "../views/Chat.vue"
import TestSidebar from '@/userprofileVue/TestSidebar.vue'
import PersonalInfo from '@/userprofileVue/PersonalInformation.vue'
import EditInfo from '@/userprofileVue/EditInformation.vue'
import HelpInfo from '@/userprofileVue/HelpInformation.vue'
import LogoutInfo from '@/userprofileVue/LogoutInformation.vue'
import Language from '@/userprofileVue/LangaugeInformation.vue'
import Payment from '@/userprofileVue/PaymentInformation.vue'
import Tracker from '@/userprofileVue/TrackingInformation.vue'

const routes = [
  // Auth pages (no layout/header/footer)
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('../views/SignUpView.vue'),
  },

  // Pages with layout (header + footer)
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: "/chat",
    name: "chat",
    component: Chat
  },
  {
    path: '/test',
    name: 'TestSidebar',
    component: TestSidebar
  },
  {
    path: '/personal-info',
    component: PersonalInfo
  },
  {
    path: '/edit-profile',
    component: EditInfo
  },
  {
    path: '/help',
    name: 'Help',
    component: HelpInfo
  },
  {
    path: '/logout',
    name: 'Logout',
    component: LogoutInfo,

  },
  {
    path: '/language',
    name: 'Language',
    component: Language
  },
  {
  path: '/tracker',
  name: 'tracker',
  component: Tracker
  },
  {
    path: '/payments',
    name: 'Payment',
    component: Payment
  },
  {
    path: '/create-post',
    name: 'CreatePost',
    component: () => import('../views/CreatePost.vue')
  },
  {
    path: '/posts',
    name: 'PostsList',
    component: () => import('../views/PostsList.vue')
  }

]

export const router = createRouter({
  history: createWebHistory(),
  routes
})
