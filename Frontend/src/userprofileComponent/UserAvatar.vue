<template>
  <div class="avatar-container">
    <!-- Avatar Image -->
    <img :src="previewImage" class="avatar" />

    <!-- Change Photo Button -->
    <p class="change-photo" @click="triggerFile">Change photo</p>

    <!-- Welcome Text -->
    <div class="avatar-text">
      <p class="welcome">Welcome, {{ name }} !!!</p>
    </div>

    <!-- Hidden File Input -->
    <input ref="fileInput" type="file" accept="image/*" @change="onFileChange" hidden />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted } from 'vue'

export default defineComponent({
  props: {
    name: String,
    image: String,
  },
  setup(props) {
    const fileInput = ref<HTMLInputElement | null>(null)
    const previewImage = ref(props.image || '')

    const triggerFile = () => {
      fileInput.value?.click()
    }

    const onFileChange = (event: Event) => {
      const target = event.target as HTMLInputElement
      const file = target.files?.[0]
      if (!file) return

      const reader = new FileReader()

      reader.onload = () => {
        previewImage.value = reader.result as string
        localStorage.setItem('avatar', previewImage.value)
      }

      reader.readAsDataURL(file)
    }

    onMounted(() => {
      const saved = localStorage.getItem('avatar')
      if (saved) {
        previewImage.value = saved
      }
    })

    watch(
      () => props.image,
      (newVal) => {
        if (newVal) previewImage.value = newVal
      },
    )

    return {
      fileInput,
      previewImage,
      triggerFile,
      onFileChange,
    }
  },
})
</script>

<style scoped>
.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* Avatar image */
.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

/* Change photo */
.change-photo {
  font-size: 12px;
  color: #60a5fa;
  cursor: pointer;
  margin-top: 6px;
  margin-bottom: 6px;
}

.change-photo:hover {
  text-decoration: underline;
}

/* Welcome text */
.avatar-text .welcome {
  font-size: 24px;
  font-weight: bold;
  color: #cbd5e1;
  text-align: center;
}
</style>
