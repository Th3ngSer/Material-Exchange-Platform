<template>
  <div class="rating-widget" :class="`size-${size}`">

    <!-- Label -->
    <div v-if="label" class="rating-label">{{ label }}</div>

    <!-- Order summary chip (optional) -->
    <div v-if="orderItem" class="order-chip">
      <span class="order-chip-icon"></span>
      <span class="order-chip-text">{{ orderItem }}</span>
    </div>

    <!-- Stars row -->
    <div
      class="stars-row"
      role="radiogroup"
      :aria-label="label || 'Star rating'"
      @mouseleave="hovered = 0"
    >
      <button
        v-for="star in 5"
        :key="star"
        class="star-btn"
        :class="{
          filled:   star <= activeStar,
          hovered:  star <= hovered && !readonly,
          readonly: readonly,
        }"
        :aria-label="`${star} star${star > 1 ? 's' : ''}`"
        :aria-checked="modelValue === star"
        role="radio"
        :disabled="readonly || disabled"
        @mouseenter="!readonly && !disabled && (hovered = star)"
        @click="selectStar(star)"
      >
        <!-- Filled star -->
        <svg class="star-icon filled-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <!-- Empty star -->
        <svg class="star-icon empty-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <!-- Burst particles on select -->
        <span v-if="selected === star && burst" class="burst">
          <span v-for="p in 6" :key="p" class="particle" :style="particleStyle(p)" />
        </span>
      </button>
    </div>

    <!-- Rating label text -->
    <Transition name="label-fade" mode="out-in">
      <div
        v-if="activeStar > 0"
        :key="activeStar"
        class="rating-descriptor"
        :style="{ color: descriptorColor }"
      >
        {{ descriptor }}
      </div>
      <div v-else key="placeholder" class="rating-placeholder">
        Tap a star to rate
      </div>
    </Transition>

    <!-- Review textarea (shown when showReview prop is true) -->
    <Transition name="expand">
      <div v-if="showReview && activeStar > 0" class="review-field">
        <textarea
          v-model="reviewText"
          class="review-textarea"
          :placeholder="reviewPlaceholder"
          rows="3"
          maxlength="500"
          :disabled="readonly || disabled"
          @input="$emit('update:review', reviewText)"
        />
        <div class="review-footer">
          <span class="char-count">{{ reviewText.length }} / 500</span>
        </div>
      </div>
    </Transition>

    <!-- Submit button -->
    <button
      v-if="showSubmit && !readonly && activeStar > 0"
      class="submit-btn"
      :class="{ submitting }"
      :disabled="disabled || submitting"
      @click="handleSubmit"
    >
      <span v-if="submitting" class="spinner" />
      <span v-else>{{ submitLabel }}</span>
    </button>

    <!-- Read-only: show count -->
    <div v-if="readonly && reviewCount !== undefined" class="review-count">
      {{ formatRating(modelValue ?? 0) }} · {{ reviewCount }} review{{ reviewCount !== 1 ? 's' : '' }}
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// ── Props ────────────────────────────────────────────────

interface Props {
  /** Current rating value (1–5 or null) */
  modelValue?: number | null
  /** Optional text label above stars */
  label?: string
  /** Show the order/item name chip */
  orderItem?: string
  /** Show textarea for a written review */
  showReview?: boolean
  /** Bound review text (use with v-model:review) */
  review?: string
  /** Show submit button */
  showSubmit?: boolean
  /** Submit button label */
  submitLabel?: string
  /** Loading state on submit */
  submitting?: boolean
  /** Disable all interaction */
  disabled?: boolean
  /** Display-only mode — no interaction */
  readonly?: boolean
  /** Total review count (shown in readonly mode) */
  reviewCount?: number
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue:  null,
  label:       '',
  orderItem:   '',
  showReview:  false,
  review:      '',
  showSubmit:  false,
  submitLabel: 'Submit Review',
  submitting:  false,
  disabled:    false,
  readonly:    false,
  reviewCount: undefined,
  size:        'md',
})

// ── Emits ────────────────────────────────────────────────

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
  (e: 'update:review', value: string): void
  (e: 'submit', payload: { rating: number; review: string }): void
  (e: 'change', value: number): void
}>()

// ── State ────────────────────────────────────────────────

const hovered    = ref<number>(0)
const selected   = ref<number>(props.modelValue ?? 0)
const burst      = ref<boolean>(false)
const reviewText = ref<string>(props.review ?? '')

watch(() => props.modelValue, val => {
  if (val != null) selected.value = val
})

watch(() => props.review, val => {
  if (val != null) reviewText.value = val
})

// ── Computed ─────────────────────────────────────────────

const activeStar = computed<number>(() =>
  !props.readonly && hovered.value > 0 ? hovered.value : selected.value
)

const descriptors: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Great',
  5: 'Excellent!',
}

const descriptorColors: Record<number, string> = {
  1: '#ef4444',
  2: '#f97316',
  3: '#eab308',
  4: '#22c55e',
  5: '#16a34a',
}

const descriptor = computed<string>(() => descriptors[activeStar.value] ?? '')
const descriptorColor = computed<string>(() => descriptorColors[activeStar.value] ?? '#8b90a7')

const reviewPlaceholder = computed<string>(() => {
  const map: Record<number, string> = {
    1: 'What went wrong? Help us improve...',
    2: 'What could have been better?',
    3: 'What did you think overall?',
    4: 'What did you enjoy about this transaction?',
    5: 'Tell others what made this experience great!',
  }
  return map[selected.value] ?? 'Share your experience...'
})

// ── Methods ──────────────────────────────────────────────

function selectStar(star: number): void {
  if (props.readonly || props.disabled) return
  selected.value = star
  burst.value = false
  requestAnimationFrame(() => { burst.value = true })
  emit('update:modelValue', star)
  emit('change', star)
}

function handleSubmit(): void {
  if (!selected.value) return
  emit('submit', { rating: selected.value, review: reviewText.value })
}

function formatRating(val: number): string {
  return Number.isInteger(val) ? `${val}.0` : val.toFixed(1)
}

function particleStyle(index: number): Record<string, string> {
  const angle  = (index / 6) * 360
  const colors = ['#f97316', '#fbbf24', '#f59e0b', '#fb923c', '#fdba74', '#fde68a']
  return {
    '--angle': `${angle}deg`,
    background: colors[index - 1] ?? '#f97316',
  }
}
</script>

<style scoped>
/* ── Widget shell ── */
.rating-widget {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-family: 'DM Sans', sans-serif;
}

/* ── Label ── */
.rating-label {
  font-family: 'Sora', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #1a1f3c;
  letter-spacing: -0.3px;
}

/* ── Order chip ── */
.order-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f4f5fb;
  border: 1.5px solid #e8eaf2;
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 500;
  color: #1a1f3c;
  max-width: 260px;
}
.order-chip-icon { font-size: 14px; }
.order-chip-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Stars ── */
.stars-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.star-btn {
  position: relative;
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform .15s cubic-bezier(.34, 1.56, .64, 1);
  border-radius: 4px;
  outline: none;
}
.star-btn:focus-visible {
  box-shadow: 0 0 0 2px #f97316;
  border-radius: 6px;
}
.star-btn:not(.readonly):not(:disabled):hover {
  transform: scale(1.22) rotate(-5deg);
}
.star-btn:not(.readonly):not(:disabled):active {
  transform: scale(.9);
}
.star-btn.readonly { cursor: default; }
.star-btn:disabled { cursor: not-allowed; opacity: .5; }

/* size variants */
.size-sm .star-btn { padding: 2px; }
.size-lg .star-btn { padding: 6px; }

.star-icon {
  display: block;
  transition: opacity .12s, transform .12s;
  fill: currentColor;
}

/* Size: md (default) */
.size-md .star-icon { width: 32px; height: 32px; }
.size-sm .star-icon { width: 20px; height: 20px; }
.size-lg .star-icon { width: 44px; height: 44px; }

/* Empty state */
.filled-icon { color: #e8eaf2; position: absolute; top: 4px; left: 4px; }
.empty-icon  { color: #e8eaf2; }

.size-sm .filled-icon { top: 2px; left: 2px; }
.size-lg .filled-icon { top: 6px; left: 6px; }

/* Filled / hovered */
.star-btn.filled .filled-icon,
.star-btn.hovered .filled-icon {
  color: #f97316;
  animation: pop .18s cubic-bezier(.34,1.56,.64,1);
}
.star-btn.filled .empty-icon,
.star-btn.hovered .empty-icon {
  color: #f97316;
}

@keyframes pop {
  0%   { transform: scale(.7); opacity: .5; }
  60%  { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

/* ── Burst particles ── */
.burst {
  position: absolute;
  pointer-events: none;
  inset: 0;
}
.particle {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: burst-out .5s ease forwards;
  --angle: 0deg;
}
@keyframes burst-out {
  0%   { transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0)   scale(1);   opacity: 1; }
  100% { transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-20px) scale(0); opacity: 0; }
}

/* ── Descriptor ── */
.rating-descriptor,
.rating-placeholder {
  font-size: 13px;
  font-weight: 600;
  min-height: 20px;
  transition: color .2s;
}
.rating-placeholder { color: #c4c8d2; font-weight: 400; }

/* ── Review field ── */
.review-field {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.review-textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1.5px solid #e8eaf2;
  border-radius: 10px;
  padding: 12px 14px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  color: #1a1f3c;
  resize: vertical;
  outline: none;
  line-height: 1.6;
  transition: border-color .15s, box-shadow .15s;
  background: #fff;
}
.review-textarea:focus {
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249,115,22,.1);
}
.review-textarea::placeholder { color: #c4c8d2; }
.review-footer {
  display: flex;
  justify-content: flex-end;
}
.char-count { font-size: 11.5px; color: #8b90a7; }

/* ── Submit ── */
.submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #f97316;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 28px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: opacity .13s, transform .13s;
}
.submit-btn:hover:not(:disabled) { opacity: .87; transform: scale(.98); }
.submit-btn:disabled { opacity: .45; cursor: not-allowed; }

.spinner {
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255,255,255,.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .65s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Review count (readonly) ── */
.review-count {
  font-size: 12px;
  color: #8b90a7;
  font-weight: 500;
}

/* ── Transitions ── */
.label-fade-enter-active,
.label-fade-leave-active { transition: opacity .15s ease, transform .15s ease; }
.label-fade-enter-from,
.label-fade-leave-to     { opacity: 0; transform: translateY(-4px); }

.expand-enter-active { transition: all .25s ease; max-height: 200px; }
.expand-leave-active { transition: all .2s ease;  max-height: 200px; }
.expand-enter-from,
.expand-leave-to     { opacity: 0; transform: translateY(-6px); max-height: 0; }
</style>