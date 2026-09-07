import { ref, computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

marked.use({
  breaks: true,
  gfm: true,
  headerIds: false,
  mangle: false,
  renderer: {
    code({ text, lang, escaped }) {
      const language = lang?.trim().split(/\s+/)[0]
      const safeText = escaped ? text : escapeHtml(text)

      if (language === 'mermaid') {
        return `<pre class="mermaid">${safeText}</pre>\n`
      }

      const langClass = language ? ` class="language-${language}"` : ''
      return `<pre><code${langClass}>${safeText}</code></pre>\n`
    }
  }
})

function sanitizeHtml(html) {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true }
  })
}

export function useMarkdown() {
  const activeTab = ref('preview')

  const renderMarkdown = (text) => {
    if (!text || !text.trim()) {
      return '<p class="text-gray-400 italic">Nenhum conteúdo para visualizar</p>'
    }

    try {
      return sanitizeHtml(marked.parse(text))
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
