import { ref, computed } from 'vue'
import { marked } from 'marked'

// Configurar marked para ser mais seguro
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  mangle: false
})

export function useMarkdown() {
  const activeTab = ref('preview')

  const renderMarkdown = (text) => {
    if (!text || !text.trim()) {
      return '<p class="text-gray-400 italic">Nenhum conteúdo para visualizar</p>'
    }
    
    try {
      return marked(text)
    } catch (error) {
      console.error('Erro ao renderizar markdown:', error)
      return '<p class="text-red-500">Erro ao renderizar markdown</p>'
    }
  }

  const setTab = (tab) => {
    activeTab.value = tab
  }

  const isEditTab = computed(() => activeTab.value === 'edit')
  const isPreviewTab = computed(() => activeTab.value === 'preview')

  return {
    activeTab,
    isEditTab,
    isPreviewTab,
    setTab,
    renderMarkdown
  }
}
