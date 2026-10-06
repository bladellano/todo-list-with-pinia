import { ref } from 'vue'
import { apiFetch } from '../utils/api'

export function useAI() {
  const isImprovingTitle = ref(false)
  const isImprovingDescription = ref(false)

  const improveText = async (text, { busyRef = isImprovingTitle } = {}) => {
    if (!text.trim() || busyRef.value) return null

    busyRef.value = true

    try {
      const response = await apiFetch('/ai/improve-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })

      const result = await response.json()

      if (result.success && result.improved) {
        return result.improved
      }

      alert(result.message || 'Erro ao melhorar texto')
      return null
    } catch (error) {
      console.error('Erro ao melhorar texto:', error)
      alert('Erro ao conectar com o servidor. Verifique se o backend está rodando.')
      return null
    } finally {
      busyRef.value = false
    }
  }

  return {
    isImprovingTitle,
    isImprovingDescription,
    /** @deprecated use isImprovingTitle */
    isImprovingText: isImprovingTitle,
    improveText
  }
}
