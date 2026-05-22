<template>
  <aside class="sidebar">
    <UserAvatar :name="user.name" :image="user.avatar" />

    <nav class="menu">
      <router-link to="/profile" class="nav-link" active-class="active-link" exact>
        <NavItem :label="languageStore.t('personalInformation')" icon="/userprofileImage/user.png" />
      </router-link>

      <router-link to="/profile/tracker" class="nav-link" active-class="active-link">
        <NavItem :label="languageStore.t('trackingItem')" icon="/userprofileImage/tracker.png" />
      </router-link>

      <router-link to="/profile/payment" class="nav-link" active-class="active-link">
        <NavItem :label="languageStore.t('payments')" icon="/userprofileImage/wallet.png" />
      </router-link>

      <router-link to="/profile/language" class="nav-link" active-class="active-link">
        <NavItem :label="languageStore.t('language')" icon="/userprofileImage/globe.png" />
      </router-link>

      <router-link to="/profile/help" class="nav-link" active-class="active-link">
        <NavItem :label="languageStore.t('help')" icon="/userprofileImage/help.png" />
      </router-link>

      <router-link to="/profile/logout" class="nav-link" active-class="active-link">
        <NavItem :label="languageStore.t('logout')" icon="/userprofileImage/logout.png" />
      </router-link>
    </nav>
  </aside>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import UserAvatar from './UserAvatar.vue'
import NavItem from './NavItem.vue'
import { useLanguageStore } from '../stores/language'
import { useAuthStore } from '@/stores/auth'

export default defineComponent({
  components: {
    UserAvatar,
    NavItem,
  },
  setup() {
    const languageStore = useLanguageStore()
    const authStore = useAuthStore()

    const user = computed(() => ({
      name: authStore.user?.name || 'Guest',
      avatar: authStore.user?.avatar || '/userprofileImage/avatar.png',
    }))

    return {
      languageStore,
      user,
    }
  },
})
</script>

<style scoped>
.sidebar {
  width: 310px;
  min-height: 100vh;
  background: #1e1b4b;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 20px 15px;
}

/* menu layout */
.menu {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* remove default link style */
.nav-link {
  text-decoration: none;
  color: inherit;
  display: block;
  border-radius: 8px;
}

/* FULL ACTIVE STATE (FIXED) */
.active-link {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
}

/* hover effect */
.nav-link:hover {
  background: rgba(255, 255, 255, 0.08);
}
</style>