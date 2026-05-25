<template>
  <footer class="footer">
    <div class="footer-top">
      <!-- Brand -->
      <div class="footer-brand">
        <div class="footer-logo">Do<span>O</span>rii</div>
        <img src="/logo.png" alt="DoOrii" class="logo-img" />
        <p class="footer-tagline">
          Empowering the global construction and manufacturing industries through a secure,
          transparent, and high-performance exchange platform for premium materials.
        </p>
        <div class="footer-socials">
          <a href="#" class="social-btn" aria-label="Website">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
          </a>
          <a href="#" class="social-btn" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
          </a>
          <a href="#" class="social-btn" aria-label="Facebook">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"/></svg>
          </a>
        </div>
      </div>

      <!-- Link columns -->
      <div class="footer-cols">
        <div v-for="col in columns" :key="col.title" class="footer-col">
          <h4>{{ col.title }}</h4>
          <ul>
            <li v-for="link in col.links" :key="link">
              <a href="#">{{ link }}</a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Newsletter -->
      <div class="footer-newsletter">
        <h4>Join the Luminary Network</h4>
        <p>Get weekly updates on material pricing and market trends.</p>
        <form class="newsletter-form" @submit.prevent="subscribe">
          <input v-model="email" type="email" placeholder="Your email address" />
          <button type="submit">Subscribe</button>
        </form>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="footer-bottom">
      <span>© 2026 material xchange</span>
      <div class="footer-bottom-links">
        <a href="#">Terms</a>
        <a href="#">Privacy</a>
      </div>
      <div class="footer-bottom-links">
        <a href="#">Contact</a>
        <a href="#">Support &amp; Resource</a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const email = ref<string>('')

const columns = [
  { title: 'Company',  links: ['About Us', 'Careers', 'Press', 'Contact'] },
  { title: 'Platform', links: ['Browse', 'Sell', 'Exchange', 'Pricing'] },
  { title: 'Support',  links: ['Help Center', 'Contact Us', 'FAQs', 'Guides'] },
  { title: 'Legal',    links: ['Terms of Service', 'Privacy Policy', 'Cookies', 'Security'] },
]

function subscribe(): void {
  if (email.value) {
    alert(`Subscribed with ${email.value}`)
    email.value = ''
  }
}
</script>

<style scoped>
.footer {
  background: #fff;
  border-top: 1.5px solid #e8eaf2;
  font-family: 'DM Sans', sans-serif;
}

.footer-top {
  display: flex;
  gap: 48px;
  padding: 40px 60px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Brand */
.footer-brand { max-width: 240px; flex-shrink: 0; }

.footer-logo {
  font-family: 'Sora', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #1a1f3c;
  margin-bottom: 10px;
}
.footer-logo span { color: #f97316; }

.footer-tagline {
  font-size: 12.5px;
  color: #8b90a7;
  line-height: 1.65;
  margin-bottom: 16px;
}

.footer-socials { display: flex; gap: 8px; }

.social-btn {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  background: #f4f5fb;
  border: 1.5px solid #e8eaf2;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #1a1f3c;
  text-decoration: none;
  transition: background .13s;
}
.social-btn svg { width: 16px; height: 16px; }
.social-btn:hover { background: #fff3e8; }

/* Columns */
.footer-cols {
  display: flex;
  gap: 40px;
  flex: 1;
}

.footer-col h4 {
  font-family: 'Sora', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #1a1f3c;
  margin-bottom: 14px;
}

.footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 9px; }

.footer-col ul a {
  font-size: 12.5px;
  color: #8b90a7;
  text-decoration: none;
  transition: color .13s;
}
.footer-col ul a:hover { color: #1a1f3c; }

/* Newsletter */
.footer-newsletter {
  background: #1a1f3c;
  border-radius: 12px;
  padding: 22px 24px;
  width: 240px;
  flex-shrink: 0;
  align-self: flex-start;
}

.footer-newsletter h4 {
  font-family: 'Sora', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 6px;
}

.footer-newsletter p {
  font-size: 11.5px;
  color: rgba(255,255,255,.5);
  line-height: 1.55;
  margin-bottom: 14px;
}

.newsletter-form { display: flex; gap: 6px; }

.newsletter-form input {
  flex: 1;
  background: rgba(255,255,255,.1);
  border: 1.5px solid rgba(255,255,255,.15);
  border-radius: 7px;
  padding: 7px 10px;
  font-size: 12px;
  color: #fff;
  font-family: 'DM Sans', sans-serif;
  outline: none;
  min-width: 0;
}
.newsletter-form input::placeholder { color: rgba(255,255,255,.35); }

.newsletter-form button {
  background: #f97316;
  color: #fff;
  border: none;
  border-radius: 7px;
  padding: 7px 14px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity .13s;
}
.newsletter-form button:hover { opacity: .85; }

/* Bottom bar */
.footer-bottom {
  border-top: 1.5px solid #e8eaf2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 60px;
  font-size: 12.5px;
  color: #8b90a7;
  max-width: 1200px;
  margin: 0 auto;
}

.footer-bottom-links { display: flex; gap: 24px; }

.footer-bottom-links a {
  color: #8b90a7;
  text-decoration: none;
  transition: color .13s;
}
.footer-bottom-links a:hover { color: #1a1f3c; }

.logo-img {
  height: 24px;
  width: auto;
}
</style>