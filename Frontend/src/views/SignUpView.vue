<script setup lang="ts">
/**
 * Sign-Up Page
 * Wrapper page for the sign-up form component
 */

import SignUpForm from '@/components/auth/SignUpForm.vue'
</script>

<template>
  <div class="signup-page">
    <div class="container">
      <SignUpForm />
    </div>
  </div>
</template>

<style scoped>
.signup-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.container {
  width: 100%;
}
</style>
