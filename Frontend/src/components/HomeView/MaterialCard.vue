<script setup lang="ts">
import chairImage from '@/assets/images/vergilChair.webp'

type Tone = 'gold' | 'orange' | 'rose'

defineProps<{
  item: {
    title: string
    price: string
    location: string
    category: string
    tone: Tone
  }
}>()

const categoryClasses: Record<Tone, string> = {
  gold: 'text-[#ffb54a]',
  orange: 'text-[#ffbf3f]',
  rose: 'text-[#ffb54a]',
}
</script>

<template>
  <article
    class="flex min-h-[304px] flex-col justify-between rounded-[10px] bg-[linear-gradient(180deg,#1b1a52_0%,#151441_100%)] px-3 py-4 text-white shadow-[0_18px_42px_rgba(21,20,65,0.22)]"
  >
    <div class="relative mb-2 grid h-[122px] place-items-center">
      <img
        :src="chairImage"
        alt="Chair item"
        class="h-[104px] w-[104px] object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.35)]"
      />
    </div>

    <div class="mb-3 border-l-2 border-white/20 pl-3">
      <p
        class="mb-1.5 text-[0.68rem] font-extrabold text-[#ffbf3f]"
        :class="categoryClasses[item.tone]"
      >
        {{ item.category }}
      </p>
      <h3 class="m-0 text-[0.9rem] leading-[1.2]">{{ item.title }}</h3>
      <p class="m-0 mt-1.5 text-[0.83rem] font-extrabold">Price: {{ item.price }}</p>
      <p class="m-0 mt-1 text-[0.74rem] text-white/72">{{ item.location }}</p>
    </div>

    <button
      type="button"
      class="w-full rounded-[8px] border-0 bg-[linear-gradient(180deg,#ffa31b_0%,#ff9300_100%)] px-3.5 py-2.5 text-[0.68rem] font-black uppercase tracking-[0.06em] text-[#23180f]"
    >
      View details
    </button>
  </article>
</template>
