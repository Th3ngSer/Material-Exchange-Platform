<template>
  <div class="dropdown-wrapper" ref="wrapperRef">
    <button
      class="dropdown-trigger"
      :class="{ open: isOpen, disabled: disabled }"
      :disabled="disabled"
      @click="toggle"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
    >
      <span class="trigger-icon" v-if="icon">{{ icon }}</span>
      <span class="trigger-label">{{ selectedLabel || placeholder }}</span>
      <span class="trigger-arrow" :class="{ rotated: isOpen }">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </button>

    <Transition name="dropdown">
      <div
        v-if="isOpen"
        class="dropdown-menu"
        :class="[`align-${align}`, `size-${size}`]"
        role="listbox"
      >
        <div v-if="searchable" class="dropdown-search">
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            placeholder="Search..."
            class="search-input"
            @keydown.esc="close"
          />
        </div>

        <div class="dropdown-items">
          <template v-for="item in filteredItems" :key="item.value ?? item.label">
            <div v-if="item.divider" class="dropdown-divider" />
            <div v-else-if="item.group" class="dropdown-group-label">{{ item.label }}</div>
            <button
              v-else
              class="dropdown-item"
              :class="{
                active: modelValue === item.value,
                disabled: item.disabled,
              }"
              :disabled="item.disabled"
              role="option"
              :aria-selected="modelValue === item.value"
              @click="select(item)"
            >
              <span v-if="item.icon" class="item-icon">{{ item.icon }}</span>
              <span class="item-content">
                <span class="item-label">{{ item.label }}</span>
                <span v-if="item.description" class="item-description">{{ item.description }}</span>
              </span>
              <span
                v-if="item.badge"
                class="item-badge"
                :class="`badge-${item.badge.variant ?? 'default'}`"
              >
                {{ item.badge.text }}
              </span>
              <span v-if="modelValue === item.value" class="item-check">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </button>
          </template>

          <div v-if="filteredItems.length === 0" class="dropdown-empty">
            {{ emptyText }}
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'

// ── Types ────────────────────────────────────────────────────────────────────

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'

export interface DropdownBadge {
  text: string
  variant?: BadgeVariant
}

export interface DropdownItem {
  label: string
  value?: string | number
  icon?: string
  description?: string
  badge?: DropdownBadge
  disabled?: boolean
  /** Renders a horizontal divider line (other fields ignored) */
  divider?: boolean
  /** Renders a non-clickable group header */
  group?: boolean
}

export type DropdownAlign = 'left' | 'right'
export type DropdownSize  = 'sm' | 'md' | 'lg'

// ── Props ────────────────────────────────────────────────────────────────────

interface Props {
  /** Currently selected value (use with v-model) */
  modelValue?: string | number | null
  /** Array of menu items */
  items?: DropdownItem[]
  /** Placeholder text when nothing is selected */
  placeholder?: string
  /** Leading emoji/icon displayed in the trigger button */
  icon?: string | null
  /** Disables the entire dropdown */
  disabled?: boolean
  /** Enables a live search/filter input inside the menu */
  searchable?: boolean
  /** Horizontal alignment of the dropdown menu */
  align?: DropdownAlign
  /** Size variant of the trigger and menu items */
  size?: DropdownSize
  /** Text shown when no items match the search query */
  emptyText?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  items: () => [],
  placeholder: 'Select an option',
  icon: null,
  disabled: false,
  searchable: false,
  align: 'left',
  size: 'md',
  emptyText: 'No results found',
})

// ── Emits ────────────────────────────────────────────────────────────────────

const emit = defineEmits<{
  /** Fires when a new item is selected; carries the new value */
  (e: 'update:modelValue', value: string | number | null): void
  /** Fires with the full selected DropdownItem object */
  (e: 'change', item: DropdownItem): void
  /** Fires when the menu opens */
  (e: 'open'): void
  /** Fires when the menu closes */
  (e: 'close'): void
}>()

// ── State ────────────────────────────────────────────────────────────────────

const isOpen      = ref<boolean>(false)
const searchQuery = ref<string>('')
const wrapperRef  = ref<HTMLDivElement | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)

// ── Computed ─────────────────────────────────────────────────────────────────

const selectedLabel = computed<string | null>(() => {
  const found = props.items.find(i => i.value === props.modelValue)
  return found?.label ?? null
})

const filteredItems = computed<DropdownItem[]>(() => {
  if (!props.searchable || !searchQuery.value) return props.items
  const q = searchQuery.value.toLowerCase()
  return props.items.filter(
    i => i.divider || i.group || i.label.toLowerCase().includes(q)
  )
})

// ── Methods ──────────────────────────────────────────────────────────────────

function toggle(): void {
  isOpen.value ? close() : open()
}

function open(): void {
  if (props.disabled) return
  isOpen.value = true
  emit('open')
  if (props.searchable) {
    nextTick(() => searchInput.value?.focus())
  }
}

function close(): void {
  isOpen.value = false
  searchQuery.value = ''
  emit('close')
}

function select(item: DropdownItem): void {
  if (item.disabled) return
  emit('update:modelValue', item.value ?? null)
  emit('change', item)
  close()
}

function handleClickOutside(event: MouseEvent): void {
  if (wrapperRef.value && !wrapperRef.value.contains(event.target as Node)) {
    close()
  }
}

// ── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(()       => document.addEventListener('mousedown', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', handleClickOutside))
</script>

<style scoped>
/* ── Design tokens ─────────────────────────────────────── */
.dropdown-wrapper {
  --dd-bg:           #ffffff;
  --dd-border:       #e2e5eb;
  --dd-shadow:       0 8px 24px rgba(0,0,0,.10), 0 2px 6px rgba(0,0,0,.06);
  --dd-radius:       10px;
  --dd-accent:       #5b5ef4;
  --dd-accent-light: #ededff;
  --dd-text:         #1a1d23;
  --dd-muted:        #7a7f8e;
  --dd-hover:        #f5f6f9;
  --dd-disabled:     #c4c8d2;
  --dd-font:         'DM Sans', system-ui, sans-serif;

  position: relative;
  display: inline-block;
  font-family: var(--dd-font);
}

/* ── Trigger ───────────────────────────────────────────── */
.dropdown-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  background: var(--dd-bg);
  border: 1.5px solid var(--dd-border);
  border-radius: var(--dd-radius);
  color: var(--dd-text);
  font-family: var(--dd-font);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color .18s, box-shadow .18s;
  white-space: nowrap;
  user-select: none;
}
.dropdown-trigger:hover:not(:disabled) {
  border-color: var(--dd-accent);
  box-shadow: 0 0 0 3px rgba(91,94,244,.10);
}
.dropdown-trigger.open {
  border-color: var(--dd-accent);
  box-shadow: 0 0 0 3px rgba(91,94,244,.14);
}
.dropdown-trigger.disabled,
.dropdown-trigger:disabled { opacity: .5; cursor: not-allowed; }

.trigger-label { flex: 1; }
.trigger-icon  { font-size: 16px; }
.trigger-arrow {
  display: flex;
  align-items: center;
  color: var(--dd-muted);
  transition: transform .22s cubic-bezier(.34,1.56,.64,1);
}
.trigger-arrow.rotated { transform: rotate(180deg); }

/* ── Menu ──────────────────────────────────────────────── */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  z-index: 999;
  min-width: 100%;
  background: var(--dd-bg);
  border: 1.5px solid var(--dd-border);
  border-radius: var(--dd-radius);
  box-shadow: var(--dd-shadow);
  overflow: hidden;
}
.dropdown-menu.align-right { right: 0; left: auto; }
.dropdown-menu.align-left  { left: 0;  right: auto; }

.dropdown-menu.size-sm .dropdown-item { font-size: 12px;  padding: 7px 10px; }
.dropdown-menu.size-lg .dropdown-item { font-size: 15px;  padding: 12px 16px; }

/* ── Search ────────────────────────────────────────────── */
.dropdown-search {
  padding: 8px 8px 4px;
  border-bottom: 1px solid var(--dd-border);
}
.search-input {
  width: 100%;
  box-sizing: border-box;
  padding: 7px 10px;
  border: 1.5px solid var(--dd-border);
  border-radius: 6px;
  font-size: 13px;
  font-family: var(--dd-font);
  color: var(--dd-text);
  outline: none;
  transition: border-color .15s;
}
.search-input:focus { border-color: var(--dd-accent); }

/* ── Items ─────────────────────────────────────────────── */
.dropdown-items {
  padding: 5px;
  max-height: 280px;
  overflow-y: auto;
}
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 9px 12px;
  background: none;
  border: none;
  border-radius: 7px;
  text-align: left;
  font-family: var(--dd-font);
  font-size: 13.5px;
  color: var(--dd-text);
  cursor: pointer;
  transition: background .13s;
  box-sizing: border-box;
}
.dropdown-item:hover:not(:disabled) { background: var(--dd-hover); }
.dropdown-item.active {
  background: var(--dd-accent-light);
  color: var(--dd-accent);
  font-weight: 600;
}
.dropdown-item.disabled { color: var(--dd-disabled); cursor: not-allowed; }

.item-icon        { font-size: 16px; flex-shrink: 0; }
.item-content     { flex: 1; display: flex; flex-direction: column; gap: 1px; }
.item-label       { line-height: 1.3; }
.item-description { font-size: 11.5px; color: var(--dd-muted); line-height: 1.3; }
.item-check       { color: var(--dd-accent); display: flex; align-items: center; flex-shrink: 0; }

/* ── Badge ─────────────────────────────────────────────── */
.item-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 20px;
  flex-shrink: 0;
}
.badge-default { background: #eef0f5; color: #5a6278; }
.badge-success { background: #e6f7ee; color: #1a8a4a; }
.badge-warning { background: #fff5e6; color: #b06000; }
.badge-danger  { background: #ffeaea; color: #c0392b; }
.badge-info    { background: #e8f0ff; color: #2858c5; }

/* ── Divider & Group ───────────────────────────────────── */
.dropdown-divider {
  height: 1px;
  background: var(--dd-border);
  margin: 5px 8px;
}
.dropdown-group-label {
  padding: 6px 12px 2px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--dd-muted);
}

/* ── Empty ─────────────────────────────────────────────── */
.dropdown-empty {
  padding: 18px 12px;
  text-align: center;
  font-size: 13px;
  color: var(--dd-muted);
}

/* ── Transition ────────────────────────────────────────── */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity .17s ease, transform .17s cubic-bezier(.34,1.56,.64,1);
  transform-origin: top left;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scaleY(.88) translateY(-6px);
}
</style>