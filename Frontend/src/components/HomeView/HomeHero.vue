<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

interface HeroSlide {
  image: string
  title: string
  accent: string
}

const slides: HeroSlide[] = [
  {
    image:
      'https://cdn11.bigcommerce.com/s-6yzvyy2b/images/stencil/1280x1280/products/129305/335368/0140510525_fen_ins_frt_1_rr__18615.1734992258.png?c=2',
    title: 'XChange Material',
    accent: 'X',
  },
  {
    image:
      'https://png.pngtree.com/png-vector/20250522/ourmid/pngtree-modern-laptop-computer-with-screen-open-technology-digital-device-png-image_16345445.png',
    title: 'XChange Material',
    accent: 'X',
  },
  {
    image:
      'https://static.vecteezy.com/system/resources/thumbnails/024/819/248/small/fat-cycle-fat-bike-fat-bicycle-fat-tire-cycle-fat-tire-bike-transparent-background-ai-generated-png.png',
    title: 'XChange Material',
    accent: 'X',
  },
]

const currentSlide = ref(0)
let autoplayTimer: ReturnType<typeof window.setInterval> | undefined

const activeSlide = computed(() => slides[currentSlide.value] ?? slides[0]!)

function goToSlide(index: number) {
  currentSlide.value = index
}

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % slides.length
}

onMounted(() => {
  if (slides.length > 1) {
    autoplayTimer = window.setInterval(nextSlide, 5000)
  }
})

onBeforeUnmount(() => {
  if (autoplayTimer) {
    window.clearInterval(autoplayTimer)
  }
})
</script>

<template>
  <section
    class="relative grid min-h-[560px] grid-cols-[minmax(0,1fr)_minmax(430px,1fr)] bg-[#131138] shadow-[0_28px_70px_rgba(14,18,31,0.35)] max-[960px]:min-h-0 max-[960px]:grid-cols-1"
  >
    <div
      class="flex flex-col justify-center gap-6 px-[48px] py-[44px] text-white max-[960px]:px-6 max-[960px]:pt-9"
    >
      <h1
        class="m-0 text-[clamp(2.25rem,5.2vw,3.9rem)] font-black leading-[0.93] tracking-[-0.03em] text-[#f1f2f4]"
      >
        <span class="text-[#ff4c45]">{{ activeSlide.accent }}</span
        >{{ activeSlide.title.slice(1) }}
      </h1>
      <p
        class="max-w-[560px] text-[clamp(0.95rem,1.2vw,1.25rem)] font-semibold leading-[1.7] text-white/90"
      >
        <!-- {{ languageStore.t('heroDescription') }} -->A secure platform to buy, sell, exchange, lend, and borrow materials.
      </p>

      <div class="flex flex-wrap justify-start gap-5">
        <a
          class="inline-flex min-w-[220px] items-center justify-center rounded-[12px] border border-white/85 bg-[#f23838] px-7 py-3 text-[1.15rem] font-bold text-white no-underline shadow-[0_16px_26px_rgba(255,75,66,0.24)] transition hover:-translate-y-0.5 max-[960px]:min-w-[190px] max-[960px]:text-[1rem]"
          href="#categories"
          ><!-- {{ languageStore.t('browse') }} -->Browse</a
        >
        <a
          class="inline-flex min-w-[220px] items-center justify-center rounded-[12px] border border-white/35 bg-[#5f6572]/95 px-7 py-3 text-[1.15rem] font-bold text-white/88 no-underline transition hover:-translate-y-0.5 max-[960px]:min-w-[190px] max-[960px]:text-[1rem]"
          href="#listings"
          ><!-- {{ languageStore.t('learnMore') }} -->Learn more</a
        >
      </div>
    </div>

    <div
      class="grid place-items-center px-6 pb-14 pt-10 max-[960px]:order-first max-[960px]:pb-6 max-[960px]:pt-6"
    >
      <div
        class="relative flex h-[400px] max-w-full items-center justify-center overflow-hidden max-[960px]:h-[260px] max-[960px]:w-[320px]"
      >
        <div class="pointer-events-none absolute inset-4"></div>
        <img
          :src="activeSlide.image"
          :alt="activeSlide.title"
          class="h-full w-full object-contain p-2 transition-opacity duration-700"
        />
      </div>
    </div>

    <div
      class="pointer-events-auto absolute bottom-6 left-1/2 flex -translate-x-1/2 justify-center gap-3 max-[960px]:bottom-3"
    >
      <button
        v-for="(slide, index) in slides"
        :key="`${slide.image}-${index}`"
        type="button"
        class="h-[18px] w-[18px] rounded-full border-[3px] border-white/90 transition"
        :class="index === currentSlide ? 'bg-transparent' : 'bg-white/95 border-transparent'"
        :aria-label="`Go to slide ${index + 1}`"
        @click="goToSlide(index)"
      />
    </div>
  </section>
</template>
