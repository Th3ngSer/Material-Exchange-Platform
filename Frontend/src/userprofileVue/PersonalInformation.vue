<template>
  <div class="personal-info">
    <Sidebar />

    <div class="content">
      <h2 class="title">Personal Profile</h2>

      <div class="info-form">
        <!-- Left column -->
        <div class="form-column">
          <div class="field">
            <span>First Name</span>
            <p>{{ form.firstName }}</p>
          </div>

          <div class="field">
            <span>Birth of date</span>
            <p>{{ form.birthDate }}</p>
          </div>

          <div class="field">
            <span>Nationality</span>
            <p>{{ form.nationality }}</p>
          </div>

          <div class="field">
            <span>Username</span>
            <p>{{ form.username }}</p>
          </div>
        </div>

        <!-- Right column -->
        <div class="form-column">
          <div class="field">
            <span>Last Name</span>
            <p>{{ form.lastName }}</p>
          </div>

          <div class="field">
            <span>Gender</span>
            <p>{{ form.gender }}</p>
          </div>

          <div class="field">
            <span>Phone Number</span>
            <p>{{ form.phone }}</p>
          </div>

          <div class="field">
            <span>Email</span>
            <p>{{ form.email }}</p>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn edit" type="button" @click="goToEdit">
          Edit Profile
        </button>
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
  email: ''
})

/* Load data from localStorage */
const loadProfile = () => {
  const saved = localStorage.getItem('profile')

  if (saved) {
    Object.assign(form, JSON.parse(saved))
  }
}

onMounted(() => {
  loadProfile()
})

const goToEdit = () => {
  router.push('/edit-profile')
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
}

.field p {
  margin: 6px 0 0;
  font-size: 14px;
  font-weight: 500;
}

/* button */
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