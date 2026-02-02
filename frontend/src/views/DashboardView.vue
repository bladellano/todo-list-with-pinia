<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto px-4 md:px-0">
      <!-- Header -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 mb-4 md:mb-6 transition-colors">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>
            <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
              Visão geral das suas tarefas e métricas
            </p>
          </div>
        </div>
      </div>

      <!-- Grid de Cards Principais -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <!-- Total de Tarefas -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Total de Tarefas</p>
              <p class="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-2">{{ totalTodos }}</p>
            </div>
            <div class="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Tarefas Concluídas -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Concluídas</p>
              <p class="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{{ completedTodos }}</p>
            </div>
            <div class="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Tarefas Pendentes -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Pendentes</p>
              <p class="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">{{ pendingTodos }}</p>
            </div>
            <div class="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
              <svg class="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Taxa de Conclusão -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Taxa de Conclusão</p>
              <p class="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">{{ completionRate }}%</p>
            </div>
            <div class="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <svg class="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Grid Principal com 2 Colunas -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Distribuição por Tags/Projetos -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Distribuição por Tags</h2>
          <div class="space-y-3">
            <div v-for="tag in topTags" :key="tag.id" class="flex items-center justify-between">
              <div class="flex items-center space-x-3 flex-1">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[100px]">{{ tag.name }}</span>
                <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full transition-all duration-300"
                    :class="getTagBarColor(tag.name)"
                    :style="{ width: `${(tag.count / totalTodos) * 100}%` }"
                  ></div>
                </div>
              </div>
              <span class="text-sm font-bold text-gray-800 dark:text-gray-100 ml-3">{{ tag.count }}</span>
            </div>
          </div>
        </div>

        <!-- Tarefas Críticas/Prioridade Alta -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Tarefas Críticas</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div class="flex items-center space-x-2">
                <svg class="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a5.927 5.927 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707-.195-.195.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a5.922 5.922 0 0 1 1.013.16l3.134-3.133a2.772 2.772 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146z"/>
                </svg>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Fixadas</span>
              </div>
              <span class="text-xl font-bold text-yellow-600">{{ pinnedTodos }}</span>
            </div>
            
            <div class="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div class="flex items-center space-x-2">
                <svg class="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
                </svg>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Com Notificações</span>
              </div>
              <span class="text-xl font-bold text-purple-600">{{ notifiableTodos }}</span>
            </div>
            
            <div class="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div class="flex items-center space-x-2">
                <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Com E-mail</span>
              </div>
              <span class="text-xl font-bold text-orange-600">{{ emailTodos }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Distribuição por Status e Aging Report -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Distribuição por Status -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Distribuição por Status</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">Concluídas</span>
              <span class="text-lg font-bold text-green-600">{{ completedTodos }} ({{ Math.round((completedTodos / totalTodos) * 100) }}%)</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div class="bg-green-500 h-3 rounded-full transition-all duration-300" :style="{ width: `${(completedTodos / totalTodos) * 100}%` }"></div>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">Pendentes</span>
              <span class="text-lg font-bold text-orange-600">{{ pendingTodos }} ({{ Math.round((pendingTodos / totalTodos) * 100) }}%)</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div class="bg-orange-500 h-3 rounded-full transition-all duration-300" :style="{ width: `${(pendingTodos / totalTodos) * 100}%` }"></div>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">Arquivadas</span>
              <span class="text-lg font-bold text-gray-600">{{ archivedTodos }} ({{ Math.round((archivedTodos / totalTodos) * 100) }}%)</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div class="bg-gray-500 h-3 rounded-full transition-all duration-300" :style="{ width: `${(archivedTodos / totalTodos) * 100}%` }"></div>
            </div>
          </div>
        </div>

        <!-- Aging Report - Tarefas Mais Antigas -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Tarefas Mais Antigas (Sem Conclusão)</h2>
          <div class="space-y-3">
            <div v-if="oldestTodos.length === 0" class="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
              Nenhuma tarefa pendente!
            </div>
            <div 
              v-for="todo in oldestTodos" 
              :key="todo.id"
              class="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
              @click="goToHome"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{{ todo.title }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Criada há {{ getDaysAgo(todo.createdAt) }} dias
                  </p>
                </div>
                <span 
                  v-if="todo.pinned"
                  class="flex-shrink-0 ml-2"
                  title="Fixada"
                >
                  <svg class="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a5.927 5.927 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707-.195-.195.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a5.922 5.922 0 0 1 1.013.16l3.134-3.133a2.772 2.772 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146z"/>
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tempo Médio de Conclusão -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6 transition-colors">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Tempo Médio de Conclusão</h2>
        <div class="text-center">
          <p class="text-5xl font-bold text-blue-600 dark:text-blue-400">{{ averageCompletionTime }}</p>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">dias em média para concluir uma tarefa</p>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTodoStore } from '../stores/todo'
import { useTagStore } from '../stores/tag'
import AppLayout from '../components/AppLayout.vue'

const router = useRouter()
const todoStore = useTodoStore()
const tagStore = useTagStore()

onMounted(async () => {
  await Promise.all([
    todoStore.fetchTodos(),
    tagStore.fetchTags()
  ])
})

// Métricas Gerais
const totalTodos = computed(() => todoStore.todos.length)
const completedTodos = computed(() => todoStore.todos.filter(t => t.done).length)
const pendingTodos = computed(() => todoStore.todos.filter(t => !t.done && !t.archived).length)
const archivedTodos = computed(() => todoStore.todos.filter(t => t.archived).length)
const completionRate = computed(() => {
  if (totalTodos.value === 0) return 0
  return Math.round((completedTodos.value / totalTodos.value) * 100)
})

// Tarefas Críticas
const pinnedTodos = computed(() => todoStore.todos.filter(t => t.pinned && !t.done && !t.archived).length)
const notifiableTodos = computed(() => todoStore.todos.filter(t => t.notificable && !t.done && !t.archived).length)
const emailTodos = computed(() => todoStore.todos.filter(t => t.sendByEmail && !t.done && !t.archived).length)

// Distribuição por Tags (Top 5)
const topTags = computed(() => {
  const tagCounts = {}
  
  todoStore.todos.forEach(todo => {
    if (todo.tagIds && Array.isArray(todo.tagIds)) {
      todo.tagIds.forEach(tagId => {
        tagCounts[tagId] = (tagCounts[tagId] || 0) + 1
      })
    }
  })
  
  return tagStore.tags
    .map(tag => ({
      id: tag.id,
      name: tag.name,
      count: tagCounts[tag.id] || 0
    }))
    .filter(tag => tag.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})

// Tarefas Mais Antigas (Top 5)
const oldestTodos = computed(() => {
  return todoStore.todos
    .filter(t => !t.done && !t.archived)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(0, 5)
})

// Tempo Médio de Conclusão
const averageCompletionTime = computed(() => {
  const completed = todoStore.todos.filter(t => t.done && t.completedAt)
  
  if (completed.length === 0) return '0'
  
  const totalDays = completed.reduce((sum, todo) => {
    const created = new Date(todo.createdAt)
    const completedDate = new Date(todo.completedAt)
    const days = Math.floor((completedDate - created) / (1000 * 60 * 60 * 24))
    return sum + days
  }, 0)
  
  return Math.round(totalDays / completed.length)
})

function getDaysAgo(dateStr) {
  const created = new Date(dateStr)
  const now = new Date()
  const days = Math.floor((now - created) / (1000 * 60 * 60 * 24))
  return days
}

function getTagBarColor(tagName) {
  const colors = {
    'NYX': 'bg-blue-500',
    'Caio': 'bg-green-500',
    'ZPT': 'bg-purple-500',
    'CDNS WEB': 'bg-orange-500',
    'PAIDEIA': 'bg-pink-500'
  }
  return colors[tagName] || 'bg-gray-500'
}

function goToHome() {
  router.push('/')
}
</script>
