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
        <h2 class="text-xl font-semibold text-gray-800 mb-4">
          Lista ({{ todoStore.sortedTodos.length }} {{ todoStore.sortedTodos.length === 1 ? 'tarefa' : 'tarefas' }})
        </h2>
        
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
</script>
