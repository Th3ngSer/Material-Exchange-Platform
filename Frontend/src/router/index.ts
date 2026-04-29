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
import TestSidebar from '@/userprofileVue/TestSidebar.vue'
import PersonalInfo from '@/userprofileVue/PersonalInformation.vue'
import EditInfo from '@/userprofileVue/EditInformation.vue'
import HelpInfo from '@/userprofileVue/HelpInformation.vue'
import LogoutInfo from '@/userprofileVue/LogoutInformation.vue'
import Language from '@/userprofileVue/LangaugeInformation.vue'
import Payment from '@/userprofileVue/PaymentInformation.vue'


const routes = [
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
    path: '/payments',
    name: 'Payment',
    component: Payment
  }


]

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

export default router
