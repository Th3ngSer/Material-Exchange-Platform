<script setup lang="ts">
/**
 * Sign-Up Page
 * Wrapper page for the sign-up form component
 */

import SignUpForm from '@/components/auth/SignUpForm.vue'
import Logo from '@/assets/images/Logo.png'
</script>

<template>
  <div class="signup-page">
    <div class="signup-shell">
      <section class="signup-brand" aria-label="Brand">
        <div class="brand-content">
          <img :src="Logo" alt="Material Exchange logo" class="h-20 mb-20" />
          <p class="brand-tagline">
            an exchange online website platform
            that use for exchange everything.
          </p>
          <div class="brand-pill">Trade. Exchange. Borrow.</div>
        </div>
      </section>
      <section class="signup-panel">
        <div class="form-wrap">
          <SignUpForm />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.signup-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  /* background: #171a6b;*/
  background-image: url('@/assets/images/background.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  padding: 1.5rem;
  font-family: "Poppins", "Segoe UI", sans-serif;
  position: relative;
}

.signup-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(115deg, rgba(9, 11, 55, 0.85), rgba(9, 11, 55, 0.55));
  z-index: 0;
}

.signup-shell {
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

.signup-brand {
  background: rgba(224, 231, 238, 0.92);
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

.signup-panel {
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
  .signup-shell {
    grid-template-columns: 1fr;
  }

  .signup-brand {
    clip-path: none;
    justify-content: center;
    text-align: center;
  }

  .brand-content {
    max-width: 480px;
  }

  .signup-panel {
    padding: 2.5rem 2rem;
  }
}
</style>
