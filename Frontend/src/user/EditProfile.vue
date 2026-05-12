<template>
  <div class="personal-info">
    <Sidebar />

    <div class="content">
      <h2 class="title">Edit Profile</h2>

      <div class="info-form">
        <!-- Left column -->
        <div class="form-column">
          <div class="field">
            <span>First Name</span>
            <input v-model="form.firstName" type="text" />
          </div>

          <div class="field">
            <span>Birth of date</span>
            <input v-model="form.birthDate" type="date" />
          </div>

          <div class="field">
            <span>Nationality</span>
            <input v-model="form.nationality" type="text" />
          </div>

          <div class="field">
            <span>Username</span>
            <input v-model="form.username" type="text" />
          </div>
        </div>

        <!-- Right column -->
        <div class="form-column">
          <div class="field">
            <span>Last Name</span>
            <input v-model="form.lastName" type="text" />
          </div>

          <!-- Gender -->
          <div class="field">
            <span>Gender</span>

            <div class="gender-options">
              <label>
                <input v-model="form.gender" type="radio" value="Male" />
                Male
              </label>

              <label>
                <input v-model="form.gender" type="radio" value="Female" />
                Female
              </label>
            </div>
          </div>

          <div class="field">
            <span>Phone Number</span>
            <input v-model="form.phone" type="tel" />
          </div>

          <div class="field">
            <span>Email</span>
            <input v-model="form.email" type="email" />
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn" @click="saveProfile">Save Changes</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/userprofileComponent/Sidebar.vue'

const router = useRouter()

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

onMounted(() => {
  const saved = localStorage.getItem('profile')
  if (saved) {
    Object.assign(form, JSON.parse(saved))
  }
})

const saveProfile = () => {
  localStorage.setItem('profile', JSON.stringify(form))
  router.push('/personal-info')
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
}
</style>
