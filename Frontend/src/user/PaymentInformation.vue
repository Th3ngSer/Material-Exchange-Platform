<template>
  <div class="payment-page">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <div class="content">
      <h2 class="title">Payment Method</h2>

      <div class="payment-options">
        <!-- Bank Transfer -->
        <div class="option">
          <div class="option-row">
            <!-- LEFT: icon + title -->
            <div class="title-with-icon">
              <img class="method-icon" src="/userprofileImage/bank.png" alt="Bank Icon" />
              <h3>Bank Transfer</h3>
            </div>

            <!-- RIGHT: bank logos -->
            <div class="icons">
              <img src="/userprofileImage/aba.png" alt="ABA Bank" />
              <img src="/userprofileImage/acleda.png" alt="ACLEDA Bank" />
              <img src="/userprofileImage/canadia.png" alt="Canadia Bank" />
            </div>
          </div>
        </div>

        <!-- Card Payment -->
        <div class="option">
          <div class="option-row">
            <!-- LEFT: icon + title -->
            <div class="title-with-icon">
              <img class="method-icon" src="/userprofileImage/card.png" alt="Card Icon" />
              <h3>Card Payment</h3>
            </div>

            <!-- RIGHT: visa -->
            <div class="icons">
              <img src="/userprofileImage/visa.png" alt="VISA" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Sidebar from '@/userprofileComponent/Sidebar.vue'
</script>

<style scoped>
.payment-page {
  display: flex;
  min-height: 100vh;
}

.content {
  flex: 1;
  padding: 32px;
  background: #fff;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;
}

/* cards */
.payment-options {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.option {
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 16px;
  background: #fff;
}

.option:hover {
  border-color: #1e1b4b;
  background: #f9f9f9;
}

/* MAIN ROW */
.option-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* LEFT SIDE (ICON + TITLE) */
.title-with-icon {
  display: flex;
  align-items: center;
  gap: 10px;
}

.method-icon {
  width: 22px;
  height: 22px;
}

.option h3 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #1e1b4b;
}

/* RIGHT SIDE ICONS */
.icons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.icons img {
  height: 40px;
  object-fit: contain;
}
</style>
