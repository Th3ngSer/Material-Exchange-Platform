<script setup lang="ts">
/**
 * Sign-Up Form Component
 * Handles user registration with email, password, and password confirmation
 * Includes password strength indicator
 * Connects to POST /auth/register endpoint
 */

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLanguageStore } from '@/stores/language'
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  checkPasswordStrength,
} from '@/utils/validation'
import type { RegisterCredentials } from '@/types/auth'

const router = useRouter()
const authStore = useAuthStore()
const languageStore = useLanguageStore()

// Form data
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

// Validation errors
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

// Form state
const isSubmitting = ref(false)

// Password strength
const passwordStrength = computed(() => checkPasswordStrength(password.value))
const strengthColor = computed(() => {
  if (passwordStrength.value === 'weak') return '#e74c3c'
  if (passwordStrength.value === 'medium') return '#f39c12'
  return '#27ae60'
})

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
  // Validate all fields
  validateEmailInput()
  validatePasswordInput()
  validateConfirmPasswordInput()

  if (emailError.value || passwordError.value || confirmPasswordError.value) {
    return
  }

  isSubmitting.value = true
  authStore.clearError()

  try {
    const credentials: RegisterCredentials = {
      email: email.value,
      password: password.value,
      confirmPassword: confirmPassword.value,
    }

    await authStore.register(credentials)

    // Clear form on success
    email.value = ''
    password.value = ''
    confirmPassword.value = ''

    // Redirect to home or dashboard
    await router.push({ name: 'home' })
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
    <h2>{{ languageStore.t('createAccount') }}</h2>

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

    <!-- Password Input with Strength Indicator -->
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

      <!-- Password Strength Indicator -->
      <div v-if="password" class="strength-indicator">
        <div class="strength-bar">
          <div
            class="strength-fill"
            :style="{
              width:
                passwordStrength === 'weak'
                  ? '33%'
                  : passwordStrength === 'medium'
                    ? '66%'
                    : '100%',
              backgroundColor: strengthColor,
            }"
          ></div>
        </div>
        <span class="strength-label" :style="{ color: strengthColor }">
          {{ languageStore.t('strength') }}:
          <strong>{{ languageStore.t(passwordStrength) }}</strong>
        </span>
      </div>
    </div>

    <!-- Confirm Password Input -->
    <div class="form-group">
      <label for="confirmPassword">{{ languageStore.t('confirmPassword') }}</label>
      <input
        id="confirmPassword"
        v-model="confirmPassword"
        type="password"
        :placeholder="languageStore.t('confirmPassword')"
        :disabled="isSubmitting || authStore.isLoading"
        @blur="validateConfirmPasswordInput"
      />
      <span v-if="confirmPasswordError" class="field-error">{{ confirmPasswordError }}</span>
    </div>

    <!-- Submit Button -->
    <button type="submit" :disabled="isSubmitting || authStore.isLoading" class="submit-button">
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
  max-width: 500px;
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

.strength-indicator {
  margin-top: 0.75rem;
}

.strength-bar {
  height: 4px;
  background-color: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.strength-fill {
  height: 100%;
  transition:
    width 0.3s,
    background-color 0.3s;
}

.strength-label {
  font-size: 0.85rem;
  font-weight: 500;
}

.requirements {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.requirement-title {
  margin: 0 0 0.5rem 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: #666;
}

.requirements ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.requirements li {
  font-size: 0.85rem;
  color: #999;
  margin: 0.25rem 0;
  position: relative;
  padding-left: 1.5rem;
}

.requirements li:before {
  content: '○';
  position: absolute;
  left: 0;
  color: #ccc;
}

.requirements li.met {
  color: #27ae60;
  font-weight: 500;
}

.requirements li.met:before {
  content: '✓';
  color: #27ae60;
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
