<script setup lang="ts">
/**
 * Login Form Component
 * Handles user login with email and password
 * Connects to POST /auth/login endpoint
 */

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'
import { validateEmail } from '@/utils/validation'
import type { LoginCredentials } from '@/types/auth'

const router = useRouter()
const authStore = useAuthStore()
const languageStore = useLanguageStore()

// Form data
const email = ref('')
const password = ref('')

// Validation errors
const emailError = ref('')
const passwordError = ref('')

// Form state
const isSubmitting = ref(false)

/**
 * Validate email input
 */
function validateEmailInput() {
  emailError.value = validateEmail(email.value)
}

/**
 * Validate password input
 */
function validatePasswordInput() {
  if (!password.value) {
    passwordError.value = languageStore.t('passwordRequired')
  } else {
    passwordError.value = ''
  }
}

/**
 * Handle form submission
 */
async function handleSubmit() {
  // Validate all fields
  validateEmailInput()
  validatePasswordInput()

  if (emailError.value || passwordError.value) {
    return
  }

  isSubmitting.value = true
  authStore.clearError()

  try {
    const credentials: LoginCredentials = {
      email: email.value,
      password: password.value,
    }

    await authStore.login(credentials)

    // Clear form on success
    email.value = ''
    password.value = ''

    // Redirect to home or dashboard
    await router.push({ name: 'home' })
  } catch (err) {
    // Error is already set in authStore.error
    console.error('Login error:', err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="login-form">
    <h2>{{ languageStore.t('login') }}</h2>

    <!-- Error Display -->
    <div v-if="authStore.error" class="error-message" role="alert">
      {{ authStore.error }}
    </div>

    <!-- Email Input -->
    <div class="form-group">
      <label for="email">{{ languageStore.t('emailAddress') }}</label>
      <input
        id="email"
        v-model="email"
        type="email"
        :placeholder="languageStore.t('emailAddress')"
        :disabled="isSubmitting || authStore.isLoading"
        @blur="validateEmailInput"
      />
      <span v-if="emailError" class="field-error">{{ emailError }}</span>
    </div>

    <!-- Password Input -->
    <div class="form-group">
      <label for="password">{{ languageStore.t('password') }}</label>
      <input
        id="password"
        v-model="password"
        type="password"
        :placeholder="languageStore.t('password')"
        :disabled="isSubmitting || authStore.isLoading"
        @blur="validatePasswordInput"
      />
      <span v-if="passwordError" class="field-error">{{ passwordError }}</span>
    </div>

    <!-- Submit Button -->
    <button type="submit" :disabled="isSubmitting || authStore.isLoading" class="submit-button">
      <span v-if="isSubmitting || authStore.isLoading" class="loading-spinner"></span>
      {{ isSubmitting || authStore.isLoading ? languageStore.t('loggingIn') : languageStore.t('login') }}
    </button>

    <!-- Link to Sign-Up -->
    <div class="form-footer">
      <p>
        {{ languageStore.t('dontHaveAccount') }}
        <RouterLink to="/signup">{{ languageStore.t('signUpHere') }}</RouterLink>
      </p>
    </div>
  </form>
</template>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

input {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}

.field-error {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #e74c3c;
}

.error-message {
  padding: 0.75rem;
  margin-bottom: 1rem;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  color: #c00;
  font-size: 0.9rem;
}

.submit-button {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background-color: #4a90e2;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  background-color: #357abd;
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.7;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.form-footer {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
}

.form-footer a {
  color: #4a90e2;
  text-decoration: none;
  font-weight: 500;
}

.form-footer a:hover {
  text-decoration: underline;
}
</style>
