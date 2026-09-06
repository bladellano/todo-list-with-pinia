import { ref } from 'vue'
import { apiFetch } from '../utils/api'

export function useAI() {
  const isImprovingText = ref(false)

  const improveText = async (text) => {
    if (!text.trim() || isImprovingText.value) return null
    
    isImprovingText.value = true
    
    try {
      const response = await apiFetch('/ai/improve-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      
      const result = await response.json()
      
      if (result.success && result.improved) {
        return result.improved
      } else {
        alert(result.message || 'Erro ao melhorar texto')
        return null
      }
    } catch (error) {
      console.error('Erro ao melhorar texto:', error)
      alert('Erro ao conectar com o servidor. Verifique se o backend está rodando.')
      return null
    } finally {
      isImprovingText.value = false
    }
  }

  return {
    isImprovingText,
    improveText
  }
}
