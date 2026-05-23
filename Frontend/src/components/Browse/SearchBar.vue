<script setup lang="ts">
interface Props {
  modelValue: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <form
    class="grid flex-1 grid-cols-[1fr_42px] items-center overflow-hidden rounded-[8px] border border-[#2b2f9161] bg-[#f4f5fb] shadow-[0_6px_20px_rgba(25,28,90,0.06)]"
    role="search"
  >
    <label class="sr-only" for="browse-search">Search materials</label>
    <input
      id="browse-search"
      :value="modelValue"
      type="search"
      placeholder="Search materials"
      class="min-w-0 border-0 bg-transparent px-3 outline-none"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <button
      type="submit"
      aria-label="Search"
      class="grid h-[34px] w-[42px] place-items-center border-0 bg-transparent text-[#201f62] cursor-pointer hover:bg-[#f0f1ff] transition-colors duration-200"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" class="h-[25px] w-[25px] fill-current">
        <path
          d="M10.5 4a6.5 6.5 0 1 0 4.07 11.57l4.43 4.43 1.4-1.41-4.43-4.43A6.5 6.5 0 0 0 10.5 4Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z"
        />
      </svg>
    </button>
  </form>
</template>
