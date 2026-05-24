<template>
  <div class="report-page">

    <!-- ── Page header ── -->
    <div class="page-header">
      <div class="page-header-inner">
        <button class="back-btn" @click="$router.back?.() ?? $emit('back')">
          <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/></svg>
          Back
        </button>
        <div>
          <h1 class="page-title">Report an Issue</h1>
          <p class="page-desc">Having a problem with a received item? We'll investigate and help resolve it.</p>
        </div>
      </div>
    </div>

    <div class="report-layout">

      <!-- ── LEFT: Form ── -->
      <div class="form-col">

        <!-- Success state -->
        <Transition name="fade">
          <div v-if="submitted" class="success-card">
            <div class="success-icon">✅</div>
            <h2>Report Submitted</h2>
            <p>Your report <strong>#RPT-{{ Math.floor(Math.random() * 900 + 2100) }}</strong> has been received. Our team will review it within 2–3 business days and contact you via email.</p>
            <div class="success-actions">
              <button class="btn btn-outline" @click="resetForm">Submit Another</button>
              <button class="btn btn-primary" @click="$emit('goHome')">Back to Home</button>
            </div>
          </div>
        </Transition>

        <template v-if="!submitted">
          <!-- Step indicator -->
          <div class="stepper">
            <div
              v-for="s in 3"
              :key="s"
              class="step-item"
              :class="{ active: step === s, done: step > s }"
            >
              <div class="step-circle">
                <svg v-if="step > s" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                <span v-else>{{ s }}</span>
              </div>
              <span class="step-label">{{ ['Order & Reason', 'Details & Evidence', 'Review & Submit'][s - 1] }}</span>
            </div>
            <div class="step-track"><div class="step-fill" :style="{ width: `${(step - 1) * 50}%` }" /></div>
          </div>

          <!-- ─ STEP 1 ─ -->
          <Transition name="slide" mode="out-in">
            <div v-if="step === 1" key="step1" class="form-card">
              <div class="card-title">
                <span class="card-num">01</span>
                Select Order & Reason
              </div>

              <!-- Order ID -->
              <div class="field">
                <label class="field-label">Order ID <span class="required">*</span></label>
                <div class="input-wrap">
                  <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/></svg>
                  <input
                    v-model="form.orderId"
                    type="text"
                    placeholder="e.g. ORD-8821"
                    class="text-input"
                  />
                </div>
                <p class="field-hint">Find your Order ID in your exchange history or confirmation email.</p>
              </div>

              <!-- Reason grid -->
              <div class="field">
                <label class="field-label">Reason for Report <span class="required">*</span></label>
                <div class="reason-grid">
                  <button
                    v-for="opt in reasonOptions"
                    :key="opt.value"
                    class="reason-card"
                    :class="{ selected: form.reason === opt.value }"
                    @click="selectReason(opt.value)"
                  >
                    <span class="reason-icon">{{ opt.icon }}</span>
                    <span class="reason-label">{{ opt.label }}</span>
                    <span class="reason-desc">{{ opt.description }}</span>
                    <span class="reason-check">
                      <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                    </span>
                  </button>
                </div>
              </div>

              <div class="form-nav">
                <div />
                <button class="btn btn-primary" :disabled="!isStep1Valid" @click="nextStep">
                  Continue
                  <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                </button>
              </div>
            </div>
          </Transition>

          <!-- ─ STEP 2 ─ -->
          <Transition name="slide" mode="out-in">
            <div v-if="step === 2" key="step2" class="form-card">
              <div class="card-title">
                <span class="card-num">02</span>
                Describe the Issue
              </div>

              <!-- Description -->
              <div class="field">
                <label class="field-label">
                  What happened? <span class="required">*</span>
                  <span class="char-count" :class="{ warn: form.description.length < 30 }">
                    {{ form.description.length }} / 1000
                  </span>
                </label>
                <textarea
                  v-model="form.description"
                  class="textarea"
                  rows="5"
                  placeholder="Please describe the issue in detail. Include what you expected vs. what you received, when the problem was discovered, and any communication with the seller..."
                  maxlength="1000"
                />
                <p v-if="form.description.length < 30 && form.description.length > 0" class="field-error">
                  Please provide at least 30 characters ({{ 30 - form.description.length }} more needed)
                </p>
              </div>

              <!-- Evidence upload -->
              <div class="field">
                <label class="field-label">Evidence / Photos <span class="optional">(optional but recommended)</span></label>
                <div
                  class="dropzone"
                  :class="{ dragging: isDragging }"
                  @dragover.prevent="isDragging = true"
                  @dragleave="isDragging = false"
                  @drop.prevent="onDrop"
                  @click="triggerFileInput"
                >
                  <input ref="fileInput" type="file" multiple accept="image/*,.pdf,.doc,.docx" class="file-input" @change="onFileChange" />
                  <svg class="dropzone-icon" viewBox="0 0 48 48" fill="none"><path d="M28 8H12a4 4 0 00-4 4v24a4 4 0 004 4h24a4 4 0 004-4V20L28 8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="28 8 28 20 40 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <p class="dropzone-label">Drop files here or <span>browse</span></p>
                  <p class="dropzone-hint">Images, PDFs, documents — up to 10MB each</p>
                </div>

                <!-- Preview grid -->
                <div v-if="form.evidence.length" class="evidence-grid">
                  <div
                    v-for="file in form.evidence"
                    :key="file.id"
                    class="evidence-item"
                  >
                    <img v-if="file.preview" :src="file.preview" class="evidence-thumb" :alt="file.name" />
                    <div v-else class="evidence-file-icon">📄</div>
                    <div class="evidence-info">
                      <span class="evidence-name">{{ file.name }}</span>
                      <span class="evidence-size">{{ formatSize(file.size) }}</span>
                    </div>
                    <button class="evidence-remove" @click="removeFile(file.id)">
                      <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                    </button>
                  </div>
                </div>
              </div>

              <div class="form-nav">
                <button class="btn btn-ghost" @click="prevStep">← Back</button>
                <button class="btn btn-primary" :disabled="!isStep2Valid" @click="nextStep">
                  Continue
                  <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                </button>
              </div>
            </div>
          </Transition>

          <!-- ─ STEP 3 ─ -->
          <Transition name="slide" mode="out-in">
            <div v-if="step === 3" key="step3" class="form-card">
              <div class="card-title">
                <span class="card-num">03</span>
                Review & Submit
              </div>

              <!-- Summary -->
              <div class="summary-box">
                <div class="summary-row">
                  <span class="summary-key">Order ID</span>
                  <span class="summary-val">{{ form.orderId }}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-key">Reason</span>
                  <span class="summary-val">
                    {{ reasonOptions.find(r => r.value === form.reason)?.icon }}
                    {{ reasonOptions.find(r => r.value === form.reason)?.label }}
                  </span>
                </div>
                <div class="summary-row">
                  <span class="summary-key">Description</span>
                  <span class="summary-val summary-desc">{{ form.description }}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-key">Evidence</span>
                  <span class="summary-val">{{ form.evidence.length ? `${form.evidence.length} file(s) attached` : 'None' }}</span>
                </div>
              </div>

              <!-- Notice -->
              <div class="notice-box">
                <svg viewBox="0 0 20 20" fill="currentColor" class="notice-icon"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
                <p>False reports may result in account suspension. Our team will contact both parties and make a fair decision based on the evidence provided.</p>
              </div>

              <!-- Terms -->
              <label class="terms-check">
                <input type="checkbox" v-model="form.agreeToTerms" />
                <span>I confirm this report is accurate and I agree to the <a href="#">Dispute Resolution Policy</a>.</span>
              </label>

              <div class="form-nav">
                <button class="btn btn-ghost" @click="prevStep">← Back</button>
                <button
                  class="btn btn-danger"
                  :disabled="!isStep3Valid || submitting"
                  @click="submitReport"
                >
                  <span v-if="submitting" class="spinner" />
                  <span v-else>Submit Report</span>
                </button>
              </div>
            </div>
          </Transition>
        </template>
      </div>

      <!-- ── RIGHT: Sidebar ── -->
      <div class="side-col">

        <!-- Help card -->
        <div class="help-card">
          <div class="help-header">
            <span class="help-icon">🛡️</span>
            <div>
              <div class="help-title">Buyer Protection</div>
              <div class="help-sub">DoOrii has your back</div>
            </div>
          </div>
          <ul class="help-list">
            <li>
              <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
              <span>Reports reviewed within <strong>2–3 business days</strong></span>
            </li>
            <li>
              <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
              <span>Both parties are notified and given a chance to respond</span>
            </li>
            <li>
              <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
              <span>Eligible for full or partial refund if fraud is confirmed</span>
            </li>
            <li>
              <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
              <span>Fraudulent sellers are banned from the platform</span>
            </li>
          </ul>
        </div>

        <!-- Tips card -->
        <div class="tips-card">
          <div class="tips-title">💡 Tips for a Stronger Report</div>
          <ul class="tips-list">
            <li>Include clear photos of the item received vs. the listing images</li>
            <li>Attach any screenshots of conversations with the seller</li>
            <li>Note the exact date you received the item</li>
            <li>Be specific about how the item differs from the description</li>
          </ul>
        </div>

        <!-- Recent reports -->
        <div class="recent-card" v-if="recentReports.length">
          <div class="recent-title">Your Recent Reports</div>
          <div
            v-for="r in recentReports"
            :key="r.id"
            class="recent-item"
          >
            <div class="recent-top">
              <span class="recent-id">{{ r.id }}</span>
              <span class="recent-status" :style="{ background: statusColor[r.status] + '22', color: statusColor[r.status] }">
                {{ statusLabel[r.status] }}
              </span>
            </div>
            <div class="recent-item-name">{{ r.item }}</div>
            <div class="recent-meta">{{ r.seller }} · {{ r.date }}</div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useReport } from '../composable/useReport'

const {
  step, submitting, submitted,
  form, reasonOptions, recentReports,
  statusColor, statusLabel,
  isStep1Valid, isStep2Valid, isStep3Valid,
  selectReason, addFiles, removeFile,
  nextStep, prevStep, submitReport, resetForm, formatSize,
} = useReport()

const isDragging = ref(false)
const fileInput  = ref<HTMLInputElement | null>(null)

function triggerFileInput(): void {
  fileInput.value?.click()
}

function onFileChange(e: Event): void {
  const files = (e.target as HTMLInputElement).files
  if (files) addFiles(files)
}

function onDrop(e: DragEvent): void {
  isDragging.value = false
  if (e.dataTransfer?.files) addFiles(e.dataTransfer.files)
}

defineEmits<{
  (e: 'back'): void
  (e: 'goHome'): void
}>()
</script>

<style scoped>
/* ── Page shell ── */
.report-page {
  min-height: calc(100vh - 56px);
  background: #f4f5fb;
  font-family: 'DM Sans', sans-serif;
}

/* ── Header ── */
.page-header {
  background: #fff;
  border-bottom: 1.5px solid #e8eaf2;
  padding: 20px 40px;
}
.page-header-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}
.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1.5px solid #e8eaf2;
  border-radius: 8px;
  padding: 7px 13px;
  font-size: 13px;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  color: #8b90a7;
  cursor: pointer;
  white-space: nowrap;
  margin-top: 4px;
  transition: border-color .15s, color .15s;
}
.back-btn:hover { border-color: #1a1f3c; color: #1a1f3c; }
.back-btn svg { width: 14px; height: 14px; }

.page-title {
  font-family: 'Sora', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #1a1f3c;
  letter-spacing: -0.4px;
  margin-bottom: 4px;
}
.page-desc {
  font-size: 13.5px;
  color: #8b90a7;
}

/* ── Layout ── */
.report-layout {
  display: flex;
  gap: 24px;
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 40px 60px;
  align-items: flex-start;
}

.form-col { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 20px; }
.side-col  { width: 300px; flex-shrink: 0; display: flex; flex-direction: column; gap: 16px; }

/* ── Stepper ── */
.stepper {
  display: flex;
  align-items: center;
  gap: 0;
  background: #fff;
  border: 1.5px solid #e8eaf2;
  border-radius: 12px;
  padding: 16px 24px;
  position: relative;
}
.step-track {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px;
  background: #e8eaf2;
  border-radius: 0 0 12px 12px;
  overflow: hidden;
}
.step-fill {
  height: 100%;
  background: #f97316;
  border-radius: 0 0 12px 12px;
  transition: width .4s cubic-bezier(.4,0,.2,1);
}
.step-item {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}
.step-item:not(:last-child)::after {
  content: '';
  flex: 1;
  height: 1.5px;
  background: #e8eaf2;
  margin: 0 8px;
}
.step-item.done:not(:last-child)::after { background: #f97316; }

.step-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #e8eaf2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #8b90a7;
  background: #fff;
  flex-shrink: 0;
  transition: all .2s;
}
.step-item.active .step-circle {
  border-color: #f97316;
  color: #f97316;
  background: #fff3e8;
}
.step-item.done .step-circle {
  border-color: #f97316;
  background: #f97316;
  color: #fff;
}
.step-item.done .step-circle svg { width: 14px; height: 14px; }

.step-label {
  font-size: 12px;
  font-weight: 600;
  color: #c4c8d2;
  white-space: nowrap;
}
.step-item.active .step-label { color: #1a1f3c; }
.step-item.done  .step-label  { color: #8b90a7; }

/* ── Form card ── */
.form-card {
  background: #fff;
  border: 1.5px solid #e8eaf2;
  border-radius: 14px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.card-title {
  font-family: 'Sora', sans-serif;
  font-size: 17px;
  font-weight: 700;
  color: #1a1f3c;
  display: flex;
  align-items: center;
  gap: 12px;
}
.card-num {
  font-size: 11px;
  font-weight: 700;
  color: #f97316;
  background: #fff3e8;
  border-radius: 6px;
  padding: 2px 8px;
  letter-spacing: 0.05em;
}

/* ── Fields ── */
.field { display: flex; flex-direction: column; gap: 8px; }
.field-label {
  font-size: 13px;
  font-weight: 600;
  color: #1a1f3c;
  display: flex;
  align-items: center;
  gap: 6px;
}
.required { color: #ef4444; }
.optional  { font-size: 11.5px; color: #8b90a7; font-weight: 400; }
.field-hint  { font-size: 11.5px; color: #8b90a7; }
.field-error { font-size: 11.5px; color: #ef4444; }

.char-count {
  margin-left: auto;
  font-size: 11.5px;
  color: #8b90a7;
  font-weight: 400;
}
.char-count.warn { color: #ef4444; }

.input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1.5px solid #e8eaf2;
  border-radius: 8px;
  padding: 0 14px;
  background: #fff;
  transition: border-color .15s;
}
.input-wrap:focus-within { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,.1); }
.input-icon { width: 16px; height: 16px; color: #8b90a7; flex-shrink: 0; }
.text-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: #1a1f3c;
  padding: 11px 0;
  outline: none;
}
.text-input::placeholder { color: #c4c8d2; }

.textarea {
  border: 1.5px solid #e8eaf2;
  border-radius: 8px;
  padding: 12px 14px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: #1a1f3c;
  resize: vertical;
  outline: none;
  line-height: 1.6;
  transition: border-color .15s;
}
.textarea:focus { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,.1); }
.textarea::placeholder { color: #c4c8d2; }

/* ── Reason grid ── */
.reason-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.reason-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 14px;
  background: #fff;
  border: 1.5px solid #e8eaf2;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  font-family: 'DM Sans', sans-serif;
  transition: border-color .15s, background .15s, transform .15s;
}
.reason-card:hover { border-color: #f97316; background: #fff8f3; transform: translateY(-1px); }
.reason-card.selected { border-color: #f97316; background: #fff3e8; }

.reason-icon  { font-size: 22px; margin-bottom: 2px; }
.reason-label { font-size: 13px; font-weight: 700; color: #1a1f3c; }
.reason-desc  { font-size: 11px; color: #8b90a7; line-height: 1.4; }

.reason-check {
  position: absolute;
  top: 10px; right: 10px;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: #f97316;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity .15s;
}
.reason-card.selected .reason-check { opacity: 1; }
.reason-check svg { width: 10px; height: 10px; color: #fff; }

/* ── Dropzone ── */
.dropzone {
  border: 2px dashed #e8eaf2;
  border-radius: 10px;
  padding: 28px;
  text-align: center;
  cursor: pointer;
  transition: border-color .15s, background .15s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.dropzone:hover,
.dropzone.dragging { border-color: #f97316; background: #fff8f3; }
.file-input { display: none; }
.dropzone-icon { width: 36px; height: 36px; color: #c4c8d2; margin-bottom: 4px; }
.dropzone-label { font-size: 14px; color: #8b90a7; }
.dropzone-label span { color: #f97316; font-weight: 600; text-decoration: underline; }
.dropzone-hint { font-size: 12px; color: #c4c8d2; }

/* Evidence grid */
.evidence-grid { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
.evidence-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #f4f5fb;
  border-radius: 8px;
  border: 1.5px solid #e8eaf2;
}
.evidence-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}
.evidence-file-icon { font-size: 28px; flex-shrink: 0; }
.evidence-info { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.evidence-name { font-size: 13px; font-weight: 500; color: #1a1f3c; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.evidence-size { font-size: 11.5px; color: #8b90a7; }
.evidence-remove {
  background: none;
  border: none;
  cursor: pointer;
  color: #c4c8d2;
  display: flex;
  padding: 4px;
  border-radius: 4px;
  transition: color .13s;
}
.evidence-remove:hover { color: #ef4444; }
.evidence-remove svg { width: 14px; height: 14px; }

/* ── Summary ── */
.summary-box {
  background: #f4f5fb;
  border-radius: 10px;
  border: 1.5px solid #e8eaf2;
  overflow: hidden;
}
.summary-row {
  display: flex;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid #e8eaf2;
}
.summary-row:last-child { border-bottom: none; }
.summary-key { font-size: 12.5px; font-weight: 600; color: #8b90a7; width: 100px; flex-shrink: 0; }
.summary-val { font-size: 13px; color: #1a1f3c; flex: 1; }
.summary-desc { font-size: 12.5px; line-height: 1.5; white-space: pre-wrap; }

/* ── Notice ── */
.notice-box {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: #fff8f0;
  border: 1.5px solid #fed7aa;
  border-radius: 10px;
  padding: 14px 16px;
}
.notice-icon { width: 18px; height: 18px; color: #f97316; flex-shrink: 0; margin-top: 1px; }
.notice-box p { font-size: 12.5px; color: #92400e; line-height: 1.55; }

/* ── Terms ── */
.terms-check {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
}
.terms-check input { margin-top: 2px; accent-color: #f97316; cursor: pointer; }
.terms-check span { font-size: 13px; color: #1a1f3c; line-height: 1.5; }
.terms-check a { color: #f97316; text-decoration: none; }
.terms-check a:hover { text-decoration: underline; }

/* ── Nav ── */
.form-nav { display: flex; align-items: center; justify-content: space-between; margin-top: 4px; }

/* ── Buttons ── */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: opacity .13s, transform .13s;
}
.btn svg { width: 14px; height: 14px; }
.btn:hover:not(:disabled) { opacity: .85; transform: scale(.98); }
.btn:disabled { opacity: .45; cursor: not-allowed; }

.btn-primary { background: #f97316; color: #fff; }
.btn-danger  { background: #ef4444; color: #fff; }
.btn-outline { background: #fff; color: #1a1f3c; border: 1.5px solid #e8eaf2; }
.btn-ghost   { background: transparent; color: #8b90a7; padding-left: 0; }
.btn-ghost:hover:not(:disabled) { color: #1a1f3c; }

/* Spinner */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Success ── */
.success-card {
  background: #fff;
  border: 1.5px solid #e8eaf2;
  border-radius: 14px;
  padding: 48px 32px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.success-icon { font-size: 48px; }
.success-card h2 {
  font-family: 'Sora', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #1a1f3c;
}
.success-card p { font-size: 14px; color: #8b90a7; max-width: 380px; line-height: 1.6; }
.success-actions { display: flex; gap: 12px; margin-top: 8px; }

/* ── Sidebar cards ── */
.help-card {
  background: #1a1f3c;
  border-radius: 14px;
  padding: 22px;
  color: #fff;
}
.help-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}
.help-icon { font-size: 28px; }
.help-title { font-family: 'Sora', sans-serif; font-size: 15px; font-weight: 700; }
.help-sub   { font-size: 11.5px; color: rgba(255,255,255,.5); }
.help-list  { list-style: none; display: flex; flex-direction: column; gap: 12px; }
.help-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 12.5px;
  color: rgba(255,255,255,.75);
  line-height: 1.5;
}
.help-list li svg { width: 16px; height: 16px; color: #f97316; flex-shrink: 0; margin-top: 1px; }
.help-list li strong { color: #fff; }

.tips-card {
  background: #fff;
  border: 1.5px solid #e8eaf2;
  border-radius: 14px;
  padding: 20px;
}
.tips-title {
  font-size: 13.5px;
  font-weight: 700;
  color: #1a1f3c;
  margin-bottom: 14px;
}
.tips-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.tips-list li {
  font-size: 12.5px;
  color: #8b90a7;
  line-height: 1.5;
  padding-left: 14px;
  position: relative;
}
.tips-list li::before {
  content: '·';
  position: absolute;
  left: 0;
  color: #f97316;
  font-weight: 700;
}

.recent-card {
  background: #fff;
  border: 1.5px solid #e8eaf2;
  border-radius: 14px;
  padding: 20px;
}
.recent-title {
  font-size: 13.5px;
  font-weight: 700;
  color: #1a1f3c;
  margin-bottom: 14px;
}
.recent-item {
  padding: 12px 0;
  border-bottom: 1px solid #f4f5fb;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.recent-item:last-child { border-bottom: none; padding-bottom: 0; }
.recent-top { display: flex; align-items: center; justify-content: space-between; }
.recent-id { font-size: 12px; font-weight: 700; color: #1a1f3c; }
.recent-status {
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
}
.recent-item-name { font-size: 12px; color: #1a1f3c; line-height: 1.4; }
.recent-meta      { font-size: 11px; color: #8b90a7; }

/* ── Transitions ── */
.fade-enter-active,
.fade-leave-active { transition: opacity .3s ease; }
.fade-enter-from,
.fade-leave-to     { opacity: 0; }

.slide-enter-active,
.slide-leave-active { transition: all .25s ease; }
.slide-enter-from   { opacity: 0; transform: translateX(18px); }
.slide-leave-to     { opacity: 0; transform: translateX(-18px); }
</style>