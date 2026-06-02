<script setup lang="ts">
import AdminLayout from '@/components/Admin/AdminLayout.vue'
import { authFetch } from '@/utils/authFetch'
import { getToken } from '@/utils/tokenStorage'
import { onMounted, ref } from 'vue'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const siteName = ref('Material Xchange')
const maintenanceMode = ref(false)
const allowNewRegistrations = ref(true)
const maxListingsPerUser = ref(50)
const defaultCurrency = ref('USD')

const saved = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const fetchSettings = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const token = getToken()
    const response = await authFetch(`${API_BASE_URL}/admin/settings`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
    if (!response.ok) {
      throw new Error('Failed to fetch settings')
    }
    const data = await response.json()
    siteName.value = data.siteName
    maintenanceMode.value = data.maintenanceMode
    allowNewRegistrations.value = data.allowNewRegistrations
    maxListingsPerUser.value = data.maxListingsPerUser
    defaultCurrency.value = data.defaultCurrency
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to fetch settings'
  } finally {
    isLoading.value = false
  }
}

const saveSettings = async () => {
  saved.value = false
  errorMessage.value = ''
  try {
    const token = getToken()
    const response = await authFetch(`${API_BASE_URL}/admin/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        siteName: siteName.value,
        maintenanceMode: maintenanceMode.value,
        allowNewRegistrations: allowNewRegistrations.value,
        maxListingsPerUser: maxListingsPerUser.value,
        defaultCurrency: defaultCurrency.value,
      }),
    })
    if (!response.ok) {
      throw new Error('Failed to save settings')
    }
    saved.value = true
    setTimeout(() => (saved.value = false), 2500)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to save settings'
  }
}

const clearAllListings = async () => {
  if (!confirm('Are you absolutely sure you want to delete ALL listings on the platform? This cannot be undone.')) {
    return
  }
  try {
    const token = getToken()
    const response = await authFetch(`${API_BASE_URL}/admin/settings/listings`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
    if (!response.ok) {
      throw new Error('Failed to clear listings')
    }
    alert('All listings have been deleted successfully!')
  } catch (error) {
    alert(error instanceof Error ? error.message : 'Failed to clear listings')
  }
}

const resetPlatformData = async () => {
  if (!confirm('Are you absolutely sure you want to reset all platform data (transactions, reports, activity logs)? This cannot be undone.')) {
    return
  }
  try {
    const token = getToken()
    const response = await authFetch(`${API_BASE_URL}/admin/settings/reset`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
    if (!response.ok) {
      throw new Error('Failed to reset platform data')
    }
    alert('Platform data has been reset successfully!')
  } catch (error) {
    alert(error instanceof Error ? error.message : 'Failed to reset platform data')
  }
}

onMounted(fetchSettings)
</script>

<template>
  <AdminLayout>
    <div class="settings-page">
      <header class="page-header">
        <div>
          <h1 class="page-title">Settings</h1>
          <p class="page-sub">Configure platform-wide options</p>
        </div>
        <button class="save-btn" :class="{ success: saved }" :disabled="isLoading" @click="saveSettings">
          {{ saved ? '✓ Saved' : 'Save Changes' }}
        </button>
      </header>

      <div v-if="errorMessage" class="error-banner">{{ errorMessage }}</div>
      <div v-if="isLoading" class="loading-banner">Loading settings...</div>

      <div class="cards">
        <!-- General -->
        <section class="card">
          <h2 class="card-title">General</h2>
          <div class="field">
            <label>Site Name</label>
            <input v-model="siteName" type="text" />
          </div>
          <div class="field">
            <label>Default Currency</label>
            <select v-model="defaultCurrency">
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — British Pound</option>
              <option value="JPY">JPY — Japanese Yen</option>
            </select>
          </div>
          <div class="field">
            <label>Max Listings per User</label>
            <input v-model.number="maxListingsPerUser" type="number" min="1" />
          </div>
        </section>

        <!-- Access -->
        <section class="card">
          <h2 class="card-title">Access Control</h2>
          <div class="toggle-row">
            <div>
              <p class="toggle-label">Allow New Registrations</p>
              <p class="toggle-desc">Let new users sign up to the platform</p>
            </div>
            <button
              class="toggle"
              :class="{ on: allowNewRegistrations }"
              @click="allowNewRegistrations = !allowNewRegistrations"
            >
              <span class="knob" />
            </button>
          </div>
          <div class="toggle-row">
            <div>
              <p class="toggle-label">Maintenance Mode</p>
              <p class="toggle-desc">Take the site offline for maintenance</p>
            </div>
            <button
              class="toggle"
              :class="{ on: maintenanceMode }"
              @click="maintenanceMode = !maintenanceMode"
            >
              <span class="knob" />
            </button>
          </div>
        </section>

        <!-- Danger Zone -->
        <section class="card danger-card">
          <h2 class="card-title danger-title">Danger Zone</h2>
          <div class="danger-row">
            <div>
              <p class="toggle-label">Clear All Listings</p>
              <p class="toggle-desc">Permanently delete every listing on the platform</p>
            </div>
            <button class="danger-btn" @click="clearAllListings">Delete All</button>
          </div>
          <div class="danger-row">
            <div>
              <p class="toggle-label">Reset Platform Data</p>
              <p class="toggle-desc">Wipe all transactions, reports and activity logs</p>
            </div>
            <button class="danger-btn" @click="resetPlatformData">Reset</button>
          </div>
        </section>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.page-sub {
  color: #64748b;
  margin: 4px 0 0;
  font-size: 14px;
}

.save-btn {
  padding: 10px 22px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #6c63ff, #ff9f1c);
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
}

.save-btn:hover { opacity: 0.88; transform: translateY(-1px); }
.save-btn.success { background: linear-gradient(135deg, #22c55e, #16a34a); }
.save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.error-banner {
  background: #fee2e2;
  border: 1px solid #fca5a5;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
}

.loading-banner {
  color: #64748b;
  font-size: 14px;
}

.cards {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(0, 0, 0, 0.07);
  border-radius: 16px;
  padding: 28px;
  backdrop-filter: blur(6px);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

/* Fields */
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.field input,
.field select {
  padding: 9px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #0f172a;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
  max-width: 360px;
}

.field input:focus,
.field select:focus {
  border-color: #6c63ff;
}

/* Toggles */
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 4px 0;
}

.toggle-label {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.toggle-desc {
  font-size: 12px;
  color: #64748b;
  margin: 2px 0 0;
}

.toggle {
  width: 48px;
  height: 26px;
  border-radius: 999px;
  background: #cbd5e1;
  border: none;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
  transition: background 0.25s;
}

.toggle.on { background: #6c63ff; }

.knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.25s;
  display: block;
}

.toggle.on .knob { transform: translateX(22px); }

/* Danger */
.danger-card {
  border-color: rgba(239, 68, 68, 0.25);
  background: rgba(255, 245, 245, 0.75);
}

.danger-title { color: #dc2626; }

.danger-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.danger-btn {
  padding: 8px 18px;
  border-radius: 8px;
  border: 1px solid #fca5a5;
  background: #fff;
  color: #dc2626;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
}

.danger-btn:hover { background: #fee2e2; }
</style>
