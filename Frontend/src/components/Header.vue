<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goChat = () => router.push('/chat')
const goNotification = () => router.push('/notification')
const goProfile = () => router.push('/profile')
</script>

<template>
  <header class="header">
    <!-- LEFT: Logo + Nav -->
    <div class="left-section">
      <h1 class="logo">Do<span>Ot</span></h1>
      <nav class="nav-links">
        <router-link to="/browse" class="nav-item">Browse</router-link>
        <router-link to="/post" class="nav-item">Post</router-link>
      </nav>
    </div>

    <!-- Search Bar with Icon -->
    <div class="search-container">
      <div class="search-bar">
        <select class="category-select">
          <option>Category</option>
          <option>Materials</option>
          <option>Equipment</option>
        </select>
        <input type="text" placeholder="Search materials" />
        <button class="search-btn" title="Search">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="search-icon-svg"
          >
            <path
              fill-rule="evenodd"
              d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Icons + Account -->
    <div class="right-section">
      <button class="icon-btn icon-chat" @click="goChat" title="Messages">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="icon-svg"
        >
          <path
            fill-rule="evenodd"
            d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z"
            clip-rule="evenodd"
          />
        </svg>
      </button>

      <!-- Bell Icon -->
      <button class="icon-btn icon-notification" @click="goNotification" title="Notifications">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="icon-svg"
        >
          <path
            fill-rule="evenodd"
            d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z"
            clip-rule="evenodd"
          />
        </svg>
        <span class="badge">4</span>
      </button>

      <!-- Profile Icon -->
      <button class="icon-btn" @click="goProfile" title="Account">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="icon-svg"
        >
          <path
            fill-rule="evenodd"
            d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75c2.744 0 5.245-1.01 7.13-2.678a.29.29 0 00-.068-.475 10.15 10.15 0 01-2.678-1.43A9.75 9.75 0 0012 16.5c-2.048 0-3.963.608-5.54 1.636a.29.29 0 00-.068.475A9.716 9.716 0 0012 21.75c2.744 0 5.245-1.01 7.13-2.678a.29.29 0 00-.068-.475 10.15 10.15 0 01-2.678-1.43zM12 7.5a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
  </header>
</template>

<style scoped>
.header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: #e5e7eb;
  border-bottom: 1px solid #94a3b8;
  font-family: 'Inter', system-ui, sans-serif;
}

/* LEFT */
.left-section {
  display: flex;
  align-items: center;
  gap: 32px;
}

.logo {
  font-size: 24px;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;
  color: #0f172a;
}

.logo span {
  color: #ef4444;
}

.nav-links {
  display: flex;
  gap: 12px;
}

.nav-item {
  text-decoration: none;
  color: #0f172a;
  font-size: 14px;
  font-weight: 600;
  padding: 4px 0;
  transition: all 0.2s;
  opacity: 1;
  text-decoration: underline;
  text-underline-offset: 4px;
}

.nav-item:hover {
  opacity: 0.8;
}

/* CENTER */
.search-container {
  flex: 1;
  max-width: 440px;
  margin: 0 24px;
}

.search-bar {
  display: flex;
  align-items: center;
  background: #cbd5e1;
  border: 1px solid #94a3b8;
  border-radius: 8px;
  padding: 4px;
  gap: 4px;
}

.category-select {
  border: none;
  background: transparent;
  padding: 6px 10px;
  font-size: 13px;
  font-weight: 500;
  color: #0f172a;
  cursor: pointer;
  outline: none;
  border-right: 1px solid #94a3b8;
}

.search-bar input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 6px 10px;
  font-size: 13px;
  font-weight: 500;
  outline: none;
  color: #0f172a;
}

.search-bar input::placeholder {
  color: #64748b;
  font-weight: 400;
}

.search-btn {
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  color: #0f172a;
  border-radius: 6px;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

/* SVG Icons */
.icon-svg,
.search-icon-svg {
  width: 24px;
  height: 24px;
}

/* RIGHT */
.right-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  position: relative;
  transition: background 0.2s;
  color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.icon-chat {
  color: #ef4444;
}

.icon-notification {
  color: #0f172a;
}

.badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: #ffffff;
  color: #0f172a;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 4px;
  border-radius: 10px;
  line-height: 1;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
</style>
