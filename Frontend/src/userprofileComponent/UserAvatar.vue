<template>
  <div class="page">

    <!-- Header -->
    <div class="header">
      <button class="back-btn" @click="goBack">
        <img src="/userprofileImage/back.png" class="back-icon" />
        Back
      </button>
    </div>

    <!-- Avatar -->
    <div class="avatar-container">

      <img
        :src="previewImage"
        class="avatar"
        alt="avatar"
        @error="onImageError"
      />

      <p class="change-photo" @click="triggerFile">
        Change photo
      </p>

      <div class="avatar-text">
        <p class="welcome">
          Welcome, {{ welcomeName }} 👋
        </p>
      </div>

      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="onFileChange"
        hidden
      />

    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const fileInput = ref<HTMLInputElement | null>(null)
const welcomeName = computed(() => {
  const username = authStore.user?.username?.trim()
  if (username) {
    return username
  }

  const fullName = authStore.user?.name?.trim() || ''
  if (fullName) {
    return fullName.split(/\s+/)[0]
  }

  return authStore.user?.email?.split('@')[0] || 'Guest'
})

const API_URL = 'http://localhost:3000'
const DEFAULT_AVATAR = '/userprofileImage/avatar.png'

const previewImage = ref<string>(DEFAULT_AVATAR)

/**
 * Convert backend avatar to full URL
 */
const normalizeAvatar = (avatar?: string | null) => {
  if (!avatar) return DEFAULT_AVATAR
  if (avatar.startsWith('http')) return avatar
  return `${API_URL}/${avatar}`
}

/**
 * Sync with store
 */
watch(
  () => authStore.user,
  (user) => {
    previewImage.value = normalizeAvatar(user?.avatar)
  },
  { immediate: true, deep: true }
)

/**
 * Fallback if image fails
 */
const onImageError = () => {
  previewImage.value = DEFAULT_AVATAR
}

/**
 * Back button
 */
const goBack = () => {
  router.push({ name: 'home' })
}

/**
 * Open file picker
 */
const triggerFile = () => {
  fileInput.value?.click()
}

/**
 * Upload avatar
 */
const onFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file || !authStore.user) return

  const formData = new FormData()

  // ⚠️ IMPORTANT: must match backend (MOST COMMON FIX)
  formData.append('avatar', file)

  try {
    const response = await axios.post(
      `${API_URL}/api/auth/upload-avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${authStore.token || ''}`
        }
      }
    )

    // SAFE response handling (backend may differ)
    const avatarPath =
      response.data.avatar ||
      response.data.path ||
      response.data.file

    if (!avatarPath) {
      throw new Error('No avatar path returned from backend')
    }

    // update UI instantly
    previewImage.value = normalizeAvatar(avatarPath)

    // update store safely
    authStore.user = {
      ...authStore.user,
      avatar: avatarPath
    }
    authStore.writeCachedAvatar(authStore.user)

  } catch (error) {
    console.error('Upload failed:', error)
  } finally {
    // allow re-upload same file
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}
</script>

<style scoped>
.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255,255,255,0.2);
}

.change-photo {
  font-size: 12px;
  color: #60a5fa;
  cursor: pointer;
  margin-top: 6px;
}

.change-photo:hover {
  text-decoration: underline;
}

.avatar-text .welcome {
  font-size: 24px;
  font-weight: bold;
  color: #cbd5e1;
  text-align: center;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
}

.back-icon {
  width: 16px;
  height: 16px;
}
</style>