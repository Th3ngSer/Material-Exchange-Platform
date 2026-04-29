import { createRouter, createWebHistory } from 'vue-router'
import PostsList from '../views/PostsList.vue'
import CreatePost from '../views/CreatePost.vue'
import EditPost from '../views/EditPost.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/posts',
    },
    {
      path: '/posts',
      name: 'posts',
      component: PostsList,
    },
    {
      path: '/create',
      name: 'create',
      component: CreatePost,
    },
    {
      path: '/edit/:id',
      name: 'edit',
      component: EditPost,
    },
  ],
})

export default router
