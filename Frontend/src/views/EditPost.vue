<script setup lang="ts">
import { reactive, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'

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
const router = useRouter()
const route = useRoute()
const postId = route.params.id as string

const step = ref<1 | 2>(1)
const isLoading = ref(false)
const isLoadingPost = ref(true)
const submitted = ref(false)
const submitError = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const activeThumb = ref(0)
const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const existingImages = ref<string[]>([])

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
const activeImage = computed(() => {
  if (activeThumb.value < existingImages.value.length) {
    const uploadBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '')
    return `${uploadBaseUrl}/uploads/${existingImages.value[activeThumb.value]}`
  }
  const offset = activeThumb.value - existingImages.value.length
  return previewUrls.value[offset] ?? ''
})

const allImages = computed(() => [
  ...existingImages.value.map((img) => `${apiBaseUrl.replace(/\/api\/?$/, '')}/uploads/${img}`),
  ...previewUrls.value,
])

const errorCount = computed(() => Object.keys(errors).length)

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

  const totalImages = existingImages.value.length + form.images.length
  if (totalImages === 0) errors.images = 'Please keep at least one photo or add new ones'

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
  const maxNewFiles = 10 - existingImages.value.length - form.images.length

  const valid = Array.from(files).filter((f) => ALLOWED.includes(f.type) && f.size <= MAX_SIZE)
  const toAdd = valid.slice(0, maxNewFiles)

  form.images = [...form.images, ...toAdd]
  previewUrls.value = form.images.map((f) => URL.createObjectURL(f))
  clearError('images')
}

function removeNewImage(index: number) {
  const url = previewUrls.value[index]
  if (url) URL.revokeObjectURL(url)
  form.images.splice(index, 1)
  previewUrls.value.splice(index, 1)
  if (activeThumb.value >= allImages.value.length)
    activeThumb.value = Math.max(0, allImages.value.length - 1)
}

function removeExistingImage(index: number) {
  existingImages.value.splice(index, 1)
  if (activeThumb.value >= allImages.value.length)
    activeThumb.value = Math.max(0, allImages.value.length - 1)
}

// ─── Load existing post ────────────────────────────────────────────────────────
async function loadPost() {
  isLoadingPost.value = true
  try {
    const { data } = await axios.get(`${apiBaseUrl}/posts/${postId}`)
    const [phone, email] = data.contact
      ? data.contact.split(' | ').map((s: string) => s.trim())
      : ['', '']

    form.type = (data.type.charAt(0).toUpperCase() + data.type.slice(1)) as ListingType
    form.title = data.title
    form.description = data.description
    form.category = data.category
    form.condition = (data.condition.charAt(0).toUpperCase() + data.condition.slice(1)) as Condition
    form.price = data.price?.toString() ?? ''
    form.exchangeFor = data.exchangeFor ?? ''
    form.phone = phone
    form.email = email
    form.location = data.location
    existingImages.value = data.images ?? []
  } catch (error: any) {
    submitError.value = error?.response?.data?.message ?? 'Failed to load post.'
  } finally {
    isLoadingPost.value = false
  }
}

// ─── Submit ───────────────────────────────────────────────────────────────────
async function submit() {
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
    fd.append('retainImages', JSON.stringify(existingImages.value))
    form.images.forEach((file) => fd.append('images', file))

    await axios.patch(`${apiBaseUrl}/posts/${postId}`, fd, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem('authToken') ?? ''}`,
      },
    })
    submitted.value = true
    await router.push('/home')
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
  loadPost()
  window.history.pushState({ step: 1 }, '')
  window.addEventListener('popstate', handlePopState)
})

onBeforeUnmount(() => {
  window.removeEventListener('popstate', handlePopState)
})
</script>

<template>
  <div class="min-h-screen bg-[#F7FDFE] px-4 py-10">
    <div class="mx-auto mb-6 max-w-2xl">
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
        @click="router.push('/posts')"
      >
        <span aria-hidden="true">←</span>
        Back to posts
      </button>
    </div>

    <div v-if="isLoadingPost" class="max-w-2xl mx-auto text-center">
      <p class="text-slate-600">Loading post...</p>
    </div>

    <div v-else-if="submitError && !submitted" class="max-w-2xl mx-auto mb-8">
      <div class="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 text-sm">
        ⚠ {{ submitError }}
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════ -->
    <!-- STEP 1: FORM                                       -->
    <!-- ══════════════════════════════════════════════════ -->
    <div v-if="step === 1 && !isLoadingPost" class="max-w-2xl mx-auto space-y-5">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-black-900">Update your post</h1>
        <p class="text-black-800 text-sm mt-1">Make changes below</p>
      </div>

      <!-- Listing type -->
      <div
        class="bg-white rounded-2xl shadow-lg shadow-black/30 border border-gray-100 p-6 space-y-5"
      >
        <p class="text-xl font-bold text-Black-900 mb-3">Listing type</p>
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

        <p class="text-xl font-bold text-Black-900">Listing Information of Product</p>

        <div id="field-title">
          <label class="block text-xs font-semibold text-black-500 uppercase tracking-wide mb-1.5">
            Product title <span class="text-red-400">*</span>
          </label>
          <input
            v-model="form.title"
            placeholder="What is your product title?"
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
            Description <span class="text-red-400">*</span>
          </label>
          <textarea
            v-model="form.description"
            placeholder="Add details to your product…"
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
              Category <span class="text-red-400">*</span>
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
                <option value="">Select…</option>
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
              >Condition</label
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
        </div>

        <div v-if="form.type !== 'Exchange'" id="field-price">
          <label class="block text-xs font-semibold text-black-500 uppercase tracking-wide mb-1.5">
            {{ form.type === 'Lend' ? 'Daily rate' : 'Price' }} <span class="text-red-400">*</span>
          </label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm"
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
            >What do you want in return? <span class="text-red-400">*</span></label
          >
          <input
            v-model="form.exchangeFor"
            placeholder="e.g. iPhone 13, road bike…"
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
      <p class="tblock text-xs font-semibold text-black-500 uppercase tracking-wide mb-1.5">
        Contact info
      </p>
      <p class="text-xs text-gray-400 mb-4">At least one contact method is required</p>
      <div id="field-contact" class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-black-500 uppercase tracking-wide mb-1.5"
            >Phone</label
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
            >Email</label
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

      <!-- Photos -->
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
        <p class="text-xs text-gray-400 mt-1">Add new photos to replace or keep existing ones</p>
      </div>
      <input
        ref="fileInputRef"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        class="hidden"
        @change="handleUpload"
      />

      <div v-if="allImages.length" class="flex flex-wrap gap-3 mt-4">
        <div v-for="(url, i) in allImages" :key="i" class="relative group">
          <img :src="url" class="w-20 h-20 object-cover rounded-xl border border-gray-200" />
          <div
            v-if="i === 0"
            class="absolute top-1 left-1 bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-lg font-medium"
          >
            Cover
          </div>
          <button
            v-if="i >= existingImages.length"
            @click="removeNewImage(i - existingImages.length)"
            class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center shadow"
          >
            ✕
          </button>
          <button
            v-else
            @click="removeExistingImage(i)"
            class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center shadow"
          >
            ✕
          </button>
        </div>
      </div>
      <p v-if="errors.images" class="text-red-500 text-xs mt-2">⚠ {{ errors.images }}</p>

      <!-- Location -->
      <p class="block text-xs font-semibold text-black-500 uppercase tracking-wide mb-1.5">
        Location
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
    <!-- STEP 2: PREVIEW                                    -->
    <!-- ══════════════════════════════════════════════════ -->
    <div v-if="step === 2 && !isLoadingPost" class="max-w-sm mx-auto">
      <div class="mb-5 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold text-black-900">Review your changes</h2>
          <p class="text-xs text-gray-400 mt-0.5">This is how your updated post will appear</p>
        </div>
        <button @click="goBack" class="text-sm text-indigo-600 font-medium hover:underline">
          ← Edit
        </button>
      </div>

      <div
        v-if="submitted"
        class="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl px-5 py-4 text-sm font-medium text-center"
      >
        🎉 Post updated successfully! Redirecting...
      </div>
      <div
        v-if="submitError"
        class="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl px-5 py-4 text-sm"
      >
        ⚠ {{ submitError }}
      </div>

      <!-- Preview Card -->
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
            v-if="allImages.length > 1"
            class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5"
          >
            <button
              v-for="(_, i) in allImages"
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

        <!-- Content -->
        <div class="p-6 space-y-4">
          <div>
            <h3 class="text-2xl font-bold text-slate-900">{{ form.title }}</h3>
            <p class="text-sm text-slate-500 mt-1">{{ form.location }}</p>
          </div>

          <div class="flex gap-2 flex-wrap">
            <span :class="typeBadgeClass" class="px-3 py-1 rounded-full text-xs font-semibold">
              {{ form.type }}
            </span>
            <span :class="conditionBadgeClass" class="px-3 py-1 rounded-full text-xs font-semibold">
              {{ form.condition }}
            </span>
          </div>

          <p class="text-slate-700 leading-relaxed">{{ form.description }}</p>

          <div class="border-t pt-4">
            <p class="text-2xl font-bold text-emerald-600">{{ displayPrice }}</p>
            <p v-if="form.exchangeFor" class="text-sm text-indigo-600 mt-1">
              Looking for: {{ form.exchangeFor }}
            </p>
          </div>

          <div class="flex gap-2 pt-4 border-t">
            <button
              type="button"
              :disabled="isLoading"
              @click="submit"
              class="flex-1 py-3 bg-[#FF8C00] hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition"
            >
              {{ isLoading ? 'Updating...' : 'Update Post' }}
            </button>
            <button
              type="button"
              @click="goBack"
              class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
