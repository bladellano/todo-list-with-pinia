<template>
  <div
    class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 md:p-4 hover:shadow-md transition-all"
    :class="{ 
      'opacity-60': todo.done,
      'ring-2 ring-blue-500 dark:ring-blue-400': selected,
      'border-yellow-400 dark:border-yellow-500 border-2': todo.pinned
    }"
  >
    <div class="flex items-start space-x-2 md:space-x-3">
      <!-- Drag handle -->
      <div class="drag-handle cursor-move pt-1 flex-shrink-0 hidden md:block">
        <svg class="w-5 h-5 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
        </svg>
      </div>
      
      <!-- Checkbox de seleção -->
      <div class="pt-1 flex-shrink-0">
        <input
          type="checkbox"
          :checked="selected"
          @change.stop="$emit('toggle-select', todo.id)"
          class="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          title="Selecionar para exportar"
        />
      </div>
      
      <!-- Conteúdo -->
      <div class="flex-1 min-w-0">
        <!-- Botões de ação no topo -->
        <div class="flex items-center justify-end space-x-0.5 md:space-x-1 mb-2">
          <!-- Botão Done/Undone -->
          <button
            @click="$emit('toggle-done', todo)"
            class="p-1 md:p-1.5 rounded transition"
            :class="todo.done 
              ? 'text-green-600 hover:bg-green-50' 
              : 'text-gray-400 hover:bg-gray-50'"
            :title="todo.done ? 'Marcar como pendente' : 'Marcar como concluída'"
          >
            <svg v-if="todo.done" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </button>
          
          <button
            @click="$emit('toggle-pin', todo.id)"
            class="p-1 md:p-1.5 rounded transition"
            :class="todo.pinned 
              ? 'text-yellow-600 hover:bg-yellow-50' 
              : 'text-gray-400 hover:bg-gray-50'"
            :title="todo.pinned ? 'Desafixar' : 'Fixar no topo'"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c-.25.78.409 1.565 1.225 1.466L8 14l.823 3.288c.27.936 1.567 1.036 2.022.251l.802-1.365 1.61-.968-3.126-3.126a1 1 0 01-.294-.707V8.274a1.99 1.99 0 00-1.003-.18 1.99 1.99 0 00-1.003.18z"></path>
            </svg>
          </button>
          
          <!-- Botão Arquivar/Desarquivar -->
          <button
            @click="$emit('toggle-archive', todo.id)"
            class="p-1 md:p-1.5 rounded transition"
            :class="isArchived 
              ? 'text-blue-600 hover:bg-blue-50' 
              : 'text-gray-400 hover:bg-gray-50'"
            :title="isArchived ? 'Desarquivar' : 'Arquivar'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
            </svg>
          </button>
          
          <button
            @click="$emit('edit', todo)"
            class="p-1 md:p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
            title="Editar"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </button>
          
          <button
            @click="$emit('delete', todo.id)"
            class="p-1 md:p-1.5 text-red-600 hover:bg-red-50 rounded transition"
            title="Excluir"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
        
        <!-- Título e ícone de notificação -->
        <div class="flex items-start space-x-2">
          <div class="flex-1 min-w-0">
            <h3
              v-if="!isEditingTitle"
              @dblclick="startEditingTitle"
              class="font-semibold text-gray-800 dark:text-gray-100 text-sm md:text-base break-words cursor-text"
              :class="{ 'line-through': todo.done }"
              title="Clique duas vezes para editar"
            >
              {{ todo.title }}
            </h3>
            
            <input
              v-else
              v-model="editedTitle"
              @blur="saveTitle"
              @keyup.enter="saveTitle"
              @keyup.esc="cancelEdit"
              class="w-full px-2 py-1 text-sm md:text-base font-semibold border-2 border-blue-500 dark:border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              autofocus
            />
          </div>
          
          <!-- Ícone de notificação -->
          <div 
            v-if="todo.notificable" 
            class="flex-shrink-0 pt-0.5"
            title="Notificações habilitadas"
          >
            <svg class="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
            </svg>
          </div>
        </div>
        
        <p
          v-if="todo.description"
          class="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1 break-words"
          :class="{ 'line-through': todo.done }"
        >
          {{ todo.description }}
        </p>
        
        <div v-if="tags.length > 0" class="flex flex-wrap gap-1 mt-2">
          <span
            v-for="tag in tags"
            :key="tag.id"
            class="px-2 py-0.5 md:py-1 text-xs rounded-full"
            :class="[getTagColor(tag.name).bg, getTagColor(tag.name).text]"
          >
            {{ tag.name }}
          </span>
        </div>
        
        <div class="text-[10px] md:text-xs text-gray-400 mt-2 space-y-0.5">
          <div class="hidden md:block">Criada: {{ formatDate(todo.createdAt) }}</div>
          <div v-if="todo.done && todo.completedAt" class="text-green-600 font-medium">
            ✓ Concluída: {{ formatDate(todo.completedAt) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getTagColor } from '../utils/colors'

const props = defineProps({
  todo: {
    type: Object,
    required: true
  },
  tags: {
    type: Array,
    default: () => []
  },
  selected: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['edit', 'delete', 'toggle-done', 'toggle-select', 'toggle-pin', 'toggle-archive', 'update-title'])

const isEditingTitle = ref(false)
const editedTitle = ref('')

function startEditingTitle() {
  isEditingTitle.value = true
  editedTitle.value = props.todo.title
}

function saveTitle() {
  if (editedTitle.value.trim() && editedTitle.value !== props.todo.title) {
    emit('update-title', props.todo.id, editedTitle.value.trim())
  }
  isEditingTitle.value = false
}

function cancelEdit() {
  isEditingTitle.value = false
  editedTitle.value = ''
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
