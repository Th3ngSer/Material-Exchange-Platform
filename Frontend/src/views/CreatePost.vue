<script setup lang="ts">
import { reactive, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useLanguageStore } from '@/stores/language'

// ─── Types ────────────────────────────────────────────────────────────────────
type ListingType = 'Sell' | 'Exchange' | 'Lend'
type Condition = 'New' | 'Used'

interface FormState {
  type: ListingType
  title: string
  description: string
  category: string
  condition: Condition
  price: string
  exchangeFor: string
  phone: string
  email: string
  location: string
  images: File[]
}

interface FormErrors {
  title?: string
  description?: string
  category?: string
  price?: string
  exchangeFor?: string
  contact?: string
  location?: string
  images?: string
}

// ─── State ────────────────────────────────────────────────────────────────────
const step = ref<1 | 2>(1)
const isLoading = ref(false)
const submitted = ref(false)
const submitError = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const activeThumb = ref(0)
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const router = useRouter()
const languageStore = useLanguageStore()

const form = reactive<FormState>({
  type: 'Sell',
  title: '',
  description: '',
  category: '',
  condition: 'New',
  price: '',
  exchangeFor: '',
  phone: '',
  email: '',
  location: '',
  images: [],
})

const errors = reactive<FormErrors>({})
const previewUrls = ref<string[]>([])

// ─── Computed ─────────────────────────────────────────────────────────────────
const activeImage = computed(() => previewUrls.value[activeThumb.value] ?? '')
const errorCount = computed(() => Object.keys(errors).length)
const today = computed(() => new Date().toLocaleDateString('en-GB'))

const displayPrice = computed(() => {
  if (form.type === 'Sell') return form.price ? `$${parseFloat(form.price).toFixed(2)}` : '$0.00'
  if (form.type === 'Lend')
    return form.price ? `$${parseFloat(form.price).toFixed(2)}/day` : '$0.00/day'
  if (form.type === 'Exchange') return 'Open to trade'
  return ''
})

const typeBadgeClass = computed(
  () =>
    ({
      Sell: 'bg-red-100 text-red-600',
      Exchange: 'bg-indigo-100 text-indigo-600',
      Lend: 'bg-blue-100 text-blue-700',
    })[form.type],
)

const conditionBadgeClass = computed(() =>
  form.condition === 'New' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600',
)

// ─── Validation ───────────────────────────────────────────────────────────────
function clearError(field: keyof FormErrors) {
  delete errors[field]
}

function validate(): boolean {
  ;(Object.keys(errors) as (keyof FormErrors)[]).forEach((k) => delete errors[k])

  if (!form.title.trim()) errors.title = 'Product title is required'
  else if (form.title.trim().length < 3) errors.title = 'Title must be at least 3 characters'

  if (!form.description.trim()) errors.description = 'Description is required'
  else if (form.description.trim().length < 10)
    errors.description = 'Description must be at least 10 characters'

  if (!form.category.trim()) errors.category = 'Category is required'

  if (form.type !== 'Exchange') {
    if (!form.price) errors.price = `Price is required for ${form.type}`
    else if (isNaN(Number(form.price)) || Number(form.price) < 0)
      errors.price = 'Please enter a valid price'
  } else if (!form.exchangeFor.trim()) {
    errors.exchangeFor = 'Tell people what item you want in exchange'
  }

  const hasPhone = form.phone.trim().length > 0
  const hasEmail = form.email.trim().length > 0
  if (!hasPhone && !hasEmail) {
    errors.contact = 'Please add at least a phone number or email'
  } else {
    if (hasPhone && !/^\+?[\d\s\-()\s]{7,}$/.test(form.phone.trim()))
      errors.contact = 'Phone number looks invalid'
    if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      errors.contact = 'Email address looks invalid'
  }

  if (!form.location.trim()) errors.location = 'Location is required'

  if (form.images.length === 0) errors.images = 'Please add at least one photo'

  return Object.keys(errors).length === 0
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function goToPreview() {
  if (validate()) {
    step.value = 2
    activeThumb.value = 0
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    const firstKey = Object.keys(errors)[0] as keyof FormErrors
    document
      .getElementById(`field-${firstKey}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

function goBack() {
  step.value = 1
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ─── File upload ──────────────────────────────────────────────────────────────
function handleUpload(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return

  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  const MAX_SIZE = 5 * 1024 * 1024

  const valid = Array.from(files).filter((f) => ALLOWED.includes(f.type) && f.size <= MAX_SIZE)
  const toAdd = valid.slice(0, 10 - form.images.length)

  form.images = [...form.images, ...toAdd]
  previewUrls.value = form.images.map((f) => URL.createObjectURL(f))
  clearError('images')
}

function removeImage(index: number) {
  const url = previewUrls.value[index]
  if (url) URL.revokeObjectURL(url)
  form.images.splice(index, 1)
  previewUrls.value.splice(index, 1)
  if (activeThumb.value >= form.images.length) activeThumb.value = 0
}

// ─── Submit ───────────────────────────────────────────────────────────────────
async function submit() {
  if (step.value !== 2) {
    goToPreview()
    return
  }

  submitError.value = ''
  isLoading.value = true

  try {
    const fd = new FormData()
    const listingType = form.type.toLowerCase()
    const listingCondition = form.condition.toLowerCase()
    const contact = [form.phone.trim(), form.email.trim()].filter(Boolean).join(' | ')

    fd.append('type', listingType)
    fd.append('title', form.title)
    fd.append('description', form.description)
    fd.append('category', form.category)
    fd.append('condition', listingCondition)
    fd.append('price', form.type === 'Exchange' ? '0' : form.price)
    fd.append('contact', contact)
    if (form.type === 'Exchange' && form.exchangeFor.trim()) {
      fd.append('exchangeFor', form.exchangeFor.trim())
    }
    fd.append('location', form.location)
    form.images.forEach((file) => fd.append('images', file))

    await axios.post(`${apiBaseUrl}/posts`, fd)
    submitted.value = true
    await router.push('/posts')
  } catch (err: any) {
    const message = err?.response?.data?.message
    submitError.value = Array.isArray(message)
      ? message.join(', ')
      : (message ?? 'Something went wrong. Please try again.')
  } finally {
    isLoading.value = false
  }
}

const handlePopState = () => {
  if (step.value === 2) goBack()
}

onMounted(() => {
  window.history.pushState({ step: 1 }, '')
  window.addEventListener('popstate', handlePopState)
})

onBeforeUnmount(() => {
  window.removeEventListener('popstate', handlePopState)
})
</script>

<template>
  <div class="min-h-screen bg-[#F7FDFE] px-4 py-10">
    <!-- ── Stepper ────────────────────────────────────────
    <div class="max-w-2xl mx-auto mb-8">
      <div class="flex items-center">
        <div class="flex items-center gap-2">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all"
            :class="step === 1 ? 'bg-indigo-600 text-white' : 'bg-green-500 text-white'"
          >
            <span v-if="step === 1">1</span>
            <span v-else>✓</span>
          </div>
          <span class="text-sm font-medium" :class="step === 1 ? 'text-gray-900' : 'text-gray-400'">
            Listing details
          </span>
        </div>

        <div class="flex-1 mx-4 h-px" :class="step === 2 ? 'bg-indigo-400' : 'bg-gray-200'"/>

        <div class="flex items-center gap-2">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all"
            :class="step === 2 ? (submitted ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white') : 'bg-gray-200 text-gray-400'"
          >
            <span v-if="submitted">✓</span>
            <span v-else>2</span>
          </div>
          <span class="text-sm font-medium" :class="step === 2 ? 'text-gray-900' : 'text-gray-400'">
            Review & post
          </span>
        </div>
      </div>
    </div> -->

    <!-- ══════════════════════════════════════════════════ -->
    <!-- STEP 1: FORM                                       -->
    <!-- ══════════════════════════════════════════════════ -->
    <div v-if="step === 1" class="max-w-2xl mx-auto space-y-5">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-black-900">{{ languageStore.t('letsReleaseProduct') }}</h1>
        <p class="text-black-800 text-sm mt-1">{{ languageStore.t('fillDetailsBelow') }}</p>
      </div>

      <!-- Listing type -->
      <div
        class="bg-white rounded-2xl shadow-lg shadow-black/30 border border-gray-100 p-6 space-y-5"
      >
        <p class="text-xl font-bold text-Black-900 mb-3">{{ languageStore.t('listingType') }}</p>
        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="t in ['Sell', 'Exchange', 'Lend'] as const"
            :key="t"
            @click="form.type = t"
            class="flex flex-col items-center gap-1 py-3 rounded-xl border text-sm font-medium transition-all space"
            :class="
              form.type === t
                ? 'bg-[#1A174A] text-[#FF8C00] border-indigo-600 shadow-sm'
                : 'bg-gray-50 text-gray-600 border-[#666565] hover:bg-gray-100'
            "
          >
            <span>{{ t }}</span>
          </button>
        </div>

        <!-- Product details -->
        <!-- <div class="bg-white rounded-2xl shadow-lg shadow-black/30 border border-gray-100 p-6 space-y-5"> -->
        <p class="text-xl font-bold text-Black-900">{{ languageStore.t('listingInformation') }}</p>

        <div id="field-title">
          <label class="block text-xs font-semibold text-black-500 uppercase tracking-wide mb-1.5">
            {{ languageStore.t('productTitle') }} <span class="text-red-400">*</span>
          </label>
          <input
            v-model="form.title"
            :placeholder="languageStore.t('whatIsProductTitle')"
            class="w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition"
            :class="
              errors.title
                ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100'
                : 'border-[#666565] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50'
            "
            @input="clearError('title')"
          />
          <p v-if="errors.title" class="text-red-500 text-xs mt-1.5">⚠ {{ errors.title }}</p>
        </div>

        <div id="field-description">
          <label class="block text-xs font-semibold text-black-500 uppercase tracking-wide mb-1.5">
            {{ languageStore.t('description') }} <span class="text-red-400">*</span>
          </label>
          <textarea
            v-model="form.description"
            :placeholder="languageStore.t('addDetailsToProduct')"
            rows="4"
            class="w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition resize-none"
            :class="
              errors.description
                ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100'
                : 'border-[#666565] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50'
            "
            @input="clearError('description')"
          />
          <p v-if="errors.description" class="text-red-500 text-xs mt-1.5">
            ⚠ {{ errors.description }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div id="field-category">
            <label
              class="block text-xs font-semibold text-black-500 uppercase tracking-wide mb-1.5"
            >
              {{ languageStore.t('category') }} <span class="text-red-400">*</span>
            </label>
            <div class="relative">
              <select
                v-model="form.category"
                class="w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition appearance-none bg-white pr-8"
                :class="
                  errors.category
                    ? 'border-red-300 bg-red-50'
                    : 'border-[#666565] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50'
                "
                @change="clearError('category')"
              >
                <option value="">{{ languageStore.t('select') }}</option>
                <option
                  v-for="c in [
                    'Clothing',
                    'Electronics',
                    'Books',
                    'Furniture',
                    'Sports',
                    'Toys',
                    'Vehicles',
                    'Home & Garden',
                    'Food & Drink',
                    'Other',
                  ]"
                  :key="c"
                >
                  {{ c }}
                </option>
              </select>
              <span
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs"
                >▾</span
              >
            </div>
            <p v-if="errors.category" class="text-red-500 text-xs mt-1.5">
              ⚠ {{ errors.category }}
            </p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-black-500 uppercase tracking-wide mb-1.5"
              >{{ languageStore.t('condition') }}</label
            >
            <div class="flex border border-[#666565] rounded-xl overflow-hidden">
              <button
                v-for="c in ['New', 'Used'] as const"
                :key="c"
                @click="form.condition = c"
                class="flex-1 py-2.5 text-sm font-medium transition"
                :class="
                  form.condition === c
                    ? 'bg-[#1A174A] text-[#FF8C00]'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                "
              >
                {{ c }}
              </button>
            </div>
          </div>
          <!-- </div> -->

          <div v-if="form.type !== 'Exchange'" id="field-price">
            <label
              class="block text-xs font-semibold text-black-500 uppercase tracking-wide mb-1.5"
            >
              {{ form.type === 'Lend' ? languageStore.t('price') : languageStore.t('price') }}
              <span class="text-red-400">*</span>
            </label>
            <div class="relative">
              <span
                class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm"
                >$</span
              >
              <input
                v-model="form.price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                class="w-full border rounded-xl pl-8 pr-4 py-2.5 text-sm outline-none transition"
                :class="
                  errors.price
                    ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100'
                    : 'border-[#666565] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50'
                "
                @input="clearError('price')"
              />
            </div>
            <p v-if="errors.price" class="text-red-500 text-xs mt-1.5">⚠ {{ errors.price }}</p>
          </div>

          <div v-if="form.type === 'Exchange'">
            <label class="block text-xs font-semibold text-black-500 uppercase tracking-wide mb-1.5"
              >{{ languageStore.t('exchangeFor') }} <span class="text-red-400">*</span></label
            >
            <input
              v-model="form.exchangeFor"
              :placeholder="languageStore.t('tellWhatWantExchange')"
              class="w-full border border-[#666565] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition"
              :class="
                errors.exchangeFor
                  ? 'border-red-300 bg-red-50'
                  : 'border-[#666565] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50'
              "
              @input="clearError('exchangeFor')"
            />
            <p v-if="errors.exchangeFor" class="text-red-500 text-xs mt-1.5">
              ⚠ {{ errors.exchangeFor }}
            </p>
          </div>
        </div>

        <!-- Contact -->
        <!-- <div class="bg-white rounded-2xl shadow-lg shadow-black/30 border border-gray-100 p-6"> -->
        <p class="tblock text-xs font-semibold text-black-500 uppercase tracking-wide mb-1.5">
          {{ languageStore.t('contact') }}
        </p>
        <p class="text-xs text-gray-400 mb-4">{{ languageStore.t('addAtLeastContact') }}</p>
        <div id="field-contact" class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-black-500 uppercase tracking-wide mb-1.5"
              >{{ languageStore.t('phone') }}</label
            >
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm">📞</span>
              <input
                v-model="form.phone"
                type="tel"
                placeholder="+855 12 345 678"
                class="w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition"
                :class="
                  errors.contact
                    ? 'border-red-300 bg-red-50'
                    : 'border-[#666565] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50'
                "
                @input="clearError('contact')"
              />
            </div>
          </div>
          <div>
            <label class="block text-xs font-semibold text-black-500 uppercase tracking-wide mb-1.5"
              >{{ languageStore.t('email') }}</label
            >
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm">✉</span>
              <input
                v-model="form.email"
                type="email"
                placeholder="you@gmail.com"
                class="w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition"
                :class="
                  errors.contact
                    ? 'border-red-300 bg-red-50'
                    : 'border-[#666565] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50'
                "
                @input="clearError('contact')"
              />
            </div>
          </div>
        </div>
        <p v-if="errors.contact" class="text-red-500 text-xs mt-2">⚠ {{ errors.contact }}</p>
        <!-- </div> -->

        <!-- <div class="bg-white rounded-2xl shadow-lg shadow-black/30 border border-gray-100 p-6"> -->
        <p class="block text-xs font-semibold text-black-500 uppercase tracking-wide mb-1.5">
          Photos
        </p>
        <p class="text-xs text-gray-400 mb-4" id="field-images">
          Up to 10 photos. First photo is the cover. JPG/PNG/WEBP, max 5MB each.
        </p>

        <div
          class="border-2 border-dashed rounded-xl py-8 text-center cursor-pointer transition"
          :class="
            errors.images
              ? 'border-red-300 bg-red-50'
              : 'border-[#666565] hover:border-indigo-300 hover:bg-indigo-50/40'
          "
          @click="fileInputRef?.click()"
        >
          <div class="text-4xl mb-2">📷</div>
          <p class="text-sm text-gray-500 font-medium">Click to upload photos</p>
          <p class="text-xs text-gray-400 mt-1">Show your product quality up to 10 photos</p>
        </div>
        <input
          ref="fileInputRef"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          class="hidden"
          @change="handleUpload"
        />

        <div v-if="previewUrls.length" class="flex flex-wrap gap-3 mt-4">
          <div v-for="(url, i) in previewUrls" :key="i" class="relative group">
            <img :src="url" class="w-20 h-20 object-cover rounded-xl border border-gray-200" />
            <div
              v-if="i === 0"
              class="absolute top-1 left-1 bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-lg font-medium"
            >
              Cover
            </div>
            <button
              @click="removeImage(i)"
              class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center shadow"
            >
              ✕
            </button>
          </div>
        </div>
        <p v-if="errors.images" class="text-red-500 text-xs mt-2">⚠ {{ errors.images }}</p>
        <!-- </div> -->

        <!-- Location -->
        <!-- <div class="bg-white rounded-2xl shadow-lg shadow-black/30 border border-gray-100 p-6"> -->
        <p class="block text-xs font-semibold text-black-500 uppercase tracking-wide mb-1.5">
          {{ languageStore.t('location') }}
        </p>
        <div id="field-location">
          <label class="block text-xs text-gray-400 tracking-wide mb-1.5">
            City or neighbourhood <span class="text-red-400">*</span>
          </label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm">📍</span>
            <input
              v-model="form.location"
              placeholder="e.g. Phnom Penh, BKK1"
              class="w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition"
              :class="
                errors.location
                  ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100'
                  : 'border-[#666565] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50'
              "
              @input="clearError('location')"
            />
          </div>
          <p v-if="errors.location" class="text-red-500 text-xs mt-1.5">⚠ {{ errors.location }}</p>
        </div>
      </div>

      <!-- Next step -->
      <div class="pb-8">
        <button
          @click="goToPreview"
          class="w-full py-4 bg-[#FF8C00] hover:bg-orange-600 active:scale-[.99] text-white font-semibold rounded-2xl text-sm transition-all shadow-sm"
        >
          Next Step: Review →
        </button>
        <p v-if="errorCount > 0" class="text-center text-red-500 text-xs mt-2">
          Fill {{ errorCount }} requirement{{ errorCount > 1 ? 's' : '' }} above to continue
        </p>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════ -->
    <!-- STEP 2: PREVIEW (matches Image 2)                  -->
    <!-- ══════════════════════════════════════════════════ -->
    <div v-if="step === 2" class="max-w-sm mx-auto">
      <div class="mb-5 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold text-black-900">Review your listing</h2>
          <p class="text-xs text-gray-400 mt-0.5">This is how your post will appear to others</p>
        </div>
        <button @click="goBack" class="text-sm text-indigo-600 font-medium hover:underline">
          ← Edit
        </button>
      </div>

      <div
        v-if="submitted"
        class="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl px-5 py-4 text-sm font-medium text-center"
      >
        🎉 Posted successfully! Your listing is now live.
      </div>
      <div
        v-if="submitError"
        class="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl px-5 py-4 text-sm"
      >
        ⚠ {{ submitError }}
      </div>

      <!-- ── Preview Card ─────────────────────────────── -->
      <div
        class="bg-white rounded-3xl overflow-hidden shadow-lg shadow-black/30 border border-gray-100"
      >
        <!-- Image section -->
        <div class="relative">
          <div class="h-64 overflow-hidden bg-gray-100">
            <img
              v-if="activeImage"
              :src="activeImage"
              class="w-full h-full object-cover ring-4 ring-blue-400 ring-inset"
            />
            <div
              v-else
              class="h-full flex flex-col items-center justify-center text-gray-300 gap-2"
            >
              <span class="text-5xl">📷</span>
              <span class="text-sm">Cover photo</span>
            </div>
          </div>

          <!-- Dot indicators -->
          <div
            v-if="previewUrls.length > 1"
            class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5"
          >
            <button
              v-for="(_, i) in previewUrls"
              :key="i"
              @click="activeThumb = i"
              class="rounded-full transition-all"
              :class="activeThumb === i ? 'w-4 h-2 bg-white shadow' : 'w-2 h-2 bg-white/60'"
            />
          </div>

          <!-- Category -->
          <span
            class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-3 py-1 rounded-full shadow-sm"
          >
            {{ form.category }}
          </span>
        </div>

        <!-- Thumbnail row -->
        <div
          v-if="previewUrls.length > 1"
          class="flex gap-2 px-3 py-2 border-b border-[#666565] overflow-x-auto"
        >
          <img
            v-for="(url, i) in previewUrls"
            :key="i"
            :src="url"
            @click="activeThumb = i"
            class="w-12 h-12 object-cover rounded-lg flex-shrink-0 cursor-pointer transition"
            :class="activeThumb === i ? 'ring-2 ring-blue-400' : 'opacity-60 hover:opacity-100'"
          />
        </div>

        <!-- Body -->
        <div class="px-5 pt-4 pb-5 space-y-3">
          <!-- Title + type badge -->
          <div class="flex items-start justify-between gap-2">
            <h2 class="text-lg font-bold text-gray-900 leading-snug">{{ form.title }}</h2>
            <span
              class="text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 mt-0.5"
              :class="typeBadgeClass"
            >
              {{ form.type }}
            </span>
          </div>

          <!-- Price + condition -->
          <div class="flex items-center gap-2">
            <span class="bg-amber-100 text-amber-700 font-bold text-sm px-3 py-1 rounded-lg">
              {{ displayPrice }}
            </span>
            <span
              class="text-xs font-semibold px-2.5 py-1 rounded-full"
              :class="conditionBadgeClass"
            >
              {{ form.condition }}
            </span>
          </div>

          <!-- Description -->
          <p class="text-gray-500 text-sm leading-relaxed">{{ form.description }}</p>

          <div class="border-t border-[#666565]" />

          <!-- Contact row -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              >
                {{ form.email ? form.email.charAt(0).toUpperCase() : '#' }}
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-800">{{ form.email || 'User' }}</p>
                <p class="text-xs text-gray-500">{{ form.phone || form.email }}</p>
              </div>
            </div>
            <button
              class="flex items-center gap-1.5 bg-blue-100 hover:bg-gray-200 text-black text-xs font-semibold px-3 py-2 rounded-full transition"
            >
              💬 Contact Me
            </button>
          </div>

          <div class="border-t border-[#666565]" />

          <!-- Location -->
          <div class="text-center py-1">
            <div class="inline-flex items-center gap-1.5 text-[#1A1660]">
              <span class="text-base">📍</span>
              <span class="font-bold text-sm">{{ form.location }}</span>
            </div>
            <p class="text-gray-400 text-xs uppercase tracking-wider mt-0.5">
              Verified studio address
            </p>
          </div>

          <div class="border-t border-[#666565]" />

          <!-- Footer -->
          <div class="flex items-center justify-between text-xs text-gray-400">
            <span>Posted Just Now</span>
            <span>{{ today }}</span>
          </div>
        </div>
      </div>

      <!-- Post Now -->
      <button
        @click="submit"
        :disabled="isLoading || submitted"
        class="w-full mt-5 py-4 rounded-2xl text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
        :class="
          submitted
            ? 'bg-green-500 text-white cursor-default'
            : 'bg-[#FF8C00] hover:bg-orange-600 active:scale-[.99] text-white disabled:opacity-60'
        "
      >
        <svg v-if="isLoading" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        {{ submitted ? '✓ Posted!' : isLoading ? 'Posting…' : 'Confirm & Post →' }}
      </button>

      <p class="text-center text-gray-400 text-xs mt-3 pb-8">
        You can always edit your listing after posting
      </p>
    </div>
  </div>
</template>
