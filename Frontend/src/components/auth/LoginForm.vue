<script setup lang="ts">
/**
 * Login Form Component
 * Handles user login with email and password
 * Connects to POST /auth/login endpoint
 */

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { validateEmail } from '@/utils/validation'
import type { LoginCredentials } from '@/types/auth'

const router = useRouter()
const authStore = useAuthStore()

// Form data
const email = ref('')
const password = ref('')

// Validation errors
const emailError = ref('')
const passwordError = ref('')

// Form state
const isSubmitting = ref(false)
const hasSubmitted = ref(false)

/**
 * Validate email input
 */
function validateEmailInput() {
  emailError.value = validateEmail(email.value.trim())
}

/**
 * Validate password input
 */
function validatePasswordInput() {
  if (!password.value.trim()) {
    passwordError.value = 'Password is required'
  } else {
    passwordError.value = ''
  }
}

/**
 * Handle form submission
 */
async function handleSubmit() {
  hasSubmitted.value = true
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
      email: email.value.trim(),
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
    <h1 style="font-weight:bold;">Login into DoOt</h1>

    <!-- Error Display -->
    <div v-if="authStore.error" class="error-message" role="alert">
      {{ authStore.error }}
    </div>

    <!-- Email Input -->
    <div class="form-group">
      <label for="email" >Enter your Email</label>
      <input
        id="email"
        v-model="email"
        type="email"
        placeholder="Enter your email"
        :disabled="isSubmitting || authStore.isLoading"
        @blur="validateEmailInput"
        @input="emailError = ''"
      />
      <span v-if="emailError && hasSubmitted" class="field-error">{{ emailError }}</span>
    </div>

    <!-- Password Input -->
    <div class="form-group">
      <label for="password">Password</label>
      <input
        id="password"
        v-model="password"
        type="password"
        placeholder="Enter your password"
        :disabled="isSubmitting || authStore.isLoading"
        @blur="validatePasswordInput"
        @input="passwordError = ''"
      />
      <span v-if="passwordError && hasSubmitted" class="field-error">{{ passwordError }}</span>
    </div>

    <!-- Submit Button -->
    <button
      type="submit"
      :disabled="isSubmitting || authStore.isLoading"
      class="submit-button"
    >
      <span v-if="isSubmitting || authStore.isLoading" class="loading-spinner"></span>
      {{ isSubmitting || authStore.isLoading ? 'Logging in...' : 'Login' }}
    </button>

    <!-- Link to Sign-Up -->
    <div class="form-footer">
      <p>
        Don't have an account?
        <RouterLink to="/signup">Sign up here</RouterLink>
      </p>
    </div>
  </form>
</template>

<style scoped>
.login-form {
  max-width: 360px;
  margin: 0;
  padding: 2rem;
  border: 5px;
  border-radius: 16px;
  background-color: #e7ecf1;
  box-shadow: 0 16px 30px rgba(8, 10, 40, 0.25);
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #1b1b1b;
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
  border: none;
  border-radius: 8px;
  box-sizing: border-box;
  transition: border-color 0.3s;
  background-color: #f7f9fb;
}

input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(28, 31, 88, 0.15);
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
  padding: 0.85rem 1rem;
  margin-bottom: 1rem;
  background-color: #ffeef2;
  border: 1px solid #f7c6d3;
  border-radius: 12px;
  color: #8a1d3f;
  font-size: 0.9rem;
  box-shadow: 0 8px 16px rgba(138, 29, 63, 0.08);
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
