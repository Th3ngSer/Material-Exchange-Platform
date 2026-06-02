<template>
  <div class="personal-info">
    <Sidebar />

    <div class="content">
      <h2 class="title">{{ languageStore.t('personalInformation') }}</h2>

      <div class="info-form">
        <!-- Left column -->
        <div class="form-column">
          <div class="field">
            <span>{{ languageStore.t('firstName') }}</span>
            <p>{{ form.firstName }}</p>
          </div>

          <div class="field">
            <span>{{ languageStore.t('birthDate') }}</span>
            <p>{{ form.birthDate }}</p>
          </div>

          <div class="field">
            <span>{{ languageStore.t('nationality') }}</span>
            <p>{{ form.nationality }}</p>
          </div>

          <div class="field">
            <span>{{ languageStore.t('username') }}</span>
            <p>{{ form.username }}</p>
          </div>
        </div>

        <!-- Right column -->
        <div class="form-column">
          <div class="field">
            <span>{{ languageStore.t('lastName') }}</span>
            <p>{{ form.lastName }}</p>
          </div>

          <div class="field">
            <span>{{ languageStore.t('gender') }}</span>
            <p>{{ form.gender }}</p>
          </div>

          <div class="field">
            <span>{{ languageStore.t('phoneNumber') }}</span>
            <p>{{ form.phone }}</p>
          </div>

          <div class="field">
            <span>{{ languageStore.t('email') }}</span>
            <p>{{ form.email }}</p>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn edit" type="button" @click="goToEdit">{{ languageStore.t('editProfile') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '../userprofileComponent/Sidebar.vue'
import { useLanguageStore } from '../stores/language'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const languageStore = useLanguageStore()
const authStore = useAuthStore()

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

const loadProfile = async () => {
  if (!authStore.user) {
    await authStore.refreshUser()
  }

  fillFromAuthUser()
}

watch(
  () => authStore.user,
  () => {
    fillFromAuthUser()
  },
  { immediate: true, deep: true }
)

onMounted(async () => {
  await loadProfile()
})

const goToEdit = () => {
  router.push('/profile/edit')
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
