<template>
  <AppLayout>
    <div class="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1920px]">
      <!-- Header -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 mb-4 md:mb-6 transition-colors">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 text-pretty">Arquivadas</h1>
            <p class="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ filteredTodos.length }} {{ filteredTodos.length === 1 ? 'tarefa arquivada' : 'tarefas arquivadas' }}
            </p>
          </div>

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

      <!-- Filtros -->
      <section class="workspace-panel">
        <div class="workspace-section">
          <header class="workspace-header">
            <div class="workspace-header__text">
              <div class="workspace-title-row">
                <h2 class="workspace-title">Filtrar tarefas</h2>
                <span v-if="activeFilterCount > 0" class="workspace-badge">{{ activeFilterCount }}</span>
              </div>
              <p class="workspace-subtitle">Encontre rapidamente o que importa</p>
            </div>
            <button
              v-if="hasActiveFilters"
              type="button"
              class="workspace-clear"
              @click="clearFilters"
            >
              Limpar
            </button>
          </header>

          <div class="filters-bar">
            <label for="archived-search-query" class="sr-only">Buscar tarefas arquivadas</label>
            <div class="filters-search">
              <input
                id="archived-search-query"
                v-model="searchQuery"
                name="search"
                type="search"
                autocomplete="off"
                placeholder="Buscar por título ou descrição…"
                class="filters-search__input"
              />
            </div>

            <button
              type="button"
              class="filters-advanced-toggle"
              @click="showFilters = !showFilters"
              :aria-expanded="showFilters"
              aria-controls="archived-advanced-filters"
            >
              {{ showFilters ? 'Ocultar filtros avançados' : 'Filtros avançados' }}
            </button>
          </div>

          <div
            v-show="showFilters"
            id="archived-advanced-filters"
            class="filters-advanced"
          >
            <fieldset v-if="tagStore.tags.length > 0" class="filters-group">
              <legend class="filters-group__label">Tags</legend>
              <div class="filters-group__chips">
                <button
                  v-for="tag in tagStore.tags"
                  :key="tag.id"
                  type="button"
                  @click="toggleFilterTag(tag.id)"
                  class="task-form__chip border-2"
                  :class="selectedFilterTags.includes(tag.id)
                    ? [getTagColor(tag.name).bg, getTagColor(tag.name).text, getTagColor(tag.name).border, 'task-form__chip--active']
                    : 'task-form__chip--idle'"
                >
                  {{ tag.name }}
                </button>
              </div>
            </fieldset>

            <fieldset class="filters-group">
              <legend class="filters-group__label">Envio por e-mail</legend>
              <div class="filters-segmented" role="group" aria-label="Filtrar por e-mail">
                <button
                  type="button"
                  @click="setSendFrequencyFilter('all')"
                  class="filters-segmented__btn"
                  :class="{ 'filters-segmented__btn--active': sendFrequencyFilter === 'all' }"
                  :aria-pressed="sendFrequencyFilter === 'all'"
                >
                  Todas
                </button>
                <button
                  type="button"
                  @click="setSendFrequencyFilter('email-enabled')"
                  class="filters-segmented__btn"
                  :class="{ 'filters-segmented__btn--active': sendFrequencyFilter === 'email-enabled' }"
                  :aria-pressed="sendFrequencyFilter === 'email-enabled'"
                >
                  Com e-mail ativo
                </button>
              </div>
            </fieldset>
          </div>
        </div>
      </section>

      <!-- Lista de tarefas arquivadas -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 transition-colors">
        <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-4 space-y-3 md:space-y-0">
          <h2 class="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-100">
            Lista ({{ filteredTodos.length }} {{ filteredTodos.length === 1 ? 'tarefa' : 'tarefas' }})
          </h2>

          <div class="flex flex-wrap gap-2 items-center">
            <div class="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                @click="setViewMode('list')"
                :class="viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-600'"
                class="p-1.5 rounded transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Visualização em lista"
                :aria-pressed="viewMode === 'list'"
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
                <span class="w-4 h-4 md:w-5 md:h-5 text-gray-700 dark:text-gray-200 font-bold text-xs flex items-center justify-center">2</span>
              </button>
              <button
                @click="setViewMode('grid-3')"
                :class="viewMode === 'grid-3' ? 'bg-white dark:bg-gray-600 shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-600'"
                class="p-1.5 rounded transition"
                title="Grid 3 colunas"
              >
                <span class="w-4 h-4 md:w-5 md:h-5 text-gray-700 dark:text-gray-200 font-bold text-xs flex items-center justify-center">3</span>
              </button>
              <button
                @click="setViewMode('grid-4')"
                :class="viewMode === 'grid-4' ? 'bg-white dark:bg-gray-600 shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-600'"
                class="p-1.5 rounded transition hidden lg:flex"
                title="Grid 4 colunas"
              >
                <span class="w-4 h-4 md:w-5 md:h-5 text-gray-700 dark:text-gray-200 font-bold text-xs flex items-center justify-center">4</span>
              </button>
              <button
                @click="setViewMode('grid-5')"
                :class="viewMode === 'grid-5' ? 'bg-white dark:bg-gray-600 shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-600'"
                class="p-1.5 rounded transition hidden xl:flex"
                title="Grid 5 colunas"
              >
                <span class="w-4 h-4 md:w-5 md:h-5 text-gray-700 dark:text-gray-200 font-bold text-xs flex items-center justify-center">5</span>
              </button>
              <button
                @click="setViewMode('grid-6')"
                :class="viewMode === 'grid-6' ? 'bg-white dark:bg-gray-600 shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-600'"
                class="p-1.5 rounded transition hidden 2xl:flex"
                title="Grid 6 colunas"
              >
                <span class="w-4 h-4 md:w-5 md:h-5 text-gray-700 dark:text-gray-200 font-bold text-xs flex items-center justify-center">6</span>
              </button>
              <button
                @click="setViewMode('grid-7')"
                :class="viewMode === 'grid-7' ? 'bg-white dark:bg-gray-600 shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-600'"
                class="p-1.5 rounded transition hidden 2xl:flex"
                title="Grid 7 colunas"
              >
                <span class="w-4 h-4 md:w-5 md:h-5 text-gray-700 dark:text-gray-200 font-bold text-xs flex items-center justify-center">7</span>
              </button>
              <button
                @click="setViewMode('grid-8')"
                :class="viewMode === 'grid-8' ? 'bg-white dark:bg-gray-600 shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-600'"
                class="p-1.5 rounded transition hidden 2xl:flex"
                title="Grid 8 colunas"
              >
                <span class="w-4 h-4 md:w-5 md:h-5 text-gray-700 dark:text-gray-200 font-bold text-xs flex items-center justify-center">8</span>
              </button>
            </div>
          </div>
        </div>

        <div v-if="filteredTodos.length === 0" class="text-center py-6 md:py-8 text-gray-500 dark:text-gray-400 text-sm md:text-base px-4">
          {{ hasActiveFilters ? 'Nenhuma tarefa encontrada com os filtros aplicados.' : 'Nenhuma tarefa arquivada ainda.' }}
        </div>

        <div
          :class="{
            'space-y-2 md:space-y-3': viewMode === 'list',
            'grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4': viewMode === 'grid-2',
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4': viewMode === 'grid-3',
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4': viewMode === 'grid-4',
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 md:gap-3': viewMode === 'grid-5',
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-2 md:gap-3': viewMode === 'grid-6',
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-7 gap-2': viewMode === 'grid-7',
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-2': viewMode === 'grid-8'
          }"
        >
          <TodoItem
            v-for="todo in paginatedTodos"
            :key="todo.id"
            :todo="todo"
            :tags="getTodoTags(todo)"
            :selected="false"
            :is-archived="true"
            :view-mode="viewMode"
            @view="viewTodo"
            @edit="editTodo"
            @delete="deleteTodo"
            @toggle-done="toggleDone"
            @toggle-pin="togglePin"
            @toggle-archive="toggleArchive"
            @update-title="updateTodoTitle"
            @move-to-top="moveToTop"
          />
        </div>

        <div v-if="hasMoreTodos" ref="sentinelRef" class="flex justify-center py-4">
          <div class="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
            <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Carregando mais tarefas…</span>
          </div>
        </div>
      </div>
    </div>

    <TodoViewModal
      v-if="viewingTodo"
      :todo="viewingTodo"
      :tags="getTodoTags(viewingTodo)"
      @close="closeViewModal"
      @edit="editTodo"
    />

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
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useTodoStore } from '../stores/todo'
import { useTagStore } from '../stores/tag'
import { getTagColor } from '../utils/colors'
import { useTodoFilters } from '../composables/useTodoFilters'
import AppLayout from '../components/AppLayout.vue'
import TodoItem from '../components/TodoItem.vue'
import TodoEditModal from '../components/TodoEditModal.vue'
import TodoViewModal from '../components/TodoViewModal.vue'

const todoStore = useTodoStore()
const tagStore = useTagStore()

const editingTodo = ref(null)
const viewingTodo = ref(null)
const showFilters = ref(false)
const viewMode = ref(localStorage.getItem('todoViewMode') || 'list')
const displayLimit = ref(20)
const sentinelRef = ref(null)

const {
  searchQuery,
  selectedFilterTags,
  sendFrequencyFilter,
  filteredTodos,
  toggleFilterTag,
  setSendFrequencyFilter,
  clearFilters
} = useTodoFilters(computed(() => todoStore.sortedTodos), { archivedOnly: true })

const activeFilterCount = computed(() => {
  let count = 0
  if (searchQuery.value.trim()) count++
  count += selectedFilterTags.value.length
  if (sendFrequencyFilter.value !== 'all') count++
  return count
})

const hasActiveFilters = computed(() => activeFilterCount.value > 0)

const paginatedTodos = computed(() => filteredTodos.value.slice(0, displayLimit.value))

const hasMoreTodos = computed(() => filteredTodos.value.length > displayLimit.value)

function setViewMode(mode) {
  viewMode.value = mode
  localStorage.setItem('todoViewMode', mode)
}

function loadMoreTodos() {
  displayLimit.value += 10
}

let observer = null

function setupIntersectionObserver() {
  if (!sentinelRef.value) return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && hasMoreTodos.value) {
          loadMoreTodos()
        }
      })
    },
    { rootMargin: '100px' }
  )

  observer.observe(sentinelRef.value)
}

onMounted(async () => {
  await Promise.all([
    todoStore.fetchTodos(),
    tagStore.fetchTags()
  ])

  await nextTick()
  setupIntersectionObserver()
})

onUnmounted(() => {
  observer?.disconnect()
})

function getTodoTags(todo) {
  if (!todo.tagIds) return []
  return tagStore.tags.filter(tag => todo.tagIds.includes(tag.id))
}

function viewTodo(todo) {
  viewingTodo.value = todo
}

function closeViewModal() {
  viewingTodo.value = null
}

function editTodo(todo) {
  viewingTodo.value = null
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
    setTimeout(() => editTodo(clonedTodo), 300)
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
  await todoStore.updateTodo(todoId, { archived: false })
}

async function updateTodoTitle(todoId, newTitle) {
  await todoStore.updateTodo(todoId, { title: newTitle })
}

async function moveToTop(todoId) {
  await todoStore.moveToTop(todoId)
}
</script>

<style scoped>
.workspace-panel {
  @apply bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-5 md:mb-6 overflow-hidden;
}

.workspace-section {
  @apply p-4 md:p-6;
}

.workspace-header {
  @apply flex items-start justify-between gap-3 mb-4 md:mb-5;
}

.workspace-header__text {
  @apply min-w-0;
}

.workspace-title-row {
  @apply flex items-center gap-2;
}

.workspace-title {
  @apply text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight;
}

.workspace-subtitle {
  @apply text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5;
}

.workspace-badge {
  @apply inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[11px] font-semibold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300;
}

.workspace-clear {
  @apply text-xs md:text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-2 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shrink-0;
}

.task-form__chip {
  @apply px-2.5 md:px-3 py-1 rounded-md text-xs md:text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500;
}

.task-form__chip--idle {
  @apply bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600;
}

.task-form__chip--active {
  @apply font-medium;
}

.filters-bar {
  @apply flex flex-col sm:flex-row gap-2 sm:gap-3;
}

.filters-search {
  @apply relative flex-1 min-w-0;
}

.filters-search__input {
  @apply w-full px-3 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.filters-advanced-toggle {
  @apply inline-flex items-center justify-center px-3 py-2.5 text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shrink-0;
}

.filters-advanced {
  @apply mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-4;
}

.filters-group {
  @apply border-0 p-0 m-0;
}

.filters-group__label {
  @apply block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2;
}

.filters-group__chips {
  @apply flex flex-wrap gap-1.5 md:gap-2;
}

.filters-segmented {
  @apply flex w-full p-1 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600;
}

.filters-segmented__btn {
  @apply flex-1 px-3 md:px-4 py-1.5 text-xs md:text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500;
}

.filters-segmented__btn--active {
  @apply bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm;
}
</style>
