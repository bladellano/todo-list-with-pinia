import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
  // Estado: 'light' ou 'dark'
  const currentTheme = ref('light')

  // Inicializar tema do localStorage ou preferência do sistema
  function initTheme() {
    const savedTheme = localStorage.getItem('theme')
    
    if (savedTheme) {
      currentTheme.value = savedTheme
    } else {
      // Detectar preferência do sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      currentTheme.value = prefersDark ? 'dark' : 'light'
    }
    
    applyTheme()
  }

  // Aplicar tema ao documento
  function applyTheme() {
    if (currentTheme.value === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Alternar tema
  function toggleTheme() {
    currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
    applyTheme()
  }

  // Definir tema específico
  function setTheme(theme) {
    if (theme === 'light' || theme === 'dark') {
      currentTheme.value = theme
      applyTheme()
    }
  }

  // Observar mudanças e salvar no localStorage
  watch(currentTheme, (newTheme) => {
    localStorage.setItem('theme', newTheme)
  })

  return {
    currentTheme,
    initTheme,
    toggleTheme,
    setTheme
  }
})
