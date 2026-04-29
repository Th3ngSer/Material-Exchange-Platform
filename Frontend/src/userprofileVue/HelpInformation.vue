<template>
  <div class="help-page">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <div class="content">
      <section class="troubleshoot">
        <h1>Troubleshoot</h1>
        <p>Get help with common issues and troubleshoot unexpected behavior.</p>
      </section>

      <section class="support">
        <h2>Work with Support</h2>
        <p>
          Submit a bug report, get help collecting log files, and find your system information.
        </p>
      </section>

      <section class="contact-form">
        <h2>Contact Us</h2>

        <!-- ✅ SUCCESS MESSAGE -->
        <p v-if="submitted" class="success-msg">
          Thank you for your submit!! We will check as soon as possible.
        </p>

        <form v-if="!submitted" @submit.prevent="submitForm">
          <div class="form-row">
            <label>
              First Name
              <input type="text" v-model="form.firstName" />
            </label>

            <label>
              Last Name
              <input type="text" v-model="form.lastName" />
            </label>
          </div>

          <div class="form-row">
            <label>
              Email Address
              <input type="email" v-model="form.email" />
            </label>

            <label>
              Phone Number
              <input type="tel" v-model="form.phone" />
            </label>
          </div>

          <label>
            How can we help you?
            <textarea v-model="form.message"></textarea>
          </label>

          <label>
            What can we provide to you?
            <textarea v-model="form.request"></textarea>
          </label>

          <!-- ✅ Disabled until all fields filled -->
          <button
            type="submit"
            class="submit-btn"
            :disabled="!isFormValid"
          >
            Submit
          </button>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import Sidebar from '@/userprofileComponent/Sidebar.vue'

/* form */
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  message: '',
  request: ''
})

/* submit state */
const submitted = ref(false)

/* ✅ VALIDATION */
const isFormValid = computed(() => {
  return (
    form.firstName &&
    form.lastName &&
    form.email &&
    form.phone &&
    form.message &&
    form.request
  )
})

/* load user info */
onMounted(() => {
  const saved = localStorage.getItem('profile')

  if (saved) {
    const profile = JSON.parse(saved)

    form.firstName = profile.firstName || ''
    form.lastName = profile.lastName || ''
    form.email = profile.email || ''
    form.phone = profile.phone || ''
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