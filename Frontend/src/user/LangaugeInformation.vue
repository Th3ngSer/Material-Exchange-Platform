<template>
  <div class="language-page">
    <Sidebar />

    <div class="content">
      <h2 class="title"><!-- {{ languageStore.t('language') }} -->Language</h2>

      <form class="language-form" @submit.prevent="saveLanguage">
        <!-- Khmer option -->
        <label class="option">
          <input type="radio" value="Khmer" v-model="selectedLanguage" />
          <span><!-- {{ languageStore.t('khmer') }} -->Khmer</span>
        </label>

        <!-- English option -->
        <label class="option">
          <input type="radio" value="English" v-model="selectedLanguage" />
          <span><!-- {{ languageStore.t('english') }} -->English</span>
        </label>

        <!-- Save button -->
        <div class="form-actions">
          <button class="btn save" type="submit"><!-- {{ languageStore.t('save') }} -->Save</button>
        </div>
      </form>

      <!-- Visible feedback -->
      <p v-if="message" class="feedback">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '../userprofileComponent/Sidebar.vue'

const selectedLanguage = ref('English')
const message = ref('')

const saveLanguage = () => {
  if (!selectedLanguage.value) return
  const label = selectedLanguage.value === 'Khmer' ? 'Khmer' : 'English'
  message.value = `Language changed to ${label}`
}
</script>

<style scoped>
.language-page {
  display: flex;
  min-height: 100vh;
}

.content {
  flex: 1;
  padding: 32px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;
  color: #000000;
}

.language-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Option rows */
.option {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: #444343;
  transition:
    border-color 0.3s ease,
    background 0.3s ease;
}

.option input[type='radio'] {
  margin-right: 12px;
  accent-color: #000000; /* indigo radio button */
}

.option:hover {
  background: #f9f9f9;
  border-color: #000000;
}

.option input[type='radio']:checked + span {
  font-weight: bold;
  color: #1e1b4b;
}

.form-actions {
  margin-top: 24px;
}

/* Save button full width */
.btn.save {
  width: 100%;
  padding: 12px 28px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  font-size: 15px;
  background: #1e1b4b; /* dark indigo */
  color: #fff;
  cursor: pointer;
  transition:
    background 0.3s ease,
    transform 0.2s ease;
}

.btn.save:hover {
  background: #2a2566;
  transform: translateY(-2px);
}

.btn.save:active {
  background: #15133a;
  transform: translateY(0);
}

/* Feedback message */
.feedback {
  margin-top: 16px;
  font-size: 14px;
  font-weight: 500;
  color: #1e1b4b;
}
</style>
