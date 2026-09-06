<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center p-4">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md transition-colors">
      <h1 class="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-8 text-pretty">Todo List</h1>
      
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Usuário
          </label>
          <input
            id="username"
            v-model="username"
            name="username"
            type="text"
            autocomplete="username"
            spellcheck="false"
            required
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Digite seu usuário…"
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Senha
          </label>
          <input
            id="password"
            v-model="password"
            name="password"
            type="password"
            autocomplete="current-password"
            required
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Digite sua senha…"
          />
        </div>
        
        <div v-if="error" role="alert" aria-live="polite" class="text-red-600 dark:text-red-400 text-sm text-center">
          {{ error }}
        </div>
        
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors disabled:opacity-50"
        >
          {{ loading ? 'Entrando…' : 'Entrar' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  
  const success = await authStore.login(username.value, password.value)
  
  if (success) {
    router.push('/')
  } else {
    error.value = authStore.lastError || 'Usuário ou senha incorretos'
  }
  
  loading.value = false
}
</script>
