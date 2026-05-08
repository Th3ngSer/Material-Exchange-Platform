<template>
  <footer id="listings" class="mt-9 bg-[#23216e] text-[#f3f3fb]">
    <div class="mx-auto grid w-full pb-10 max-w-[1200px] gap-6 px-4 pt-9 max-[640px]:px-2">
      <div class="grid grid-cols-[minmax(280px,0.9fr)_minmax(360px,1.1fr)] items-start gap-7 max-[900px]:grid-cols-1">
        <div class="max-w-[320px]">
          <h3 class="m-0 mb-2 text-[1rem] font-bold text-white">Xchange Material</h3>
          <p class="m-0 max-w-[250px] leading-[1.7] text-white/72">
            Empowering the global construction and manufacturing industries through a secure, transparent, and high-performance exchange platform for material reuse.
          </p>

          <div class="mt-4 inline-flex gap-3" aria-label="Social links">
            <a class="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white no-underline" href="#" aria-label="Instagram"><img src="/src/assets/images/Link.png" alt=""></a>
            <a class="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white no-underline" href="#" aria-label="LinkedIn"><img src="/src/assets/images/Link (1).png" alt=""></a>
            <a class="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white no-underline" href="#" aria-label="Dribbble"><img src="/src/assets/images/Link (2).png" alt=""></a>
          </div>
        </div>

        <div class="flex w-full items-center justify-between gap-5 rounded-[8px] bg-white px-6 py-5 text-[#23216e] max-[900px]:flex-col max-[900px]:items-start">
          <div>
            <p class="m-0 mb-1 text-[24px] font-extrabold uppercase tracking-[0.16em] text-[#23216e]">Join the Luminary Network</p>
            <h4 class="m-0 max-w-[330px] text-[16px] leading-[1.1]">Get weekly updates on material pricing and market trends.</h4>
          </div>

          <form class="flex flex-wrap gap-2.5">
            <label class="sr-only" for="newsletter-email">Email address</label>
            <input id="newsletter-email" type="email" placeholder="Your email address" class="h-11 min-w-[220px] rounded-full border-0 bg-[#f1d8d8] px-4 outline-none max-[900px]:min-w-full" />
            <button type="submit" class="h-11 rounded-full bg-[#ff8f00] px-5 font-bold text-white">Subscribe</button>
          </form>
        </div>
      </div>

      <div class="grid grid-cols-5 gap-4 pt-2.5 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1">
        <div>
          <p class="m-0 mb-3 text-[0.8rem] uppercase tracking-[0.16em] text-white/66">Company</p>
          <a class="mb-2 block no-underline text-white" href="#">About Us</a>
          <a class="mb-2 block no-underline text-white" href="#">Career</a>
          <a class="mb-2 block no-underline text-white" href="#">Press</a>
          <a class="mb-2 block no-underline text-white" href="#">Contact</a>
        </div>

        <div>
          <p class="m-0 mb-3 text-[0.8rem] uppercase tracking-[0.16em] text-white/66">Services</p>
          <a class="mb-2 block no-underline text-white" href="#">Buy</a>
          <a class="mb-2 block no-underline text-white" href="#">Sell</a>
          <a class="mb-2 block no-underline text-white" href="#">Exchange</a>
          <a class="mb-2 block no-underline text-white" href="#">Borrow</a>
        </div>

        <div>
          <p class="m-0 mb-3 text-[0.8rem] uppercase tracking-[0.16em] text-white/66">Support</p>
          <a class="mb-2 block no-underline text-white" href="#">Help center</a>
          <a class="mb-2 block no-underline text-white" href="#">Contact Us</a>
          <a class="mb-2 block no-underline text-white" href="#">FAQ</a>
          <a class="mb-2 block no-underline text-white" href="#">Guides</a>
        </div>

        <div>
          <p class="m-0 mb-3 text-[0.8rem] uppercase tracking-[0.16em] text-white/66">Legal</p>
          <a class="mb-2 block no-underline text-white" href="#">Terms of Service</a>
          <a class="mb-2 block no-underline text-white" href="#">Privacy Policy</a>
          <a class="mb-2 block no-underline text-white" href="#">Cookies</a>
          <a class="mb-2 block no-underline text-white" href="#">Security</a>
        </div>

        <div>
          <p class="m-0 mb-3 text-[0.8rem] uppercase tracking-[0.16em] text-white/66">Global office</p>
          <span class="mb-2 block text-white/82">18.39 Exchange Road</span>
          <span class="mb-2 block text-white/82">Singapore, SG 9810</span>
          <span class="mb-2 block text-white/82">hello@materialxchange.io</span>
        </div>
      </div>
    </div>

    <div class="flex w-full flex-wrap justify-between gap-4 bg-[#d6d7dd] px-4 py-4 text-[#1d215f]">
      <span>2026 material xchange</span>
      <a class="no-underline text-inherit" href="#">Terms</a>
      <a class="no-underline text-inherit" href="#">Privacy</a>
      <a class="no-underline text-inherit" href="#">Contact</a>
      <a class="no-underline text-inherit" href="#">Support &amp; Resource</a>
    </div>
  </footer>
</template>