<template>
  <BaseModal
    labelled-by="edit-todo-title"
    max-width-class="sm:max-w-3xl"
    @close="$emit('cancel')"
  >
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <h2 id="edit-todo-title" class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 min-w-0 text-pretty">
          Editar Tarefa
        </h2>
        <button
          type="button"
          @click="handleClone"
          aria-label="Criar uma cópia desta tarefa"
          class="p-2.5 sm:p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-1.5 shrink-0 min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 justify-center focus-visible:ring-2 focus-visible:ring-purple-400"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
          <span class="text-sm hidden sm:inline">Clonar</span>
        </button>
      </div>
    </template>

    <form id="edit-todo-form" @submit.prevent="handleSave" class="space-y-4">
      <div>
        <label for="edit-todo-title-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Título
        </label>
        <div class="flex items-center gap-2">
          <input
            id="edit-todo-title-input"
            v-model="editForm.title"
            name="title"
            type="text"
            autocomplete="off"
            required
            class="flex-1 min-w-0 px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <button
            type="button"
            @click="improveText"
            :disabled="!editForm.title.trim() || isImprovingText"
            aria-label="Melhorar texto com IA"
            class="p-2.5 sm:p-2 rounded-lg transition-colors flex items-center justify-center shrink-0 min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 focus-visible:ring-2 focus-visible:ring-yellow-400"
            :class="!editForm.title.trim() || isImprovingText
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-yellow-500 text-white hover:bg-yellow-600'"
          >
            <svg v-if="!isImprovingText" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"/>
            </svg>
            <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </button>
        </div>
      </div>

      <div>
        <label for="edit-todo-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Descrição
        </label>

        <div class="flex border-b border-gray-200 dark:border-gray-600 mb-2">
          <button
            type="button"
            @click="activeTab = 'preview'"
            class="px-4 py-2.5 text-sm font-medium transition-colors border-b-2"
            :class="activeTab === 'preview'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-500 border-transparent hover:text-gray-700'"
          >
            Preview
          </button>
          <button
            type="button"
            @click="activeTab = 'edit'"
            class="px-4 py-2.5 text-sm font-medium transition-colors border-b-2"
            :class="activeTab === 'edit'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-500 border-transparent hover:text-gray-700'"
          >
            Editar
          </button>
        </div>

        <div class="flex items-start gap-2">
          <textarea
            id="edit-todo-description"
            v-show="activeTab === 'edit'"
            v-model="editForm.description"
            placeholder="Descrição em Markdown (opcional)…"
            rows="4"
            class="flex-1 min-w-0 px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-y min-h-[6rem] max-h-[40vh] overflow-y-auto"
          />

          <button
            v-show="activeTab === 'edit'"
            type="button"
            @click="improveDescription"
            :disabled="!editForm.description.trim() || isImprovingDescription"
            aria-label="Melhorar descrição com IA"
            class="p-2.5 sm:p-2 rounded-lg transition-colors flex items-center justify-center shrink-0 min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 focus-visible:ring-2 focus-visible:ring-yellow-400"
            :class="!editForm.description.trim() || isImprovingDescription
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-yellow-500 text-white hover:bg-yellow-600'"
            title="Melhorar descrição com IA"
          >
            <svg v-if="!isImprovingDescription" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"/>
            </svg>
            <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </button>
        </div>

        <div
          v-show="activeTab === 'preview'"
          class="w-full min-h-[6rem] max-h-[40vh] overflow-y-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 prose prose-sm dark:prose-invert max-w-none"
          v-html="renderMarkdown(editForm.description)"
        />
      </div>

      <div>
        <span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tags
        </span>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tag in allTags"
            :key="tag.id"
            type="button"
            @click="toggleTag(tag.id)"
            class="px-3 py-2 rounded-md text-sm transition border-2 min-h-11 sm:min-h-0 sm:py-1"
            :class="editForm.tagIds.includes(tag.id)
              ? [getTagColor(tag.name).bg, getTagColor(tag.name).text, getTagColor(tag.name).border, 'font-medium']
              : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'"
          >
            {{ tag.name }}
          </button>
        </div>
      </div>

      <div class="flex items-center space-x-2">
        <input
          v-model="editForm.done"
          type="checkbox"
          id="done-checkbox"
          class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
        />
        <label for="done-checkbox" class="text-sm font-medium text-gray-700 dark:text-gray-300">
          Tarefa concluída
        </label>
      </div>

      <div class="flex items-center space-x-2">
        <input
          v-model="editForm.notificable"
          type="checkbox"
          id="notificable-checkbox"
          class="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
        />
        <label for="notificable-checkbox" class="text-sm font-medium text-gray-700 dark:text-gray-300">
          Habilitar notificações (n8n)
        </label>
      </div>

      <div class="border-t border-gray-200 dark:border-gray-600 pt-4 space-y-4">
        <div class="flex items-center space-x-2">
          <input
            v-model="editForm.sendByEmail"
            type="checkbox"
            id="send-email-checkbox"
            class="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
          />
          <label for="send-email-checkbox" class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Enviar por e-mail (via n8n)
          </label>
        </div>

        <div v-if="editForm.sendByEmail" class="space-y-4 sm:pl-7">
          <EmailInput
            v-model="editForm.emails"
            label="Destinatários"
            placeholder="Digite um e-mail e pressione Enter"
            hint="Separe múltiplos e-mails com ; ou pressione Enter/Tab"
          />
        </div>
      </div>
    </form>

    <template #footer>
      <div class="flex space-x-3">
        <button
          type="submit"
          form="edit-todo-form"
          class="flex-1 min-h-11 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
        >
          Salvar
        </button>
        <button
          type="button"
          @click="$emit('cancel')"
          class="flex-1 min-h-11 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
        >
          Cancelar
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref } from 'vue'
import { getTagColor } from '../utils/colors'
import { apiFetch } from '../utils/api'
import { useMarkdown } from '../composables/useMarkdown'
import EmailInput from './EmailInput.vue'
import BaseModal from './BaseModal.vue'

const props = defineProps({
  todo: {
    type: Object,
    required: true
  },
  allTags: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['save', 'cancel', 'clone'])

const { renderMarkdown } = useMarkdown()

const activeTab = ref('preview')

const editForm = ref({
  id: props.todo.id,
  title: props.todo.title,
  description: props.todo.description || '',
  tagIds: props.todo.tagIds || [],
  done: props.todo.done || false,
  notificable: props.todo.notificable || false,
  sendByEmail: props.todo.sendByEmail || false,
  emails: props.todo.emails || [],
  sendFrequency: props.todo.sendFrequency || 'daily',
  sendTime: props.todo.sendTime || '09:00'
})

const isImprovingText = ref(false)
const isImprovingDescription = ref(false)

async function improveText() {
  if (!editForm.value.title.trim() || isImprovingText.value) return

  isImprovingText.value = true

  try {
    const response = await apiFetch('/ai/improve-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: editForm.value.title })
    })

    const result = await response.json()

    if (result.success && result.improved) {
      editForm.value.title = result.improved
    } else {
      alert(result.message || 'Erro ao melhorar texto')
    }
  } catch (error) {
    console.error('Erro ao melhorar texto:', error)
    alert('Erro ao conectar com o servidor. Verifique se o backend está rodando.')
  } finally {
    isImprovingText.value = false
  }
}

async function improveDescription() {
  if (!editForm.value.description.trim() || isImprovingDescription.value) return

  isImprovingDescription.value = true

  try {
    const response = await apiFetch('/ai/improve-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: editForm.value.description })
    })

    const result = await response.json()

    if (result.success && result.improved) {
      editForm.value.description = result.improved
    } else {
      alert(result.message || 'Erro ao melhorar descrição')
    }
  } catch (error) {
    console.error('Erro ao melhorar descrição:', error)
    alert('Erro ao conectar com o servidor. Verifique se o backend está rodando.')
  } finally {
    isImprovingDescription.value = false
  }
}

function toggleTag(tagId) {
  const index = editForm.value.tagIds.indexOf(tagId)
  if (index > -1) {
    editForm.value.tagIds.splice(index, 1)
  } else {
    editForm.value.tagIds.push(tagId)
  }
}

function handleSave() {
  emit('save', editForm.value)
}

function handleClone() {
  emit('clone', props.todo)
}
</script>
