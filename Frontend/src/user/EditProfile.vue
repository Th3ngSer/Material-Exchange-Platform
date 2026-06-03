<template>
  <div class="personal-info">
    <Sidebar />

    <div class="content">
      <h2 class="title">{{ languageStore.t('editProfile') }} </h2>

      <div class="info-form">
        <!-- Left column -->
        <div class="form-column">
          <div class="field">
            <span>{{ languageStore.t('firstName') }}</span>
            <input v-model="form.firstName" type="text" />
          </div>

          <div class="field">
            <span>{{ languageStore.t('birthDate') }}</span>
            <input v-model="form.birthDate" type="date" />
          </div>

          <div class="field">
            <span>{{ languageStore.t('nationality') }}</span>
            <input v-model="form.nationality" type="text" />
          </div>

          <div class="field">
            <span>{{ languageStore.t('username') }}</span>
            <input v-model="form.username" type="text" />
          </div>
        </div>

        <!-- Right column -->
        <div class="form-column">
          <div class="field">
            <span>{{ languageStore.t('lastName') }}</span>
            <input v-model="form.lastName" type="text" />
          </div>

          <!-- Gender -->
          <div class="field">
            <span>{{ languageStore.t('gender') }}</span>

            <div class="gender-options">
              <label>
                <input v-model="form.gender" type="radio" value="Male" />
                {{ languageStore.t('male') }}
              </label>

              <label>
                <input v-model="form.gender" type="radio" value="Female" />
                {{ languageStore.t('female') }}
              </label>
            </div>
          </div>

          <div class="field">
            <span>{{ languageStore.t('phoneNumber') }}</span>
            <input v-model="form.phone" type="tel" />
          </div>

          <div class="field">
            <span>{{ languageStore.t('email') }}</span>
            <input v-model="form.email" type="email" />
          </div>
        </div>
      </div>

      <div class="form-actions">
        <div v-if="saveError" class="error-message">{{ saveError }}</div>
        <button type="button" class="btn" @click="saveProfile" :disabled="isSaving">
          {{ isSaving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '../userprofileComponent/Sidebar.vue'
import { useLanguageStore } from '../stores/language'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const languageStore = useLanguageStore()
const authStore = useAuthStore()

const saveError = ref(null)
const isSaving = ref(false)

const form = reactive({
  firstName: '',
  lastName: '',
  birthDate: '',
  nationality: '',
  username: '',
  gender: '',
  phone: '',
  email: '',
})

const fillFromAuthUser = () => {
  if (!authStore.user) return
  const fullName = authStore.user.name || ''
  const [firstName, ...rest] = fullName.split(' ')
  const lastName = rest.join(' ')

  form.firstName = firstName || ''
  form.lastName = lastName || ''
  form.email = authStore.user.email || ''
  form.username = authStore.user.username || authStore.user.name || authStore.user.email || ''
  form.birthDate = authStore.user.birthDate || ''
  form.nationality = authStore.user.nationality || ''
  form.gender = authStore.user.gender || ''
  form.phone = authStore.user.phone || ''
}

onMounted(() => {
  fillFromAuthUser()
})

const saveProfile = async () => {
  saveError.value = null
  isSaving.value = true
  
  try {
    await authStore.updateProfile({
      name: `${form.firstName} ${form.lastName}`.trim(),
      email: form.email,
      username: form.username,
      gender: form.gender,
      phone: form.phone,
      nationality: form.nationality,
      birthDate: form.birthDate,
    })

    await authStore.refreshUser()
    router.push('/profile')
  } catch (err) {
    const statusCode = err?.statusCode
    const message = err instanceof Error ? err.message : 'Failed to update profile'
    
    console.error('Profile update failed:', err)
    saveError.value = message
    
    // Redirect to login if authentication was lost
    if (statusCode === 401) {
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.personal-info {
  display: flex;
  min-height: 100vh;
}

.content {
  flex: 1;
  padding: 32px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;
}

.info-form {
  display: flex;
  gap: 32px;
}

.form-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field span {
  font-size: 13px;
  color: gray;
  margin-bottom: 6px;
  display: block;
}

/* INPUT STYLE SAME FEEL */
.field input {
  width: 100%;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* GENDER */
.gender-options {
  display: flex;
  gap: 20px;
  margin-top: 6px;
}

/* BUTTON */
.form-actions {
  margin-top: 32px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  background: #1e1b4b;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  pointer-events: auto;
}

.btn:hover:not(:disabled) {
  background: #2d2a5f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #dc2626;
  background-color: #fee2e2;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 14px;
  border-left: 4px solid #dc2626;
}
</style>
