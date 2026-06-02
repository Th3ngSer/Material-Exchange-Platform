<script setup lang="ts">
import { getToken } from '@/utils/tokenStorage'
import { reactive, ref, computed, onMounted, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useLanguageStore } from '@/stores/language'
import { useAuthStore } from '@/stores/auth'
import HomeMaterialCard from '@/components/HomeView/MaterialCard.vue'
import LeafletMapPicker from '@/components/Leaflet/LeafletMapPicker.vue'
import type { MaterialItem, MaterialTone } from '@/data/materials'
import Footer from '@/components/layout/Footer.vue'
import Header from '@/components/layout/Header.vue'

// ─── Types ────────────────────────────────────────────────────────────────────
type ListingType = 'Sell' | 'Exchange' | 'Lend'
type Condition = 'New' | 'Like New' | 'Good' | 'Fair'

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
  lat?: number | null
  lng?: number | null
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

type DraftSnapshot = Omit<FormState, 'images'>
type WindowWithCreateDraftCache = Window & {
  __createPostDraftImages?: File[]
  __createPostDraftPreviewUrls?: string[]
}

const CREATE_POST_DRAFT_KEY = 'create-post-draft'
const DETAIL_PREVIEW_DRAFT_KEY = 'material-detail-preview-draft'
let cachedDraftImages: File[] = []
let cachedDraftPreviewUrls: string[] = []

// ─── State ────────────────────────────────────────────────────────────────────
const isLoading = ref(false)
const submitted = ref(false)
const submitError = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const router = useRouter()
const languageStore = useLanguageStore()
const authStore = useAuthStore()

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
  lat: undefined,
  lng: undefined,
  images: [],
})

const categoryOptions = [
  { value: 'Clothing', labelKey: 'clothing' },
  { value: 'Electronics', labelKey: 'electronics' },
  { value: 'Books', labelKey: 'books' },
  { value: 'Furniture', labelKey: 'furniture' },
  { value: 'Sports', labelKey: 'sports' },
  { value: 'Toys', labelKey: 'toys' },
  { value: 'Vehicles', labelKey: 'vehicles' },
  { value: 'Home & Garden', labelKey: 'homeAndGarden' },
  { value: 'Food & Drink', labelKey: 'foodAndDrink' },
  { value: 'Other', labelKey: 'other' },
]

const errors = reactive<FormErrors>({})
const previewUrls = ref<string[]>([])

function createDraftSnapshot(): DraftSnapshot {
  return {
    type: form.type,
    title: form.title,
    description: form.description,
    category: form.category,
    condition: form.condition,
    price: form.price,
    exchangeFor: form.exchangeFor,
    phone: form.phone,
    email: form.email,
    location: form.location,
    lat: form.lat,
    lng: form.lng,
  }
}

function saveDraft() {
  sessionStorage.setItem(CREATE_POST_DRAFT_KEY, JSON.stringify(createDraftSnapshot()))
}

function restoreDraft() {
  const rawDraft = sessionStorage.getItem(CREATE_POST_DRAFT_KEY)
  const fallbackPreviewDraft = sessionStorage.getItem(DETAIL_PREVIEW_DRAFT_KEY)
  const source = rawDraft || fallbackPreviewDraft
  if (!source) return

  try {
    const parsed = JSON.parse(source) as Partial<DraftSnapshot> & { type?: unknown; images?: string[] }
    const parsedType = typeof (parsed as any).type === 'string' ? ((parsed as any).type as string) : undefined
    const normalizedType =
      parsedType === 'Borrow'
        ? 'Lend'
        : ((parsedType as ListingType | undefined) ?? form.type)

    form.type = normalizedType
    form.title = parsed.title ?? form.title
    form.description = parsed.description ?? form.description
    form.category = parsed.category ?? form.category
    form.condition = (parsed.condition as Condition) || form.condition
    form.price = parsed.price ?? form.price
    form.exchangeFor = parsed.exchangeFor ?? form.exchangeFor
    form.phone = parsed.phone ?? form.phone
    form.email = parsed.email ?? form.email
    form.location = parsed.location ?? form.location
    form.lat = (parsed as any).lat ?? form.lat
    form.lng = (parsed as any).lng ?? form.lng

    if ((!cachedDraftPreviewUrls.length || !previewUrls.value.length) && Array.isArray(parsed.images)) {
      previewUrls.value = [...parsed.images]
    }
  } catch {
    // Ignore malformed draft payloads
  }

  const draftWindow = window as WindowWithCreateDraftCache
  const windowCachedImages = draftWindow.__createPostDraftImages ?? []
  const windowCachedPreviewUrls = draftWindow.__createPostDraftPreviewUrls ?? []

  if (windowCachedImages.length > 0 && cachedDraftImages.length === 0) {
    cachedDraftImages = [...windowCachedImages]
  }

  if (windowCachedPreviewUrls.length > 0 && cachedDraftPreviewUrls.length === 0) {
    cachedDraftPreviewUrls = [...windowCachedPreviewUrls]
  }

  if (cachedDraftImages.length > 0) {
    form.images = [...cachedDraftImages]
  }

  if (cachedDraftPreviewUrls.length > 0) {
    previewUrls.value = [...cachedDraftPreviewUrls]
  }
}

function updateImageCaches() {
  cachedDraftImages = [...form.images]
  cachedDraftPreviewUrls = [...previewUrls.value]

  const draftWindow = window as WindowWithCreateDraftCache
  draftWindow.__createPostDraftImages = [...form.images]
  draftWindow.__createPostDraftPreviewUrls = [...previewUrls.value]
}

function clearDraft() {
  sessionStorage.removeItem(CREATE_POST_DRAFT_KEY)
  sessionStorage.removeItem(DETAIL_PREVIEW_DRAFT_KEY)
  cachedDraftImages = []
  cachedDraftPreviewUrls = []

  const draftWindow = window as WindowWithCreateDraftCache
  draftWindow.__createPostDraftImages = []
  draftWindow.__createPostDraftPreviewUrls = []
}

// ─── Computed ─────────────────────────────────────────────────────────────────
const errorCount = computed(() => Object.keys(errors).length)
const translateKey = (key: string) => languageStore.t(key as any)

const listingTypeLabel = (type: string) => translateKey(type.toLowerCase())
const conditionLabel = (condition: string) => {
  const keyMap: Record<Condition, 'new' | 'likeNew' | 'good' | 'fair'> = {
    New: 'new',
    'Like New': 'likeNew',
    Good: 'good',
    Fair: 'fair',
  }
  return translateKey(keyMap[condition as Condition] ?? 'new')
}

function setListingType(value: string) {
  form.type = value as ListingType
}

function setCondition(value: string) {
  form.condition = value as Condition
}

const previewCardItem = computed<MaterialItem>(() => {
  const normalizedCategory = form.category === 'Other' ? 'Others' : form.category
  const toneMap: Record<ListingType, MaterialTone> = {
    Sell: 'orange',
    Exchange: 'gold',
    Lend: 'rose',
  }
  const currentUser = authStore.user
  const currentUserName = currentUser?.name || currentUser?.username || currentUser?.email || languageStore.t('unknownSeller')
  const currentUserRating = typeof currentUser?.rating === 'number' ? currentUser.rating : 5

  return {
    id: 'preview',
    title: form.title.trim() || languageStore.t('productTitle'),
    price: form.price || '',
    location: form.location.trim() || 'Phnom Penh',
    type: form.type === 'Lend' ? 'Borrow' : form.type,
    tone: toneMap[form.type],
    category: normalizedCategory as MaterialItem['category'],
    seller: currentUserName,
    rating: currentUserRating,
    avatar: currentUser?.avatar,
    images: previewUrls.value,
    postedTime: new Date().toISOString(),
    description: form.description,
    condition: form.condition,
    exchangeFor: form.exchangeFor,
  }
})

// ─── Validation ───────────────────────────────────────────────────────────────
function clearError(field: keyof FormErrors) {
  delete errors[field]
}

function validate(): boolean {
  ;(Object.keys(errors) as (keyof FormErrors)[]).forEach((k) => delete errors[k])

  if (!form.title.trim()) errors.title = languageStore.t('titleRequired')
  else if (form.title.trim().length < 3) errors.title = languageStore.t('titleMin3Chars')

  if (!form.description.trim()) errors.description = languageStore.t('descriptionRequired')
  else if (form.description.trim().length < 10)
    errors.description = languageStore.t('descriptionMin10Chars')

  if (!form.category.trim()) errors.category = languageStore.t('categoryRequired')

  if (form.type !== 'Exchange') {
    if (!form.price)
      errors.price = `${languageStore.t('priceRequiredFor')} ${listingTypeLabel(form.type)}`
    else if (isNaN(Number(form.price)) || Number(form.price) < 0)
      errors.price = languageStore.t('enterValidPrice')
  } else if (!form.exchangeFor.trim()) {
    errors.exchangeFor = languageStore.t('exchangeForRequired')
  }

  const hasPhone = form.phone.trim().length > 0
  const hasEmail = form.email.trim().length > 0
  if (!hasPhone && !hasEmail) {
    errors.contact = languageStore.t('addAtLeastContact')
  } else {
    if (hasPhone && !/^\+?[\d\s\-()\s]{7,}$/.test(form.phone.trim()))
      errors.contact = languageStore.t('phoneLooksInvalid')
    if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      errors.contact = languageStore.t('emailLooksInvalid')
  }

  if (!form.location.trim()) errors.location = languageStore.t('locationRequired')

  if (form.images.length === 0) errors.images = languageStore.t('addAtLeastOnePhoto')

  return Object.keys(errors).length === 0
}

function handleTopBackClick() {
  void router.push('/home')
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
  updateImageCaches()
  saveDraft()
  clearError('images')
}

function removeImage(index: number) {
  const url = previewUrls.value[index]
  if (url) URL.revokeObjectURL(url)
  form.images.splice(index, 1)
  previewUrls.value.splice(index, 1)
  updateImageCaches()
  saveDraft()
}

function onLocationSelect(payload: { lat: number; lng: number; location: string }) {
  form.lat = payload.lat
  form.lng = payload.lng
  if (payload.location) form.location = payload.location
  saveDraft()
  clearError('location')
}

function normalizeLocation(input: string) {
  if (!input) return ''
  const parts = input.split(',').map((p) => p.trim()).filter(Boolean)
  if (parts.length >= 2) {
    // prefer last two components as city/district might appear at end
    const last = String(parts[parts.length - 1] ?? '')
    const secondLast = String(parts[parts.length - 2] ?? '')
    const strip = (s: string) => s.replace(/^(sangkat|khan)\s+/i, '').trim()
    return `${strip(secondLast)}, ${strip(last)}`
  }
  const strip = (s: string) => s.replace(/^(sangkat|khan)\s+/i, '').trim()
  return strip(parts[0] ?? '')
}

function normalizeAndSetLocation() {
  const loc = String(form.location ?? '')
  form.location = normalizeLocation(loc)
  saveDraft()
}

function openMaterialDetailPreview() {
  updateImageCaches()
  saveDraft()

  const draftPreview = {
    ...previewCardItem.value,
    exchangeFor: form.exchangeFor,
    condition: form.condition,
    phone: form.phone,
    email: form.email,
    lat: form.lat,
    lng: form.lng,
    images: [...previewUrls.value],
  }

  sessionStorage.setItem('material-detail-preview-draft', JSON.stringify(draftPreview))
  void router.push({ name: 'material-detail-preview' })
}

// ─── Submit ───────────────────────────────────────────────────────────────────
async function submit() {
  if (!validate()) {
    const firstKey = Object.keys(errors)[0] as keyof FormErrors
    document.getElementById(`field-${firstKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }

  submitError.value = ''
  isLoading.value = true

  try {
    const fd = new FormData()
    const listingType = form.type.toLowerCase()
    // backend expects 'new' or 'used' for condition
    const listingCondition = form.condition === 'New' ? 'new' : 'used'
    const contact = [form.phone.trim(), form.email.trim()].filter(Boolean).join(' | ')

    fd.append('type', listingType)
    fd.append('title', form.title)
    fd.append('description', form.description)
    fd.append('category', form.category)
    fd.append('condition', listingCondition)
    // ensure price is sent as a numeric string (backend will parseFloat)
    fd.append('price', form.type === 'Exchange' ? '0' : String(form.price || '0'))
    fd.append('contact', contact)
    if (form.type === 'Exchange' && form.exchangeFor.trim()) {
      fd.append('exchangeFor', form.exchangeFor.trim())
    }
    fd.append('location', form.location)
    // include lister name from auth if available
    const currentUser = authStore.user
    if (currentUser?.name || currentUser?.email) {
      fd.append('listerName', (currentUser.name || currentUser.email) as string)
    }
    if (typeof form.lat === 'number') fd.append('lat', String(form.lat))
    if (typeof form.lng === 'number') fd.append('lng', String(form.lng))
    form.images.forEach((file) => fd.append('images', file))

    await axios.post(`${apiBaseUrl}/posts`, fd, {
      headers: {
        Authorization: `Bearer ${getToken() ?? ''}`,
      },
    })
    submitted.value = true
    clearDraft()
    await router.push('/browse')
  } catch (err: any) {
    const message = err?.response?.data?.message
    submitError.value = Array.isArray(message)
      ? message.join(', ')
      : (message ?? 'Something went wrong. Please try again.')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  restoreDraft()
})

// Clear draft when leaving CreatePost, except when navigating to the preview page
onBeforeRouteLeave((to, from) => {
  if (to && to.name === 'material-detail-preview') {
    return
  }
  clearDraft()
})

watch(
  () => [
    form.type,
    form.title,
    form.description,
    form.category,
    form.condition,
    form.price,
    form.exchangeFor,
    form.phone,
    form.email,
    form.location,
  ],
  () => {
    saveDraft()
  },
)
</script>

<template>
  <div class="create-post-page">
    <Header />
    <div class="min-h-screen bg-[#F7FDFE] px-4 py-10">
    <div class="mx-auto mb-6 w-full max-w-6xl">
      
      <button
        type="button"
        @click="handleTopBackClick"
        class="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#999] transition hover:text-[#1b1748]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-left"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M15 6l-6 6l6 6" /></svg>
        Back
      </button>
    </div>

    <div class="mx-auto w-full max-w-6xl lg:grid lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start lg:gap-8">
      <div class="space-y-5">
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
              v-for="t in ['Sell', 'Exchange', 'Lend']"
              :key="t"
              @click="setListingType(t)"
              class="flex flex-col items-center gap-1 py-3 rounded-xl border text-sm font-medium transition-all space"
              :class="
                form.type === t
                  ? 'bg-[#1A174A] text-[#FF8C00] border-indigo-600 shadow-sm'
                  : 'bg-gray-50 text-gray-600 border-[#666565] hover:bg-gray-100'
              "
            >
              <span>{{ listingTypeLabel(t) }}</span>
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
                  v-for="option in categoryOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ translateKey(option.labelKey) }}
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
                v-for="c in ['New', 'Like New', 'Good', 'Fair']"
                :key="c"
                @click="setCondition(c)"
                class="flex-1 py-2.5 text-sm font-medium transition"
                :class="
                  form.condition === c
                    ? 'bg-[#1A174A] text-[#FF8C00]'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                "
              >
                {{ conditionLabel(c) }}
              </button>
            </div>
          </div>
          <!-- </div> -->

          <div v-if="form.type !== 'Exchange'" id="field-price">
            <label
              class="block text-xs font-semibold text-black-500 uppercase tracking-wide mb-1.5"
            >
              {{ languageStore.t('price') }}
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
          {{ languageStore.t('uploadPhotos') }}
        </p>
        <p class="text-xs text-gray-400 mb-4" id="field-images">
          {{ languageStore.t('uploadPhotosHint') }}
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
          <p class="text-sm text-gray-500 font-medium">{{ languageStore.t('uploadPhotos') }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ languageStore.t('uploadPhotosHint') }}</p>
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
              {{ languageStore.t('cover') }}
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
            {{ languageStore.t('cityOrNeighbourhood') }} <span class="text-red-400">*</span>
          </label>
          <div class="mb-3">
            <LeafletMapPicker :initialLat="form.lat ?? undefined" :initialLng="form.lng ?? undefined" :initialLocation="form.location" @select="onLocationSelect" />
          </div>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm">📍</span>
            <input
              v-model="form.location"
                placeholder="e.g. Sensok, Phnom Penh"
              class="w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition"
              :class="
                errors.location
                  ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100'
                  : 'border-[#666565] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50'
              "
              @input="clearError('location')"
              @blur="normalizeAndSetLocation()"
            />
          </div>
          <p v-if="errors.location" class="text-red-500 text-xs mt-1.5">⚠ {{ errors.location }}</p>
        </div>
        </div>

        <div v-if="errorCount > 0" class="pb-8">
          <p class="text-center text-red-500 text-xs mt-2">
            {{ languageStore.t('fillRequirementsToContinue').replace('{count}', String(errorCount)) }}
          </p>
        </div>
      </div>

      <aside class="mt-8 mx-auto w-[390px] max-w-full lg:mt-0 lg:sticky lg:top-24 lg:flex-none">
        <div class="mb-5 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold text-black-900">{{ languageStore.t('reviewYourListing') }}</h2>
          <p class="text-xs text-gray-400 mt-0.5">{{ languageStore.t('reviewPost') }}</p>
        </div>
      </div>

      <div
        v-if="submitted"
        class="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl px-5 py-4 text-sm font-medium text-center"
      >
        🎉 {{ languageStore.t('postedSuccessfully') }}
      </div>
      <div
        v-if="submitError"
        class="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl px-5 py-4 text-sm"
      >
        ⚠ {{ submitError }}
      </div>

      <!-- ── Preview Card ─────────────────────────────── -->
      <div class="flex justify-center">
        <HomeMaterialCard :item="previewCardItem" />
      </div>

      <button
        type="button"
        class="mt-4 w-full rounded-xl border border-[#1A174A] bg-white px-4 py-2.5 text-sm font-semibold text-[#1A174A] transition hover:bg-[#f3f3ff]"
        @click="openMaterialDetailPreview"
      >
        Open Material Detail Preview
      </button>

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
        {{ submitted ? '✓ ' + languageStore.t('postedSuccessfully') : isLoading ? languageStore.t('posting') : languageStore.t('confirmPost') }}
      </button>

      <p class="text-center text-gray-400 text-xs mt-3 pb-8">
        {{ languageStore.t('editListingAfterPosting') }}
      </p>
      </aside>
    </div>
    </div>
    <Footer />
  </div>
</template>
