<script setup lang="ts">
/**
 * Login Page
 * Wrapper page for the login form component
 */

import LoginForm from '@/components/auth/LoginForm.vue'
import Logo from '@/assets/images/Logo.png'
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="login-page">
    
    <div class="login-shell">
      <button
        @click="goBack"
        aria-label="Go back"
        title="Back"
        class="absolute left-4 top-4 z-30 h-10 px-3 rounded-full bg-transparent text-[#12305f] flex items-center gap-2 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#12305f]"
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        <span class="font-medium">Back</span>
        <span class="sr-only">Back</span>
      </button>
      <section class="login-brand" aria-label="Brand">
        <div class="brand-content">
          <img :src="Logo" alt="Material Exchange logo" class="h-20 mb-8" />
          <p class="brand-tagline">
            an exchange online website platform
            that use for exchange everything.
          </p>
          <div class="brand-pill">Trade. Exchange. Borrow.</div>
        </div>
      </section>
      <section class="login-panel">
        <div class="form-wrap">
          <LoginForm />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  /* background: #171a6b; */
  background-image: url('@/assets/images/background.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  padding: 1.5rem;
  font-family: "Poppins", "Segoe UI", sans-serif;
  position: relative;
}

.login-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(115deg, rgba(9, 11, 55, 0.85), rgba(9, 11, 55, 0.55));
  z-index: 0;
}

.login-shell {
  width: 100%;
  max-width: 1100px;
  min-height: 560px;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(8, 10, 40, 0.45);
  background: rgba(10, 12, 55, 0.35);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
  z-index: 1;
}

.login-brand {
  background: rgba(224, 231, 238, 0.92);
  color: #1d1d1d;
  position: relative;
  display: flex;
  align-items: center;
  padding: 3.5rem;
  clip-path: polygon(0 0, 83% 0, 100% 50%, 83% 100%, 0 100%);
}

.brand-content {
  max-width: 320px;
}

.brand-title {
  font-size: clamp(3.5rem, 6vw, 7rem);
  margin: 0 0 1rem;
  letter-spacing: 1px;
  font-weight: 800;
}

.brand-primary {
  color: #12305f;
}

.brand-accent {
  color: #ff5c5c;
}

.brand-tagline {
  font-size: 1.15rem;
  line-height: 1.6rem;
  margin: 0;
  text-transform: lowercase;
  color: #22324a;
}

.brand-pill {
  display: inline-flex;
  margin-top: 1.75rem;
  padding: 0.45rem 1rem;
  border-radius: 999px;
  background: rgba(18, 48, 95, 0.12);
  color: #12305f;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.login-panel {
  background: rgba(10, 12, 55, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3.5rem 3rem;
}

.form-wrap {
  width: 100%;
  max-width: 360px;
}

@media (max-width: 900px) {
  .login-shell {
    grid-template-columns: 1fr;
  }

  .login-brand {
    clip-path: none;
    justify-content: center;
    text-align: center;
  }

  .brand-content {
    max-width: 480px;
  }

  .login-panel {
    padding: 2.5rem 2rem;
  }
}
</style>
