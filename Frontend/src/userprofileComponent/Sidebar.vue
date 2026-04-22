<template>
  <aside class="sidebar">
    <UserAvatar :name="user.name" :image="user.avatar" />

    <nav class="menu">
      <router-link to="/personal-info" class="nav-link">
        <NavItem label="Personal Information" icon="userprofileImage/user.png"  />
      </router-link>

      <router-link to="/payments" class="nav-link">
        <NavItem label="Payments" icon="userprofileImage/wallet.png" />
      </router-link>

      <router-link to="/language" class="nav-link">
        <NavItem label="Language" icon="userprofileImage/globe.png" />
      </router-link>

      <router-link to="/help" class="nav-link">
        <NavItem label="Help" icon="userprofileImage/help.png" />
      </router-link>

      <router-link to="/logout" class="nav-link">
        <NavItem label="Logout" icon="userprofileImage/logout.png" />
      </router-link>
    </nav>
  </aside>
</template>

<script setup>
import UserAvatar from '@/userprofileComponent/UserAvatar.vue'
import NavItem from '@/userprofileComponent/NavItem.vue'

const user = {
  name: 'Steav',
  avatar: 'userprofileImage/avatar.png'
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  min-height: 100vh;
  background: #1e1b4b;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 20px 15px;
  margin: 0;
}

/* menu */
.menu {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* IMPORTANT: fix router-link default style */
.nav-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

/* active page highlight */
.router-link-active {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}
</style>