<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Navbar fixo no topo -->
    <nav class="fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
      <div class="container mx-auto px-3 md:px-4">
        <div class="flex justify-between items-center h-14 md:h-16">
          <div class="flex space-x-3 md:space-x-8">
            <router-link
              to="/"
              class="flex items-center px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium transition"
              :class="isActive('/') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'"
            >
              Início
            </router-link>
            
            <router-link
              to="/archived"
              class="flex items-center px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium transition"
              :class="isActive('/archived') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'"
            >
              Arquivadas
            </router-link>
            
            <router-link
              to="/tags"
              class="flex items-center px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium transition"
              :class="isActive('/tags') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'"
            >
              Configuração
            </router-link>
          </div>
          
          <div class="flex items-center space-x-2 md:space-x-4">
            <span class="text-xs md:text-sm text-gray-600 hidden sm:inline">
              Olá, <span class="font-semibold">{{ authStore.user?.username }}</span>
            </span>
            <button
              @click="handleLogout"
              class="px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition"
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
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

function isActive(path) {
  return route.path === path
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>
