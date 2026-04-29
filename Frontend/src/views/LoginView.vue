<script setup lang="ts">
/**
 * Login Page
 * Wrapper page for the login form component
 */

import LoginForm from '@/components/auth/LoginForm.vue'
</script>

<template>
  <div class="login-page">
    <div class="container">
      <LoginForm />
    </div>
  </div>
</template>

<style scoped>
.login-page {
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
