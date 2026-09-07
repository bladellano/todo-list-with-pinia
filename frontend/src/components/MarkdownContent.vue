<template>
  <div
    ref="containerRef"
    :key="renderKey"
    class="markdown-content"
    :class="contentClass"
    v-html="html"
  />
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMarkdown } from '../composables/useMarkdown'
import { renderMermaidDiagrams } from '../utils/mermaid'
import { useThemeStore } from '../stores/theme'

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  contentClass: {
    type: String,
    default: 'prose prose-sm dark:prose-invert max-w-none'
  }
})

const { renderMarkdown } = useMarkdown()
const themeStore = useThemeStore()
const { currentTheme } = storeToRefs(themeStore)
const containerRef = ref(null)

const html = computed(() => renderMarkdown(props.content))
const renderKey = computed(() => `${currentTheme.value}:${props.content}`)

async function renderDiagrams() {
  await nextTick()
  if (containerRef.value) {
    await renderMermaidDiagrams(containerRef.value, currentTheme.value)
  }
}

watch(renderKey, renderDiagrams, { flush: 'post' })
onMounted(renderDiagrams)
</script>

<style scoped>
.markdown-content :deep(pre.mermaid) {
  @apply my-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-3;
  white-space: pre-wrap;
  word-break: break-word;
}

.markdown-content :deep(.mermaid svg) {
  max-width: 100%;
  height: auto;
}
</style>
