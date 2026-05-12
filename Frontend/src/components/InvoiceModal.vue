<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  isOpen: boolean
  transactionId?: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'download'): void
}>()

// Mock invoice data
const invoiceData = ref({
  invoiceNumber: 'INV-2025-001',
  date: '01/05/2025',
  dueDate: '01/06/2025',
  seller: {
    name: 'Alex Rivet',
    email: 'alex.rivet@email.com',
    phone: '+1 (555) 123-4567',
  },
  buyer: {
    name: 'You',
    email: 'your.email@email.com',
    phone: '+1 (555) 987-6543',
  },
  items: [
    {
      id: 1,
      name: 'Polished Aluminum Sheets',
      quantity: 50,
      unit: 'sheets',
      unitPrice: 12.5,
    },
  ],
  subtotal: 625.0,
  tax: 50.0,
  total: 675.0,
  status: 'Completed',
  notes: 'Thank you for your business! Pickup completed on 01/05/2025.',
})

const downloadInvoice = () => {
  emit('download')
  console.log('Invoice downloaded')
}

const closeModal = () => {
  emit('close')
}
</script>

<template>
  <transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header">
          <h2 class="modal-title">Invoice</h2>
          <button class="close-btn" @click="closeModal" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <!-- Invoice Content -->
        <div class="invoice-container">
          <!-- Header Section -->
          <div class="invoice-header">
            <div class="company-info">
              <h1 class="company-name">Material Exchange Platform</h1>
              <p class="invoice-label">INVOICE</p>
            </div>
            <div class="invoice-meta">
              <div class="meta-item">
                <span class="label">Invoice #:</span>
                <span class="value">{{ invoiceData.invoiceNumber }}</span>
              </div>
              <div class="meta-item">
                <span class="label">Invoice Date:</span>
                <span class="value">{{ invoiceData.date }}</span>
              </div>
              <div class="meta-item">
                <span class="label">Due Date:</span>
                <span class="value">{{ invoiceData.dueDate }}</span>
              </div>
              <div class="meta-item">
                <span class="label">Status:</span>
                <span class="value status" :class="invoiceData.status.toLowerCase()">
                  {{ invoiceData.status }}
                </span>
              </div>
            </div>
          </div>

          <!-- Parties Section -->
          <div class="parties-section">
            <div class="party-info">
              <h3 class="party-title">From</h3>
              <p class="party-name">{{ invoiceData.seller.name }}</p>
              <p class="party-detail">{{ invoiceData.seller.email }}</p>
              <p class="party-detail">{{ invoiceData.seller.phone }}</p>
            </div>
            <div class="party-info">
              <h3 class="party-title">Bill To</h3>
              <p class="party-name">{{ invoiceData.buyer.name }}</p>
              <p class="party-detail">{{ invoiceData.buyer.email }}</p>
              <p class="party-detail">{{ invoiceData.buyer.phone }}</p>
            </div>
          </div>

          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th class="col-item">Item Description</th>
                <th class="col-qty">Qty</th>
                <th class="col-price">Unit Price</th>
                <th class="col-total">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in invoiceData.items" :key="item.id">
                <td class="col-item">{{ item.name }}</td>
                <td class="col-qty">{{ item.quantity }} {{ item.unit }}</td>
                <td class="col-price">${{ item.unitPrice.toFixed(2) }}</td>
                <td class="col-total">${{ (item.quantity * item.unitPrice).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>

          <!-- Totals Section -->
          <div class="totals-section">
            <div class="totals-row">
              <span class="totals-label">Subtotal</span>
              <span class="totals-value">${{ invoiceData.subtotal.toFixed(2) }}</span>
            </div>
            <div class="totals-row">
              <span class="totals-label">Tax (8%)</span>
              <span class="totals-value">${{ invoiceData.tax.toFixed(2) }}</span>
            </div>
            <div class="totals-row total">
              <span class="totals-label">Total</span>
              <span class="totals-value">${{ invoiceData.total.toFixed(2) }}</span>
            </div>
          </div>

          <!-- Notes Section -->
          <div v-if="invoiceData.notes" class="notes-section">
            <h4 class="notes-title">Notes</h4>
            <p class="notes-content">{{ invoiceData.notes }}</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button class="btn-close" @click="closeModal">Close</button>
          <button class="btn-download" @click="downloadInvoice">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Download PDF
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 700px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1f3c;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #8b90a7;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f4f5fb;
  color: #1a1f3c;
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.invoice-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #fcfcfc;
}

/* Invoice Header */
.invoice-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #ff6b35;
}

.company-info {
  flex: 1;
}

.company-name {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1a1f3c;
}

.invoice-label {
  margin: 4px 0 0 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #8b90a7;
  text-transform: uppercase;
}

.invoice-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: right;
}

.meta-item {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  font-size: 13px;
}

.label {
  font-weight: 600;
  color: #1a1f3c;
}

.value {
  color: #8b90a7;
}

.status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.status.completed {
  background: #d4edda;
  color: #155724;
}

.status.pending {
  background: #fff3cd;
  color: #856404;
}

/* Parties Section */
.parties-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 30px;
}

.party-info {
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #eee;
}

.party-title {
  margin: 0 0 12px 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #8b90a7;
  text-transform: uppercase;
}

.party-name {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1a1f3c;
}

.party-detail {
  margin: 2px 0;
  font-size: 13px;
  color: #8b90a7;
}

/* Items Table */
.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 24px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #eee;
}

.items-table thead {
  background: #f9f9fb;
  border-bottom: 2px solid #eee;
}

.items-table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  font-size: 12px;
  color: #8b90a7;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.items-table td {
  padding: 14px 12px;
  border-top: 1px solid #eee;
  font-size: 13px;
  color: #1a1f3c;
}

.col-item {
  width: 50%;
}

.col-qty {
  width: 20%;
}

.col-price {
  width: 15%;
  text-align: right;
}

.col-total {
  width: 15%;
  text-align: right;
  font-weight: 600;
}

/* Totals Section */
.totals-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #eee;
}

.totals-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.totals-row.total {
  padding-top: 12px;
  border-top: 2px solid #ff6b35;
  font-size: 15px;
  font-weight: 700;
  color: #1a1f3c;
}

.totals-label {
  color: #8b90a7;
}

.totals-value {
  font-weight: 600;
  color: #1a1f3c;
}

/* Notes Section */
.notes-section {
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #eee;
}

.notes-title {
  margin: 0 0 8px 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #8b90a7;
  text-transform: uppercase;
}

.notes-content {
  margin: 0;
  font-size: 13px;
  color: #1a1f3c;
  line-height: 1.5;
}

/* Footer */
.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #eee;
  background: #f9f9fb;
}

.btn-close,
.btn-download {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-close {
  background: #f4f5fb;
  color: #1a1f3c;
}

.btn-close:hover {
  background: #e8eaf0;
}

.btn-download {
  background: #ff6b35;
  color: white;
}

.btn-download:hover {
  background: #ff5722;
  transform: translateY(-2px);
}

.btn-download svg {
  width: 18px;
  height: 18px;
}

/* Modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: translateY(20px);
}
</style>
