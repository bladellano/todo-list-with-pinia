import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const lastError = ref('')
  const isAuthenticated = computed(() => !!user.value)

  async function login(username, password) {
    lastError.value = ''
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      let data
      try {
        data = await response.json()
      } catch {
        lastError.value = 'Servidor indisponível. Verifique se o backend está online.'
        return false
      }

      if (data.success) {
        user.value = data.user
        localStorage.setItem('user', JSON.stringify(data.user))
        return true
      }

      lastError.value = data.message || 'Usuário ou senha incorretos'
      return false
    } catch (error) {
      console.error('Erro no login:', error)
      lastError.value = 'Não foi possível conectar ao servidor. Verifique se o backend está online.'
      return false
    }
  }

  function logout() {
    user.value = null
    localStorage.removeItem('user')
  }

  function loadUser() {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      user.value = JSON.parse(savedUser)
    }
  }

  return {
    user,
    lastError,
    isAuthenticated,
    login,
    logout,
    loadUser
  }
})
