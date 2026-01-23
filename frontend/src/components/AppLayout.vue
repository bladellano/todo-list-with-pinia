<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-lg">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <div class="flex space-x-8">
            <router-link
              to="/"
              class="flex items-center px-3 py-2 rounded-md text-sm font-medium transition"
              :class="isActive('/') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'"
            >
              Início
            </router-link>
            
            <router-link
              to="/tags"
              class="flex items-center px-3 py-2 rounded-md text-sm font-medium transition"
              :class="isActive('/tags') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'"
            >
              Configuração
            </router-link>
          </div>
          
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">
              Olá, <span class="font-semibold">{{ authStore.user?.username }}</span>
            </span>
            <button
              @click="handleLogout"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
    
    <main class="container mx-auto px-4 py-8">
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
