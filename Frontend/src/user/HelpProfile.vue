<template>
  <div class="help-page">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <div class="content">
      <section class="troubleshoot">
        <h1><!-- {{ languageStore.t('troubleshoot') }} -->Troubleshoot</h1>
        <p><!-- {{ languageStore.t('troubleshootDescription') }} -->Find answers to common issues and how to resolve them.</p>
      </section>

      <section class="support">
        <h2><!-- {{ languageStore.t('support') }} -->Support</h2>
        <p><!-- {{ languageStore.t('supportDescription') }} -->If you need help, our team is here for you.</p>
      </section>

      <section class="contact-form">
        <h2><!-- {{ languageStore.t('contactUs') }} -->Contact Us</h2>

        <p v-if="submitted" class="success-msg">
          <!-- {{ languageStore.t('successSubmit') }} -->Your request has been submitted successfully.
        </p>

        <form v-if="!submitted" @submit.prevent="submitForm">
          <div class="form-row">
            <label>
              <!-- {{ languageStore.t('firstName') }} -->First Name
              <input type="text" v-model="form.firstName" />
            </label>

            <label>
              <!-- {{ languageStore.t('lastName') }} -->Last Name
              <input type="text" v-model="form.lastName" />
            </label>
          </div>

          <div class="form-row">
            <label>
              <!-- {{ languageStore.t('emailAddress') }} -->Email Address
              <input type="email" v-model="form.email" />
            </label>

            <label>
              <!-- {{ languageStore.t('phoneNumber') }} -->Phone Number
              <input type="tel" v-model="form.phone" />
            </label>
          </div>

          <label>
            <!-- {{ languageStore.t('howCanWeHelp') }} -->How can we help?
            <textarea v-model="form.message"></textarea>
          </label>

          <label>
            <!-- {{ languageStore.t('whatCanWeProvide') }} -->What can we provide?
            <textarea v-model="form.request"></textarea>
          </label>

          <button type="submit" class="submit-btn" :disabled="!isFormValid"><!-- {{ languageStore.t('submit') }} -->Submit</button>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import Sidebar from '../userprofileComponent/Sidebar.vue'
import { useLanguageStore } from '../stores/language'
import { useAuthStore } from '@/stores/auth'

const languageStore = useLanguageStore()
const authStore = useAuthStore()

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

const isFormValid = computed(() => {
  return form.firstName && form.lastName && form.email && form.phone && form.message && form.request
})

/* load user info */
onMounted(async () => {
  if (!authStore.user) {
    await authStore.refreshUser()
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
const submitForm = () => {
  console.log('Thank you. We will check it')

  submitted.value = true
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
