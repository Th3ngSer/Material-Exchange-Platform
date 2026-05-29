<template>
  <div class="help-page">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <div class="content">
      <section class="troubleshoot">
        <h1>{{ languageStore.t('troubleshoot') }} </h1>
        <p>{{ languageStore.t('troubleshootDescription') }} </p>
      </section>

      <section class="support">
        <h2>{{ languageStore.t('support') }}</h2>
        <p>{{ languageStore.t('supportDescription') }}</p>
      </section>

      <section class="contact-form">
        <h2>{{ languageStore.t('contactUs') }}</h2>

        <p v-if="submitted" class="success-msg">
          {{ languageStore.t('successSubmit') }} 
        </p>

        <form v-if="!submitted" @submit.prevent="submitForm">
          <div class="form-row">
            <label>
              {{ languageStore.t('firstName') }} 
              <input type="text" v-model="form.firstName" />
            </label>

            <label>
              {{ languageStore.t('lastName') }} 
              <input type="text" v-model="form.lastName" />
            </label>
          </div>

          <div class="form-row">
            <label>
              {{ languageStore.t('emailAddress') }} 
              <input type="email" v-model="form.email" />
            </label>

            <label>
              {{ languageStore.t('phoneNumber') }} 
              <input type="tel" v-model="form.phone" />
            </label>
          </div>

          <label>
            {{ languageStore.t('howCanWeHelp') }} 
            <textarea v-model="form.message"></textarea>
          </label>

          <label>
            {{ languageStore.t('whatCanWeProvide') }} 
            <textarea v-model="form.request"></textarea>
          </label>

          <button type="submit" class="submit-btn" :disabled="!isFormValid"> {{ languageStore.t('submit') }} </button>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { authFetch } from '@/utils/authFetch'
import { getToken } from '@/utils/tokenStorage'
import { reactive, ref, computed, onMounted } from 'vue'
import Sidebar from '../userprofileComponent/Sidebar.vue'
import { useLanguageStore } from '../stores/language'
import { useAuthStore } from '@/stores/auth'

const languageStore = useLanguageStore()
const authStore = useAuthStore()
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

/* form */
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  message: '',
  request: '',
})

/* submit state */
const submitted = ref(false)
const isSubmitting = ref(false)
const submitError = ref('')

const isFormValid = computed(() => {
  return form.firstName && form.lastName && form.email && form.phone && form.message && form.request
})

/* load user info */
onMounted(async () => {
  if (!authStore.user) {
    await authStore.initializeAuth()
  }

  if (authStore.user) {
    const fullName = authStore.user.name || ''
    const [firstName, ...rest] = fullName.split(' ')
    const lastName = rest.join(' ')

    form.firstName = firstName || ''
    form.lastName = lastName || ''
    form.email = authStore.user.email || ''
    form.phone = authStore.user.phone || ''
  }
})

/* submit */
const submitForm = async () => {
  submitError.value = ''
  isSubmitting.value = true

  try {
    const token = getToken()
    const response = await authFetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        message: form.message.trim(),
        request: form.request.trim(),
        userId: authStore.user?.id,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || 'Failed to submit report')
    }

    submitted.value = true
  } catch (error) {
    submitError.value = error instanceof Error ? error.message : 'Failed to submit report'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.help-page {
  display: flex;
  min-height: 100vh;
}

.content {
  flex: 1;
  padding: 32px;
  background: #fff;
  font-size: 14px;
}

.troubleshoot h1 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
}

.support h2,
.contact-form h2 {
  font-size: 16px;
  margin-top: 24px;
  margin-bottom: 8px;
  color: rgb(44, 43, 43);
}

/* success message */
.success-msg {
  color: green;
  font-size: 14px;
  margin-bottom: 12px;
  font-weight: 500;
}

.error-msg {
  color: #dc2626;
  font-size: 14px;
  margin-bottom: 12px;
  font-weight: 500;
}

/* form */
.contact-form form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: flex;
  gap: 20px;
}

.form-row label {
  flex: 1;
}

label {
  display: flex;
  flex-direction: column;
  font-size: 12px;
}

input,
textarea {
  margin-top: 6px;
  padding: 8px;
  font-size: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

textarea {
  min-height: 80px;
}

/* button */
.submit-btn {
  margin-top: 10px;
  background: #1e1b4b;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* disabled state */
.submit-btn:disabled {
  background: #aaa;
  cursor: not-allowed;
}
</style>
