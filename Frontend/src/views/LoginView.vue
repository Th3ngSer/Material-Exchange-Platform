<script setup lang="ts">
/**
 * Login Page
 * Wrapper page for the login form component
 */

import LoginForm from '@/components/auth/LoginForm.vue'
</script>

<template>
  <div class="login-page">
    <div class="login-shell">
      <section class="login-brand" aria-label="Brand">
        <div class="brand-content">
          <h1 class="brand-title">
            <span class="brand-primary">Do</span><span class="brand-accent">Ot</span>
          </h1>
          <p class="brand-tagline">
            an exchange online website platform
            that use for exchange everything.
          </p>
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
  background: #171a6b;
  /* background: #cfd7df; */
  padding: 1.5rem;
  font-family: "Poppins", "Segoe UI", sans-serif;
}

.login-shell {
  width: 100%;
  max-width: 1100px;
  min-height: 520px;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(8, 10, 40, 0.45);
}

.login-brand {
  background: #cfd7df;
  color: #1d1d1d;
  position: relative;
  display: flex;
  align-items: center;
  padding: 3rem;
  clip-path: polygon(0 0, 82% 0, 100% 50%, 82% 100%, 0 100%);
}

.brand-content {
  max-width: 320px;
}

.brand-title {
  font-size: clamp(2.5rem, 4vw, 3.4rem);
  margin: 0 0 1rem;
  letter-spacing: 1px;
  font-weight: 700;
}

.brand-primary {
  color: #12305f;
}

.brand-accent {
  color: #ff5c5c;
}

.brand-tagline {
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
  text-transform: lowercase;
}

.login-panel {
  background: #171a6b;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.5rem;
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
}
</style>
