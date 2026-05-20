<script setup lang="ts">
import NoResults from './NoResults.vue'

interface User {
  name: string
  avatar: string
  rating: number
  itemsCount: number
}

interface Props {
  users: User[]
  isLoading?: boolean
}

withDefaults(defineProps<Props>(), {
  isLoading: false
})
</script>

<template>
  <div class="mx-auto flex max-w-[870px] flex-col gap-4">
    <div v-if="users.length > 0" class="space-y-3">
      <div
        v-for="user in users"
        :key="user.name"
        class="flex items-center gap-4 rounded-2xl border border-[#dfe2f4] bg-white px-6 py-4 shadow-[0_2px_8px_rgba(15,23,42,0.08)] transition hover:border-[#1b1748] hover:shadow-[0_4px_12px_rgba(15,23,42,0.12)]"
      >
        <img
          :src="user.avatar"
          :alt="user.name"
          class="h-16 w-16 rounded-full object-cover"
        />
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-[#1b1748]">{{ user.name }}</h3>
          <div class="mt-1 flex items-center gap-4 text-sm text-[#7b7c98]">
            <span class="flex items-center gap-1">
              <svg viewBox="0 0 24 24" aria-hidden="true" class="h-4 w-4 fill-[#ff8c00]">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {{ user.rating.toFixed(1) }}
            </span>
            <span>{{ user.itemsCount }} item{{ user.itemsCount !== 1 ? 's' : '' }}</span>
          </div>
        </div>
        <button
          type="button"
          class="rounded-full bg-[#1b1748] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#242163]"
        >
          View Profile
        </button>
      </div>

      <div
        v-if="isLoading"
        class="flex items-center justify-center py-8 text-sm font-semibold text-[#6a6f93]"
        aria-hidden="true"
      >
        Loading more users...
      </div>
    </div>

    <NoResults
      v-else
      type="users"
      message="No users found"
      description="Try a different search term to find users."
    />
  </div>
</template>
