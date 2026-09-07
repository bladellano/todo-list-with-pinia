<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[70] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md"
    >
      Ir para o conteúdo principal
    </a>
    <nav class="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg z-50 transition-colors pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      <div class="container mx-auto px-3 md:px-4">
        <div class="flex justify-between items-center h-14 md:h-16">
          <div class="flex items-center min-w-0">
            <button
              type="button"
              class="md:hidden p-2.5 -ml-1 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 min-h-11 min-w-11 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-blue-500"
              :aria-expanded="menuOpen"
              aria-controls="mobile-nav"
              :aria-label="menuOpen ? 'Fechar menu' : 'Abrir menu'"
              @click="menuOpen = !menuOpen"
            >
              <svg v-if="!menuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div class="hidden md:flex space-x-3 md:space-x-8">
              <router-link
                v-for="item in navItems"
                :key="item.to"
                :to="item.to"
                class="flex items-center px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium transition"
                :class="isActive(item.to) ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'"
              >
                {{ item.label }}
              </router-link>
            </div>
          </div>

          <div class="flex items-center space-x-2 md:space-x-4">
            <button
              @click="themeStore.toggleTheme()"
              class="p-2.5 md:p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-h-11 min-w-11 md:min-h-0 md:min-w-0 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-blue-500"
              :aria-label="themeStore.currentTheme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'"
            >
              <svg v-if="themeStore.currentTheme === 'dark'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
              </svg>
            </button>

            <span class="text-xs md:text-sm text-gray-600 dark:text-gray-300 hidden sm:inline">
              Olá, <span class="font-semibold">{{ authStore.user?.username }}</span>
            </span>
            <button
              @click="handleLogout"
              class="px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-white bg-red-600 dark:bg-red-700 rounded-md hover:bg-red-700 dark:hover:bg-red-800 transition min-h-11 md:min-h-0"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="menuOpen"
        id="mobile-nav"
        class="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
      >
        <div class="px-3 py-2 space-y-1">
          <router-link
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center min-h-11 px-3 py-3 rounded-md text-sm font-medium transition"
            :class="isActive(item.to) ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'"
            @click="menuOpen = false"
          >
            {{ item.label }}
          </router-link>
        </div>
      </div>
    </nav>

    <main id="main-content" class="container mx-auto px-0 md:px-4 py-4 md:py-8 pt-16 md:pt-20">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const menuOpen = ref(false)

const navItems = [
  { to: '/', label: 'Início' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/archived', label: 'Arquivadas' },
  { to: '/tags', label: 'Configuração' }
]

onMounted(() => {
  themeStore.initTheme()
})

watch(() => route.path, () => {
  menuOpen.value = false
})

function isActive(path) {
  return route.path === path
}

async function handleLogout() {
  menuOpen.value = false
  await authStore.logout()
  router.push('/login')
}
</script>
