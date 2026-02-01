<template>
  <AppLayout>
    <div class="max-w-4xl mx-auto px-4 md:px-0">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-md p-4 md:p-6 mb-4 md:mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl md:text-2xl font-bold text-gray-800">Tarefas</h1>
            <p class="text-xs md:text-sm text-gray-600 mt-1">
              {{ archivedTodos.length }} {{ archivedTodos.length === 1 ? 'tarefa arquivada' : 'tarefas arquivadas' }}
            </p>
          </div>
          
          <!-- Botão voltar -->
          <router-link
            to="/"
            class="flex items-center space-x-2 px-3 md:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-xs md:text-sm"
          >
            <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            <span>Voltar</span>
          </router-link>
        </div>
      </div>
      
      <!-- Lista de tarefas arquivadas -->
      <div class="bg-white rounded-lg shadow-md p-4 md:p-6">
        <div v-if="archivedTodos.length === 0" class="text-center py-8 text-gray-500 text-sm md:text-base">
          Nenhuma tarefa arquivada ainda.
        </div>
        
        <div class="space-y-2 md:space-y-3">
          <TodoItem
            v-for="todo in archivedTodos"
            :key="todo.id"
            :todo="todo"
            :tags="getTodoTags(todo)"
            :selected="false"
            :is-archived="true"
            @edit="editTodo"
            @delete="deleteTodo"
            @toggle-done="toggleDone"
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
      @clone="cloneTodo"
    />
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTodoStore } from '../stores/todo'
import { useTagStore } from '../stores/tag'
import AppLayout from '../components/AppLayout.vue'
import TodoItem from '../components/TodoItem.vue'
import TodoEditModal from '../components/TodoEditModal.vue'

const todoStore = useTodoStore()
const tagStore = useTagStore()

const editingTodo = ref(null)

// Computed para filtrar apenas tarefas arquivadas
const archivedTodos = computed(() => {
  return todoStore.todos.filter(todo => todo.archived === true)
})

onMounted(async () => {
  await Promise.all([
    todoStore.fetchTodos(),
    tagStore.fetchTags()
  ])
})

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

async function cloneTodo(todo) {
  try {
    const clonedTodo = await todoStore.cloneTodo(todo)
    editingTodo.value = null
    
    // Opcionalmente, abrir o modal de edição para a tarefa clonada
    setTimeout(() => {
      editTodo(clonedTodo)
    }, 300)
  } catch (error) {
    console.error('Erro ao clonar tarefa:', error)
    alert('Erro ao clonar tarefa. Tente novamente.')
  }
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

async function togglePin(todoId) {
  const todo = todoStore.todos.find(t => t.id === todoId)
  if (todo) {
    await todoStore.updateTodo(todoId, { pinned: !todo.pinned })
  }
}

async function toggleArchive(todoId) {
  const todo = todoStore.todos.find(t => t.id === todoId)
  if (todo) {
    await todoStore.updateTodo(todoId, { archived: false })
  }
}

async function updateTodoTitle(todoId, newTitle) {
  await todoStore.updateTodo(todoId, { title: newTitle })
}
</script>
