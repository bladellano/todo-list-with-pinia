import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { clearAuthSession, getToken } from '../utils/api'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const lastError = ref('')
  const isAuthenticated = computed(() => !!user.value && !!getToken())

  async function login(username, password) {
    lastError.value = ''

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

      if (data.success && data.token) {
        user.value = data.user
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('token', data.token)
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

  async function logout() {
    const token = getToken()
    if (token) {
      try {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        })
      } catch (error) {
        console.error('Erro ao encerrar sessão:', error)
      }
    }

    user.value = null
    clearAuthSession()
  }

  function loadUser() {
    const savedUser = localStorage.getItem('user')
    const token = getToken()
    if (savedUser && token) {
      user.value = JSON.parse(savedUser)
    } else {
      clearAuthSession()
      user.value = null
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
