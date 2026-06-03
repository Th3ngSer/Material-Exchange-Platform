<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    score?: number
    size?: 'sm' | 'md' | 'lg'
    readonly?: boolean
    interactive?: boolean
  }>(),
  {
    score: 0,
    size: 'md',
    readonly: false,
    interactive: false,
  }
)

const emit = defineEmits<{
  (e: 'select', score: number): void
}>()

const hoverScore = ref(0)

const starSize = computed(() => {
  const sizes = { sm: 16, md: 24, lg: 32 }
  return sizes[props.size]
})

const handleMouseEnter = (score: number) => {
  if (props.interactive && !props.readonly) {
    hoverScore.value = score
  }
}

const handleMouseLeave = () => {
  hoverScore.value = 0
}

const handleClick = (score: number) => {
  if (props.interactive && !props.readonly) {
    emit('select', score)
  }
}

const displayScore = computed(() => hoverScore.value || props.score || 0)
</script>

<template>
  <div class="star-rating" :class="[size, { interactive, readonly }]">
    <div class="stars">
      <span
        v-for="i in 5"
        :key="i"
        class="star"
        :class="{ filled: i <= displayScore }"
        :style="{ width: `${starSize}px`, height: `${starSize}px` }"
        @mouseenter="handleMouseEnter(i)"
        @mouseleave="handleMouseLeave"
        @click="handleClick(i)"
      >
        ★
      </span>
    </div>
  </div>
</template>

<style scoped>
.star-rating {
  display: inline-flex;
  align-items: center;
}

.stars {
  display: flex;
  gap: 4px;
}

.star {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ccc;
  cursor: default;
  user-select: none;
  transition: color 0.2s;
  font-size: inherit;
}

.star-rating.interactive .star {
  cursor: pointer;
}

.star.filled {
  color: #fbbf24;
}

.star-rating.interactive:not(.readonly) .star:hover,
.star-rating.interactive:not(.readonly) .star.filled {
  color: #fbbf24;
}

.star-rating.readonly .star {
  cursor: default;
}

.star-rating.sm .star {
  font-size: 16px;
}

.star-rating.md .star {
  font-size: 24px;
}

.star-rating.lg .star {
  font-size: 32px;
}
</style>
