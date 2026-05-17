<template>
  <footer id="listings" class="mt-9 bg-[#23216e] text-[#f3f3fb]">
    <div class="mx-auto grid w-full pb-10 max-w-[1200px] gap-6 px-4 pt-9 max-[640px]:px-2">
      <div
        class="grid grid-cols-[minmax(280px,0.9fr)_minmax(360px,1.1fr)] items-start gap-7 max-[900px]:grid-cols-1"
      >
        <div class="max-w-[320px]">
          <h3 class="m-0 mb-2 text-[1rem] font-bold text-white"><!-- {{ languageStore.t('xchangeMaterial') }} -->XChange Material</h3>
          <p class="m-0 max-w-[250px] leading-[1.7] text-white/72">
            <!-- {{ languageStore.t('footerDescription') }} -->A secure platform to exchange, buy, sell, and lend materials.
          </p>

          <div class="mt-4 inline-flex gap-3" aria-label="Social links">
            <a
              class="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white no-underline"
              href="#"
              aria-label="Instagram"
              ><img src="/src/assets/images/Link.png" alt=""
            /></a>
            <a
              class="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white no-underline"
              href="#"
              aria-label="LinkedIn"
              ><img src="/src/assets/images/Link (1).png" alt=""
            /></a>
            <a
              class="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white no-underline"
              href="#"
              aria-label="Dribbble"
              ><img src="/src/assets/images/Link (2).png" alt=""
            /></a>
          </div>
        </div>

        <div
          class="flex w-full items-center justify-between gap-5 rounded-[8px] bg-white px-6 py-5 text-[#23216e] max-[900px]:flex-col max-[900px]:items-start"
        >
          <div>
            <p
              class="m-0 mb-1 text-[24px] font-extrabold uppercase tracking-[0.16em] text-[#23216e]"
            >
              <!-- {{ languageStore.t('joinLuminaryNetwork') }} -->Join Our Network
            </p>
            <h4 class="m-0 max-w-[330px] text-[16px] leading-[1.1]">
              <!-- {{ languageStore.t('newsletterDescription') }} -->Get the latest updates delivered to your inbox.
            </h4>
          </div>

          <form class="flex flex-wrap gap-2.5">
            <label class="sr-only" for="newsletter-email">Email address</label>
            <input
              id="newsletter-email"
              type="email"
              placeholder="Email address"
              class="h-11 min-w-[220px] rounded-full border-0 bg-[#f1d8d8] px-4 outline-none max-[900px]:min-w-full"
            />
            <button type="submit" class="h-11 rounded-full bg-[#ff8f00] px-5 font-bold text-white">
              <!-- {{ languageStore.t('subscribe') }} -->Subscribe
            </button>
          </form>
        </div>
      </div>

      <div class="grid grid-cols-5 gap-4 pt-2.5 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1">
        <div>
          <p class="m-0 mb-3 text-[0.8rem] uppercase tracking-[0.16em] text-white/66"><!-- {{ languageStore.t('company') }} -->Company</p>
          <a class="mb-2 block no-underline text-white" href="#"><!-- {{ languageStore.t('aboutUs') }} -->About Us</a>
          <a class="mb-2 block no-underline text-white" href="#"><!-- {{ languageStore.t('career') }} -->Career</a>
          <a class="mb-2 block no-underline text-white" href="#"><!-- {{ languageStore.t('press') }} -->Press</a>
          <a class="mb-2 block no-underline text-white" href="#"><!-- {{ languageStore.t('contact') }} -->Contact</a>
        </div>

        <div>
          <p class="m-0 mb-3 text-[0.8rem] uppercase tracking-[0.16em] text-white/66"><!-- {{ languageStore.t('services') }} -->Services</p>
          <a class="mb-2 block no-underline text-white" href="#"><!-- {{ languageStore.t('buy') }} -->Buy</a>
          <a class="mb-2 block no-underline text-white" href="#"><!-- {{ languageStore.t('sell') }} -->Sell</a>
          <a class="mb-2 block no-underline text-white" href="#"><!-- {{ languageStore.t('exchange') }} -->Exchange</a>
          <a class="mb-2 block no-underline text-white" href="#"><!-- {{ languageStore.t('lend') }} -->Lend</a>
        </div>

        <div>
          <p class="m-0 mb-3 text-[0.8rem] uppercase tracking-[0.16em] text-white/66"><!-- {{ languageStore.t('support') }} -->Support</p>
          <a class="mb-2 block no-underline text-white" href="#"><!-- {{ languageStore.t('helpCenter') }} -->Help Center</a>
          <a class="mb-2 block no-underline text-white" href="#"><!-- {{ languageStore.t('contactUs') }} -->Contact Us</a>
          <a class="mb-2 block no-underline text-white" href="#"><!-- {{ languageStore.t('faq') }} -->FAQ</a>
          <a class="mb-2 block no-underline text-white" href="#"><!-- {{ languageStore.t('guides') }} -->Guides</a>
        </div>

        <div>
          <p class="m-0 mb-3 text-[0.8rem] uppercase tracking-[0.16em] text-white/66"><!-- {{ languageStore.t('legal') }} -->Legal</p>
          <a class="mb-2 block no-underline text-white" href="#"><!-- {{ languageStore.t('termsOfService') }} -->Terms of Service</a>
          <a class="mb-2 block no-underline text-white" href="#"><!-- {{ languageStore.t('privacyPolicy') }} -->Privacy Policy</a>
          <a class="mb-2 block no-underline text-white" href="#"><!-- {{ languageStore.t('cookies') }} -->Cookies</a>
          <a class="mb-2 block no-underline text-white" href="#"><!-- {{ languageStore.t('security') }} -->Security</a>
        </div>

        <div>
          <p class="m-0 mb-3 text-[0.8rem] uppercase tracking-[0.16em] text-white/66">
            <!-- {{ languageStore.t('globalOffice') }} -->Global Office
          </p>
          <span class="mb-2 block text-white/82"><!-- {{ languageStore.t('officeAddress') }} -->123 Exchange Street</span>
          <span class="mb-2 block text-white/82"><!-- {{ languageStore.t('officeCity') }} -->New York, NY 10001</span>
          <span class="mb-2 block text-white/82"><!-- {{ languageStore.t('officeEmail') }} -->contact@xchange.com</span>
        </div>
      </div>
    </div>

    <div class="flex w-full flex-wrap justify-between gap-4 bg-[#d6d7dd] px-4 py-4 text-[#1d215f]">
      <span><!-- {{ languageStore.t('copyright') }} -->&copy; 2024 XChange. All rights reserved.</span>
      <a class="no-underline text-inherit" href="#"><!-- {{ languageStore.t('terms') }} -->Terms</a>
      <a class="no-underline text-inherit" href="#"><!-- {{ languageStore.t('privacy') }} -->Privacy</a>
      <a class="no-underline text-inherit" href="#"><!-- {{ languageStore.t('contact') }} -->Contact</a>
      <a class="no-underline text-inherit" href="#"><!-- {{ languageStore.t('supportResource') }} -->Support</a>
    </div>
  </footer>
</template>

<script setup lang="ts">
// Language store removed - using static English text
</script>
