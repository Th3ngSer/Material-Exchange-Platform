<script setup>
import Sidebar from '@/userprofileComponent/Sidebar.vue'
</script>

<template>
  <div class="profile-layout">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main content -->
    <!-- <div class="p-6 text-black">
      <h1 class="text-xl font-bold">Testing Page</h1>
      <p>Click sidebar items to verify UI</p>
    </div> -->
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  font-family: 'Inter', sans-serif;
}
</style>

<style scoped>
.profile-layout {
  display: flex;
  height: 100vh;
  width: 100vw;        /* ✅ important */
  margin: 0;
  padding: 0;
  overflow: hidden;
}

/* remove any unwanted spacing */
.content {
  flex: 1;
  height: 100vh;
  background: white;
  overflow: hidden;
}
</style>