<template>
  <BaseModal
    labelled-by="view-todo-title"
    max-width-class="sm:max-w-2xl"
    @close="$emit('close')"
  >
    <template #header>
      <div class="flex items-start justify-between gap-3">
        <h2 id="view-todo-title" class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2 min-w-0 break-words text-pretty">
          <span v-if="todo.pinned" aria-label="Fixado">📌</span>
          {{ todo.title }}
        </h2>
        <button
          type="button"
          @click="$emit('close')"
          aria-label="Fechar"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 rounded shrink-0 min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 flex items-center justify-center"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </template>

    <div class="flex items-center gap-3 mb-4 flex-wrap">
      <span
        class="px-3 py-1 rounded-full text-sm font-medium"
        :class="todo.done
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'"
      >
        {{ todo.done ? '✓ Concluída' : '⏳ Pendente' }}
      </span>

      <span
        v-if="todo.notificable"
        class="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      >
        🔔 Notificável
      </span>

      <span
        v-if="todo.archived"
        class="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
      >
        📦 Arquivada
      </span>
    </div>

    <div v-if="todo.description" class="mb-6">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Descrição</h3>
      <div
        class="text-gray-600 dark:text-gray-400 prose prose-sm dark:prose-invert max-w-none"
        v-html="renderMarkdown(todo.description)"
      />
    </div>

    <div v-if="tags && tags.length > 0" class="mb-6">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tags</h3>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="tag in tags"
          :key="tag.id"
          class="px-3 py-1 rounded-md text-sm font-medium border-2"
          :class="[getTagColor(tag.name).bg, getTagColor(tag.name).text, getTagColor(tag.name).border]"
        >
          {{ tag.name }}
        </span>
      </div>
    </div>

    <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
      <div v-if="todo.createdAt" class="flex items-center gap-2">
        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>Criada em: {{ formatDate(todo.createdAt) }}</span>
      </div>

      <div v-if="todo.done && todo.completedAt" class="flex items-center gap-2 text-green-600 dark:text-green-400">
        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>Concluída em: {{ formatDate(todo.completedAt) }}</span>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-3">
        <button
          type="button"
          @click="$emit('edit', todo)"
          class="flex-1 min-h-11 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
          Editar
        </button>
        <button
          type="button"
          @click="$emit('close')"
          class="flex-1 min-h-11 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors focus-visible:ring-2 focus-visible:ring-gray-400"
        >
          Fechar
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { getTagColor } from '../utils/colors'
import { useMarkdown } from '../composables/useMarkdown'
import BaseModal from './BaseModal.vue'

const { renderMarkdown } = useMarkdown()

defineProps({
  todo: {
    type: Object,
    required: true
  },
  tags: {
    type: Array,
    default: () => []
  }
})

defineEmits(['close', 'edit'])

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
