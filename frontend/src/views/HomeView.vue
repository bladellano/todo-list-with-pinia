<template>
  <AppLayout>
    <div class="max-w-4xl mx-auto">
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-4">Minhas Tarefas</h1>
        
        <!-- Formulário para adicionar tarefa -->
        <form @submit.prevent="handleAddTodo" class="space-y-4">
          <div>
            <input
              v-model="newTodo.title"
              type="text"
              placeholder="Digite uma nova tarefa..."
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <textarea
              v-model="newTodo.description"
              placeholder="Descrição (opcional)"
              rows="2"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700">Tags:</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="tag in tagStore.tags"
                :key="tag.id"
                type="button"
                @click="toggleTag(tag.id)"
                class="px-3 py-1 rounded-full text-sm transition"
                :class="newTodo.tagIds.includes(tag.id) 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
              >
                {{ tag.name }}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            Adicionar Tarefa
          </button>
        </form>
      </div>
      
      <!-- Lista de tarefas -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-800">
            Lista ({{ todoStore.sortedTodos.length }} {{ todoStore.sortedTodos.length === 1 ? 'tarefa' : 'tarefas' }})
          </h2>
          
          <button
            @click="exportData"
            class="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            title="Exportar backup dos dados"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <span>Exportar</span>
          </button>
        </div>
        
        <div v-if="todoStore.sortedTodos.length === 0" class="text-center py-8 text-gray-500">
          Nenhuma tarefa cadastrada. Adicione uma nova tarefa acima!
        </div>
        
        <div ref="todoListRef" class="space-y-3">
          <TodoItem
            v-for="todo in todoStore.sortedTodos"
            :key="todo.id"
            :todo="todo"
            :tags="getTodoTags(todo)"
            @edit="editTodo"
            @delete="deleteTodo"
            @toggle-done="toggleDone"
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
import { ref, onMounted, nextTick } from 'vue'
import { useTodoStore } from '../stores/todo'
import { useTagStore } from '../stores/tag'
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
          return todoStore.sortedTodos[index]?.id
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
</script>
