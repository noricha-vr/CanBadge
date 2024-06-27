<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import "../app.postcss";
  import { onMount } from "svelte";

  let isMenuOpen = false;

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  function closeMenu() {
    isMenuOpen = false;
  }

  onMount(() => {
    if (typeof document !== "undefined") {
      // メニューが開いているときにクリックイベントをリスン
      $: if (isMenuOpen) {
        document.addEventListener("click", handleClickOutside);
      } else {
        document.removeEventListener("click", handleClickOutside);
      }

      function handleClickOutside(event: MouseEvent) {
        const menuButton = document.querySelector(".mobile-menu-button");
        if (menuButton && !menuButton.contains(event.target as Node)) {
          closeMenu();
        }
      }
    }
  });
</script>

<svelte:head>
  <style>
    body {
      @apply flex flex-col min-h-screen;
    }
  </style>
</svelte:head>
<header>
  <nav class="bg-blue-500 text-white">
    <div class="max-w-6xl mx-auto px-4">
      <div class="flex justify-between">
        <div class="flex space-x-4">
          <!-- logo -->
          <div>
            <a href="/" class="flex items-center py-2 px-2 text-white">
              <span class="font-bold text-2xl">CanBadge</span>
            </a>
          </div>
          <!-- primary nav -->
          <div class="hidden md:flex items-center space-x-1">
            <a href="/" class="py-5 px-3 hover:text-blue-200">Home</a>
            <a href="/how-to" class="py-5 px-3 hover:text-blue-200">How to</a>
            <a href="/about" class="py-5 px-3 hover:text-blue-200">About</a>
          </div>
        </div>
        <!-- mobile menu button -->
        <div class="md:hidden flex items-center">
          <button on:click={toggleMenu} class="mobile-menu-button">
            <svg
              class="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
    <!-- mobile menu -->
    <div class="md:hidden" class:hidden={!isMenuOpen}>
      <a href="/" class="block py-2 px-4 text-sm hover:bg-blue-700">Home</a>
      <a href="/how-to" class="block py-2 px-4 text-sm hover:bg-blue-700"
        >How to</a
      >
      <a href="/about" class="block py-2 px-4 text-sm hover:bg-blue-700"
        >About</a
      >
    </div>
  </nav>
</header>

<main class="max-w-6xl mx-auto px-4 py-6 flex-grow">
  <slot />
</main>

<footer class="bg-blue-500 text-white flex-shrink-0">
  <div class="max-w-6xl mx-auto px-4">
    <div class="flex justify-center">
      <div class="flex space-x-4">CanBadge</div>
      <div class="flex space-x-4">
        <span
          >&copy; {new Date().getFullYear()} CanBadge. All rights reserved.</span
        >
      </div>
    </div>
  </div>
</footer>

<style>
  /* You can add any additional styles here if needed */
</style>
