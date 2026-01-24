<template>
  <AppLayout>
    <div class="max-w-4xl mx-auto px-4 md:px-0">
      <div class="bg-white rounded-lg shadow-md p-4 md:p-6 mb-4 md:mb-6">
        <h1 class="text-xl md:text-2xl font-bold text-gray-800 mb-4">Minhas Tarefas</h1>
        
        <!-- Formulário para adicionar tarefa -->
        <form @submit.prevent="handleAddTodo" class="space-y-4">
          <div class="relative">
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
              class="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <!-- Dropdown de sugestões -->
            <div
              v-if="showSuggestions && filteredSuggestions.length > 0"
              class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
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
          
          <div>
            <textarea
              v-model="newTodo.description"
              placeholder="Descrição (opcional)"
              rows="2"
              class="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div class="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-2">
            <label class="text-xs md:text-sm font-medium text-gray-700">Tags:</label>
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
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition text-sm md:text-base font-medium"
          >
            Adicionar Tarefa
          </button>
        </form>
      </div>
      
      <!-- Filtros -->
      <div class="bg-white rounded-lg shadow-md p-4 md:p-6 mb-4 md:mb-6">
        <h2 class="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Filtros</h2>
        
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
      
      <!-- Lista de tarefas -->
      <div class="bg-white rounded-lg shadow-md p-4 md:p-6">
        <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-4 space-y-3 md:space-y-0">
          <h2 class="text-lg md:text-xl font-semibold text-gray-800">
            Lista ({{ filteredTodos.length }} {{ filteredTodos.length === 1 ? 'tarefa' : 'tarefas' }})
          </h2>
          
          <div class="flex flex-wrap gap-2">
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
        
        <div v-if="filteredTodos.length === 0" class="text-center py-6 md:py-8 text-gray-500 text-sm md:text-base px-4">
          {{ searchQuery || selectedFilterTags.length > 0 ? 'Nenhuma tarefa encontrada com os filtros aplicados.' : 'Nenhuma tarefa cadastrada. Adicione uma nova tarefa acima!' }}
        </div>
        
        <div ref="todoListRef" class="space-y-2 md:space-y-3">
          <TodoItem
            v-for="todo in filteredTodos"
            :key="todo.id"
            :todo="todo"
            :tags="getTodoTags(todo)"
            :selected="selectedTodos.includes(todo.id)"
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

// Estado de seleção múltipla
const selectedTodos = ref([])

// Estados de autocomplete
const showSuggestions = ref(false)
const selectedSuggestionIndex = ref(-1)

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

onMounted(async () => {
  await Promise.all([
    todoStore.fetchTodos(),
    tagStore.fetchTags()
  ])
  
  await nextTick()
  initSortable()
})

function initSortable() {
  if (todoListRef.value) {
    Sortable.create(todoListRef.value, {
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
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `tarefas-${new Date().toISOString().split('T')[0]}.txt`
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
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `todo-backup-${new Date().toISOString().split('T')[0]}.json`
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
