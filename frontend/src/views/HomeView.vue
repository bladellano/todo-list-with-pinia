<template>
  <AppLayout>
    <div class="max-w-4xl mx-auto px-4 md:px-0">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 mb-4 md:mb-6 transition-colors">
        <h1 class="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Minhas Tarefas</h1>
        
        <!-- Formulário para adicionar tarefa -->
        <form @submit.prevent="handleAddTodo" class="space-y-4">
          <div class="flex items-center gap-2">
            <div class="relative flex-1">
              <input
                ref="titleInputRef"
                v-model="newTodo.title"
                type="text"
                placeholder="Digite uma nova tarefa..."
                required
                @input="handleTitleInput"
                @focus="showSuggestions = true"
                @blur="handleBlur"
                @keydown.down.prevent="navigateSuggestions(1)"
                @keydown.up.prevent="navigateSuggestions(-1)"
                @keydown.enter.prevent="selectCurrentSuggestion"
                @keydown.esc="closeSuggestions"
                class="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
              />
              
              <!-- Dropdown de sugestões -->
              <div
                v-if="showSuggestions && filteredSuggestions.length > 0"
                class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto transition-colors"
              >
                <button
                  v-for="(suggestion, index) in filteredSuggestions"
                  :key="suggestion.id"
                  type="button"
                  @mousedown.prevent="selectSuggestion(suggestion.title)"
                  class="w-full text-left px-3 md:px-4 py-2 text-xs md:text-sm hover:bg-blue-50 transition border-b border-gray-100 last:border-b-0"
                  :class="{ 'bg-blue-100': index === selectedSuggestionIndex }"
                >
                  <div class="font-medium text-gray-800">{{ suggestion.title }}</div>
                  <div v-if="suggestion.description" class="text-gray-500 text-[10px] md:text-xs truncate mt-0.5">
                    {{ suggestion.description }}
                  </div>
                </button>
              </div>
            </div>
            
            <!-- Botão Melhorar com IA -->
            <button
              type="button"
              @click="improveText"
              :disabled="!newTodo.title.trim() || isImprovingText"
              class="p-2 rounded-lg transition flex items-center justify-center shrink-0"
              :class="!newTodo.title.trim() || isImprovingText 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-yellow-500 text-white hover:bg-yellow-600'"
              title="Melhorar texto com IA"
            >
              <svg v-if="!isImprovingText" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"/>
              </svg>
              <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </button>
          </div>
          
          <div>
            <textarea
              v-model="newTodo.description"
              placeholder="Descrição (opcional)"
              rows="2"
              class="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div class="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-2">
            <label class="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">Tags:</label>
            <div class="flex flex-wrap gap-1.5 md:gap-2">
              <button
                v-for="tag in tagStore.tags"
                :key="tag.id"
                type="button"
                @click="toggleTag(tag.id)"
                class="px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs md:text-sm transition border-2"
                :class="newTodo.tagIds.includes(tag.id) 
                  ? [getTagColor(tag.name).bg, getTagColor(tag.name).text, getTagColor(tag.name).border, 'font-medium']
                  : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'"
              >
                {{ tag.name }}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            class="w-full bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition text-sm md:text-base font-medium"
          >
            Adicionar Tarefa
          </button>
        </form>
      </div>
      
      <!-- Filtros -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 mb-4 md:mb-6 transition-colors">
        <div class="flex items-center justify-between cursor-pointer" @click="showFilters = !showFilters">
          <h2 class="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100">Filtros</h2>
          <button
            type="button"
            class="p-1 text-gray-600 hover:text-gray-800 transition"
            :title="showFilters ? 'Recolher filtros' : 'Expandir filtros'"
          >
            <svg 
              class="w-5 h-5 transition-transform duration-200" 
              :class="{ 'rotate-180': showFilters }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>
        
        <div v-show="showFilters" class="mt-3 md:mt-4">
          <!-- Campo de busca -->
          <div class="mb-3 md:mb-4">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar por título ou descrição..."
                class="w-full px-3 md:px-4 py-2 pl-9 md:pl-10 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg class="absolute left-2.5 md:left-3 top-2.5 w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
          
          <!-- Filtro por tags -->
          <div v-if="tagStore.tags.length > 0" class="mb-3 md:mb-4">
            <label class="text-xs md:text-sm font-medium text-gray-700 mb-2 block">Filtrar por tags:</label>
            <div class="flex flex-wrap gap-1.5 md:gap-2">
              <button
                v-for="tag in tagStore.tags"
                :key="tag.id"
                type="button"
                @click="toggleFilterTag(tag.id)"
                class="px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs md:text-sm transition border-2"
                :class="selectedFilterTags.includes(tag.id) 
                  ? [getTagColor(tag.name).bg, getTagColor(tag.name).text, getTagColor(tag.name).border, 'font-medium']
                  : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'"
              >
                {{ tag.name }}
              </button>
            </div>
          </div>
          
          <!-- Botão limpar filtros -->
          <div v-if="searchQuery || selectedFilterTags.length > 0" class="flex justify-end">
            <button
              @click="clearFilters"
              class="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Limpar filtros
            </button>
          </div>
        </div>
      </div>
      
      <!-- Lista de tarefas -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 transition-colors">
        <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-4 space-y-3 md:space-y-0">
          <h2 class="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-100">
            Lista ({{ filteredTodos.length }} {{ filteredTodos.length === 1 ? 'tarefa' : 'tarefas' }})
          </h2>
          
          <div class="flex flex-wrap gap-2 items-center">
            <!-- Seletor de Visualização -->
            <div class="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                @click="setViewMode('list')"
                :class="viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-600'"
                class="p-1.5 rounded transition"
                title="Visualização em lista"
              >
                <svg class="w-4 h-4 md:w-5 md:h-5 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
              <button
                @click="setViewMode('grid-2')"
                :class="viewMode === 'grid-2' ? 'bg-white dark:bg-gray-600 shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-600'"
                class="p-1.5 rounded transition"
                title="Grid 2 colunas"
              >
                <svg class="w-4 h-4 md:w-5 md:h-5 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path>
                </svg>
              </button>
              <button
                @click="setViewMode('grid-3')"
                :class="viewMode === 'grid-3' ? 'bg-white dark:bg-gray-600 shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-600'"
                class="p-1.5 rounded transition"
                title="Grid 3 colunas"
              >
                <svg class="w-4 h-4 md:w-5 md:h-5 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path>
                  <circle cx="12" cy="7" r="1" fill="currentColor"/>
                  <circle cx="12" cy="17" r="1" fill="currentColor"/>
                </svg>
              </button>
            </div>
            
            <!-- Botão Exportar Selecionadas -->
            <button
              v-if="selectedTodos.length > 0"
              @click="exportSelectedAsTxt"
              class="flex items-center space-x-1.5 md:space-x-2 px-3 md:px-4 py-1.5 md:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-xs md:text-sm"
              title="Exportar tarefas selecionadas como TXT"
            >
              <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <span class="hidden sm:inline">Exportar ({{ selectedTodos.length }})</span>
              <span class="sm:hidden">({{ selectedTodos.length }})</span>
            </button>
            
            <button
              @click="importData"
              class="flex items-center space-x-1.5 md:space-x-2 px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs md:text-sm"
              title="Importar backup dos dados"
            >
              <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <span class="hidden sm:inline">Importar</span>
            </button>
            
            <button
              @click="exportData"
              class="flex items-center space-x-1.5 md:space-x-2 px-3 md:px-4 py-1.5 md:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs md:text-sm"
              title="Exportar backup dos dados"
            >
              <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <span class="hidden sm:inline">Exportar</span>
            </button>
          </div>
        </div>
        
        <div v-if="filteredTodos.length === 0" class="text-center py-6 md:py-8 text-gray-500 dark:text-gray-400 text-sm md:text-base px-4">
          {{ searchQuery || selectedFilterTags.length > 0 ? 'Nenhuma tarefa encontrada com os filtros aplicados.' : 'Nenhuma tarefa cadastrada. Adicione uma nova tarefa acima!' }}
        </div>
        
        <div 
          ref="todoListRef" 
          :class="{
            'space-y-2 md:space-y-3': viewMode === 'list',
            'grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4': viewMode === 'grid-2',
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4': viewMode === 'grid-3'
          }"
        >
          <TodoItem
            v-for="todo in filteredTodos"
            :key="todo.id"
            :todo="todo"
            :tags="getTodoTags(todo)"
            :selected="selectedTodos.includes(todo.id)"
            :view-mode="viewMode"
            @edit="editTodo"
            @delete="deleteTodo"
            @toggle-done="toggleDone"
            @toggle-select="toggleSelectTodo"
            @toggle-pin="togglePin"
            @toggle-archive="toggleArchive"
            @update-title="updateTodoTitle"
          />
        </div>
      </div>
    </div>
    
    <!-- Modal de edição -->
    <TodoEditModal
      v-if="editingTodo"
      :todo="editingTodo"
      :all-tags="tagStore.tags"
      @save="saveEdit"
      @cancel="cancelEdit"
    />
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useTodoStore } from '../stores/todo'
import { useTagStore } from '../stores/tag'
import { getTagColor } from '../utils/colors'
import AppLayout from '../components/AppLayout.vue'
import TodoItem from '../components/TodoItem.vue'
import TodoEditModal from '../components/TodoEditModal.vue'
import Sortable from 'sortablejs'

const todoStore = useTodoStore()
const tagStore = useTagStore()

const newTodo = ref({
  title: '',
  description: '',
  tagIds: [],
  done: false
})

const editingTodo = ref(null)
const todoListRef = ref(null)
const titleInputRef = ref(null)

// Estados de filtro
const searchQuery = ref('')
const selectedFilterTags = ref([])
const showFilters = ref(false) // Colapsado por padrão

// Estado de seleção múltipla
const selectedTodos = ref([])

// Estados de autocomplete
const showSuggestions = ref(false)
const selectedSuggestionIndex = ref(-1)

// Estado para melhorar texto com IA
const isImprovingText = ref(false)

// Estado do modo de visualização (lista, grid-2, grid-3)
const viewMode = ref(localStorage.getItem('todoViewMode') || 'list')

// Função para alterar modo de visualização
function setViewMode(mode) {
  viewMode.value = mode
  localStorage.setItem('todoViewMode', mode)
}

// Computed para sugestões filtradas
const filteredSuggestions = computed(() => {
  const input = newTodo.value.title.trim().toLowerCase()
  
  // Não mostrar sugestões se input vazio ou muito curto
  if (input.length < 2) return []
  
  // Filtrar todos que contenham o texto digitado (exceto arquivados)
  return todoStore.todos
    .filter(todo => !todo.archived && todo.title.toLowerCase().includes(input))
    .slice(0, 5) // Limitar a 5 sugestões
})

// Computed para filtrar tarefas
const filteredTodos = computed(() => {
  let todos = todoStore.sortedTodos
  
  // Filtrar tarefas não arquivadas
  todos = todos.filter(todo => !todo.archived)
  
  // Filtro por busca (título ou descrição)
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    todos = todos.filter(todo => 
      todo.title.toLowerCase().includes(query) ||
      (todo.description && todo.description.toLowerCase().includes(query))
    )
  }
  
  // Filtro por tags
  if (selectedFilterTags.value.length > 0) {
    todos = todos.filter(todo => {
      if (!todo.tagIds || todo.tagIds.length === 0) return false
      return selectedFilterTags.value.every(tagId => todo.tagIds.includes(tagId))
    })
  }
  
  return todos
})

// Função para alternar filtro de tag
function toggleFilterTag(tagId) {
  const index = selectedFilterTags.value.indexOf(tagId)
  if (index > -1) {
    selectedFilterTags.value.splice(index, 1)
  } else {
    selectedFilterTags.value.push(tagId)
  }
}

// Função para limpar filtros
function clearFilters() {
  searchQuery.value = ''
  selectedFilterTags.value = []
}

// Funções de autocomplete
function handleTitleInput() {
  showSuggestions.value = true
  selectedSuggestionIndex.value = -1
}

function handleBlur() {
  // Pequeno delay para permitir o click na sugestão
  setTimeout(() => {
    showSuggestions.value = false
    selectedSuggestionIndex.value = -1
  }, 200)
}

function navigateSuggestions(direction) {
  if (filteredSuggestions.value.length === 0) return
  
  const newIndex = selectedSuggestionIndex.value + direction
  
  if (newIndex < -1) {
    selectedSuggestionIndex.value = filteredSuggestions.value.length - 1
  } else if (newIndex >= filteredSuggestions.value.length) {
    selectedSuggestionIndex.value = -1
  } else {
    selectedSuggestionIndex.value = newIndex
  }
}

function selectCurrentSuggestion() {
  if (selectedSuggestionIndex.value >= 0 && selectedSuggestionIndex.value < filteredSuggestions.value.length) {
    selectSuggestion(filteredSuggestions.value[selectedSuggestionIndex.value].title)
  } else {
    // Se nenhuma sugestão selecionada, submete o form
    handleAddTodo()
  }
}

function selectSuggestion(title) {
  newTodo.value.title = title
  showSuggestions.value = false
  selectedSuggestionIndex.value = -1
  titleInputRef.value?.focus()
}

function closeSuggestions() {
  showSuggestions.value = false
  selectedSuggestionIndex.value = -1
}

// Função para melhorar texto com IA
async function improveText() {
  if (!newTodo.value.title.trim() || isImprovingText.value) return
  
  isImprovingText.value = true
  
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    const response = await fetch(`${API_URL}/api/ai/improve-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newTodo.value.title })
    })
    
    const result = await response.json()
    
    if (result.success && result.improved) {
      newTodo.value.title = result.improved
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

onMounted(async () => {
  await Promise.all([
    todoStore.fetchTodos(),
    tagStore.fetchTags()
  ])
  
  await nextTick()
  initSortable()
})

let sortableInstance = null

function initSortable() {
  if (todoListRef.value && viewMode.value === 'list') {
    sortableInstance = Sortable.create(todoListRef.value, {
      animation: 150,
      handle: '.drag-handle',
      onEnd: async (evt) => {
        const newOrder = Array.from(todoListRef.value.children).map(el => {
          const index = Array.from(todoListRef.value.children).indexOf(el)
          return filteredTodos.value[index]?.id
        }).filter(Boolean)
        
        await todoStore.updateOrder(newOrder)
      }
    })
  }
}

function destroySortable() {
  if (sortableInstance) {
    sortableInstance.destroy()
    sortableInstance = null
  }
}

// Reinicializar sortable quando viewMode mudar
function updateSortable() {
  destroySortable()
  if (viewMode.value === 'list') {
    nextTick(() => initSortable())
  }
}

// Watch para recriar sortable quando viewMode mudar
import { watch } from 'vue'
watch(viewMode, () => {
  updateSortable()
})

function toggleTag(tagId) {
  const index = newTodo.value.tagIds.indexOf(tagId)
  if (index > -1) {
    newTodo.value.tagIds.splice(index, 1)
  } else {
    newTodo.value.tagIds.push(tagId)
  }
}

async function handleAddTodo() {
  if (newTodo.value.title.trim()) {
    await todoStore.addTodo({ ...newTodo.value })
    
    newTodo.value = {
      title: '',
      description: '',
      tagIds: [],
      done: false
    }
  }
}

function getTodoTags(todo) {
  if (!todo.tagIds) return []
  return tagStore.tags.filter(tag => todo.tagIds.includes(tag.id))
}

function editTodo(todo) {
  editingTodo.value = { ...todo }
}

async function saveEdit(updatedTodo) {
  await todoStore.updateTodo(updatedTodo.id, updatedTodo)
  editingTodo.value = null
}

function cancelEdit() {
  editingTodo.value = null
}

async function deleteTodo(id) {
  if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
    await todoStore.deleteTodo(id)
  }
}

async function toggleDone(todo) {
  await todoStore.updateTodo(todo.id, { done: !todo.done })
}

function toggleSelectTodo(todoId) {
  const index = selectedTodos.value.indexOf(todoId)
  if (index > -1) {
    selectedTodos.value.splice(index, 1)
  } else {
    selectedTodos.value.push(todoId)
  }
}

async function togglePin(todoId) {
  const todo = todoStore.todos.find(t => t.id === todoId)
  if (todo) {
    await todoStore.updateTodo(todoId, { pinned: !todo.pinned })
  }
}

async function toggleArchive(todoId) {
  const todo = todoStore.todos.find(t => t.id === todoId)
  if (todo) {
    await todoStore.updateTodo(todoId, { archived: true })
  }
}

async function updateTodoTitle(todoId, newTitle) {
  await todoStore.updateTodo(todoId, { title: newTitle })
}

function exportSelectedAsTxt() {
  const selected = todoStore.todos.filter(t => selectedTodos.value.includes(t.id))
  
  if (selected.length === 0) {
    alert('Nenhuma tarefa selecionada')
    return
  }
  
  let content = '=== LISTA DE TAREFAS ===\n\n'
  
  selected.forEach((todo, index) => {
    const pinned = todo.pinned ? '📌 ' : ''
    
    content += `${index + 1}. ${pinned}${todo.title}\n`
    
    if (todo.done && todo.completedAt) {
      const date = new Date(todo.completedAt).toLocaleString('pt-BR')
      content += `   Concluída em: ${date}\n`
    }
    
    content += '\n'
  })
  
  content += `\n--- Exportado em ${new Date().toLocaleString('pt-BR')} ---`
  
  // Gerar nome do arquivo com formato dia_hora_min_seg
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const filename = `tarefas-${day}-${month}-${year}_${hours}h${minutes}min${seconds}s.txt`
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
  
  // Limpar seleção após exportar
  selectedTodos.value = []
}

async function exportData() {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    const response = await fetch(`${API_URL}/api/export`)
    
    if (!response.ok) {
      throw new Error('Erro ao exportar dados')
    }
    
    const blob = await response.blob()
    
    // Gerar nome do arquivo com formato dia_hora_min_seg
    const now = new Date()
    const day = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const year = now.getFullYear()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    const filename = `todo-backup-${day}-${month}-${year}_${hours}h${minutes}min${seconds}s.json`
    
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Erro ao exportar:', error)
    alert('Erro ao exportar dados. Verifique se o servidor está rodando.')
  }
}

async function importData() {
  try {
    // Criar input file temporário
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,application/json'
    
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return
      
      // Confirmar com o usuário
      if (!confirm('⚠️ ATENÇÃO: Importar dados irá SUBSTITUIR TODOS os dados atuais. Deseja continuar?')) {
        return
      }
      
      try {
        // Ler arquivo
        const text = await file.text()
        const importedData = JSON.parse(text)
        
        // Enviar para o backend
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
        const response = await fetch(`${API_URL}/api/import`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(importedData)
        })
        
        const result = await response.json()
        
        if (result.success) {
          alert(`✅ Dados importados com sucesso!\n\n📊 Estatísticas:\n- ${result.stats.users} usuário(s)\n- ${result.stats.todos} tarefa(s)\n- ${result.stats.tags} tag(s)`)
          
          // Recarregar dados nas stores
          await Promise.all([
            todoStore.fetchTodos(),
            tagStore.fetchTags()
          ])
        } else {
          alert(`❌ Erro: ${result.message}`)
        }
      } catch (error) {
        console.error('Erro ao importar:', error)
        alert('❌ Erro ao processar arquivo. Verifique se é um arquivo JSON válido.')
      }
    }
    
    // Trigger file picker
    input.click()
  } catch (error) {
    console.error('Erro ao importar:', error)
    alert('Erro ao importar dados. Verifique se o servidor está rodando.')
  }
}
</script>
