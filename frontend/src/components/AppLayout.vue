<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
    <!-- Navbar fixo no topo -->
    <nav class="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg z-50 transition-colors">
      <div class="container mx-auto px-3 md:px-4">
        <div class="flex justify-between items-center h-14 md:h-16">
          <div class="flex space-x-3 md:space-x-8">
            <router-link
              to="/"
              class="flex items-center px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium transition"
              :class="isActive('/') ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'"
            >
              Início
            </router-link>
            
            <router-link
              to="/dashboard"
              class="flex items-center px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium transition"
              :class="isActive('/dashboard') ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'"
            >
              Dashboard
            </router-link>
            
            <router-link
              to="/archived"
              class="flex items-center px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium transition"
              :class="isActive('/archived') ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'"
            >
              Arquivadas
            </router-link>
            
            <router-link
              to="/tags"
              class="flex items-center px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium transition"
              :class="isActive('/tags') ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'"
            >
              Configuração
            </router-link>
          </div>
          
          <div class="flex items-center space-x-2 md:space-x-4">
            <!-- Botão de toggle de tema -->
            <button
              @click="themeStore.toggleTheme()"
              class="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              :title="themeStore.currentTheme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'"
            >
              <!-- Ícone Sol (Light mode) -->
              <svg v-if="themeStore.currentTheme === 'dark'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
              <!-- Ícone Lua (Dark mode) -->
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
              </svg>
            </button>
            
            <span class="text-xs md:text-sm text-gray-600 dark:text-gray-300 hidden sm:inline">
              Olá, <span class="font-semibold">{{ authStore.user?.username }}</span>
            </span>
            <button
              @click="handleLogout"
              class="px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-white bg-red-600 dark:bg-red-700 rounded-md hover:bg-red-700 dark:hover:bg-red-800 transition"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
    
    <!-- Padding-top para compensar o navbar fixo -->
    <main class="container mx-auto px-0 md:px-4 py-4 md:py-8 pt-16 md:pt-20">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const themeStore = useThemeStore()

// Inicializar tema ao montar o componente
onMounted(() => {
  themeStore.initTheme()
})

function isActive(path) {
  return route.path === path
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>
