<script setup lang="ts">
/**
 * Sign-Up Form Component
 * Handles user registration with email, password, and password confirmation
 * Includes password strength indicator
 * Connects to POST /auth/register endpoint
 */

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'
import { validateEmail, validatePassword, validatePasswordMatch } from '@/utils/validation'
import type { RegisterCredentials } from '@/types/auth'

const router = useRouter()
const authStore = useAuthStore()
const languageStore = useLanguageStore()

// Form data
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

// Validation errors
const firstNameError = ref('')
const lastNameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const successMessage = ref('')

// Form state
const isSubmitting = ref(false)
const hasSubmitted = ref(false)

/**
 * Validate email input
 */
function validateEmailInput() {
  emailError.value = validateEmail(email.value.trim())
}

function validateFirstNameInput() {
  if (!firstName.value.trim()) {
    firstNameError.value = 'First name is required'
  } else {
    firstNameError.value = ''
  }
}

function validateLastNameInput() {
  if (!lastName.value.trim()) {
    lastNameError.value = 'Last name is required'
  } else {
    lastNameError.value = ''
  }
}

/**
 * Validate password input
 */
function validatePasswordInput() {
  passwordError.value = validatePassword(password.value)
}

/**
 * Validate confirm password input
 */
function validateConfirmPasswordInput() {
  confirmPasswordError.value = validatePasswordMatch(password.value, confirmPassword.value)
}

/**
 * Handle form submission
 */
async function handleSubmit() {
  hasSubmitted.value = true
  successMessage.value = ''
  // Validate all fields
  validateFirstNameInput()
  validateLastNameInput()
  validateEmailInput()
  validatePasswordInput()
  validateConfirmPasswordInput()

  if (firstNameError.value || lastNameError.value || emailError.value || passwordError.value || confirmPasswordError.value) {
    return
  }

  isSubmitting.value = true
  authStore.clearError()

  try {
    const credentials: RegisterCredentials = {
      name: `${firstName.value.trim()} ${lastName.value.trim()}`.trim(),
      email: email.value.trim(),
      password: password.value,
      confirmPassword: confirmPassword.value,
    }

    await authStore.register(credentials)

    // Clear form on success
    firstName.value = ''
    lastName.value = ''
    email.value = ''
    password.value = ''
    confirmPassword.value = ''

    successMessage.value = 'Account created successfully. Redirecting to login...'

    // Redirect to login after successful sign-up
    setTimeout(() => {
      router.push({ name: 'login' })
    }, 1200)
  } catch (err) {
    // Error is already set in authStore.error
    console.error('Registration error:', err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="signup-form">
    <h1 style="font-weight: bold;">{{ languageStore.t('createAccount') }}</h1>

    <!-- Error Display -->
    <div v-if="authStore.error" class="error-message" role="alert">
      {{ authStore.error }}
    </div>

    <!-- Success Display -->
    <div v-if="successMessage" class="success-message" role="status">
      {{ successMessage }}
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="firstName">{{ languageStore.t('firstName') }}</label>
        <input
          id="firstName"
          v-model="firstName"
          type="text"
          :placeholder="languageStore.t('firstName')"
          :disabled="isSubmitting || authStore.isLoading"
          @blur="validateFirstNameInput"
          @input="firstNameError = ''"
        />
        <span v-if="firstNameError && hasSubmitted" class="field-error">{{ firstNameError }}</span>
      </div>

      <div class="form-group">
        <label for="lastName">{{ languageStore.t('lastName') }}</label>
        <input
          id="lastName"
          v-model="lastName"
          type="text"
          :placeholder="languageStore.t('lastName')"
          :disabled="isSubmitting || authStore.isLoading"
          @blur="validateLastNameInput"
          @input="lastNameError = ''"
        />
        <span v-if="lastNameError && hasSubmitted" class="field-error">{{ lastNameError }}</span>
      </div>
    </div>

    <!-- Email Input -->
    <div class="form-group">
      <label for="email">{{ languageStore.t('enterYourEmail') }}</label>
      <input
        id="email"
        v-model="email"
        type="email"
        :placeholder="languageStore.t('enterYourEmail')"
        :disabled="isSubmitting || authStore.isLoading"
        @blur="validateEmailInput"
        @input="emailError = ''"
      />
      <span v-if="emailError && hasSubmitted" class="field-error">{{ emailError }}</span>
    </div>

    <!-- Password Input -->
    <div class="form-group">
      <label for="password">{{ languageStore.t('enterYourPassword') }}</label>
      <input
        id="password"
        v-model="password"
        type="password"
        :placeholder="languageStore.t('enterYourPassword')"
        :disabled="isSubmitting || authStore.isLoading"
        @blur="validatePasswordInput"
        @input="passwordError = ''"
      />
      <span v-if="passwordError && hasSubmitted" class="field-error">{{ passwordError }}</span>
    </div>

    <!-- Confirm Password Input -->
    <div class="form-group">
      <label for="confirmPassword">{{ languageStore.t('confirmYourPassword') }}</label>
      <input
        id="confirmPassword"
        v-model="confirmPassword"
        type="password"
        :placeholder="languageStore.t('confirmYourPassword')"
        :disabled="isSubmitting || authStore.isLoading"
        @blur="validateConfirmPasswordInput"
        @input="confirmPasswordError = ''"
      />
      <span v-if="confirmPasswordError && hasSubmitted" class="field-error">{{ confirmPasswordError }}</span>
    </div>

    <!-- Submit Button -->
    <button
      type="submit"
      :disabled="isSubmitting || authStore.isLoading"
      class="submit-button"
    >
      <span v-if="isSubmitting || authStore.isLoading" class="loading-spinner"></span>
      {{ isSubmitting || authStore.isLoading ? languageStore.t('creatingAccount') : languageStore.t('createAccount') }}
    </button>

    <!-- Link to Login -->
    <div class="form-footer">
      <p>
        {{ languageStore.t('alreadyHaveAccount') }}
        <RouterLink to="/login">{{ languageStore.t('loginHere') }}</RouterLink>
      </p>
    </div>
  </form>
</template>

<style scoped>
.signup-form {
  max-width: 400px;
  margin: 0;
  padding: 2rem;
  border: 5px;
  border-radius: 16px;
  background-color: #e7ecf1;
  box-shadow: 0 16px 30px rgba(8, 10, 40, 0.25);
}

h1 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #1b1b1b;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

@media (max-width: 520px) {
  .form-row {
    grid-template-columns: 1fr;
  }
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

.success-message {
  padding: 0.75rem;
  margin-bottom: 1rem;
  background-color: #e9f7ef;
  border: 1px solid #c9efd9;
  border-radius: 4px;
  color: #1e7e34;
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
  border-radius: 8px;
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
