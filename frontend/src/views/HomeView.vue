<template>
  <AppLayout>
    <!-- Loading State -->
    <div v-if="isLoading" class="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1920px]">
      <div class="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div class="relative">
          <div class="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
        </div>
        <div class="text-center">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Carregando tarefas…</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">Aguarde enquanto preparamos tudo para você</p>
        </div>
      </div>
    </div>
    
    <!-- Main Content -->
    <div v-else class="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1920px]">
      <section class="workspace-panel">
        <!-- Nova tarefa -->
        <div class="workspace-section">
          <header class="workspace-header">
            <div class="workspace-header__text">
              <h1 class="workspace-title">Nova tarefa</h1>
              <p class="workspace-subtitle">Capture rapidamente o que precisa ser feito</p>
            </div>
            <button
              type="button"
              class="workspace-toggle"
              @click="showForm = !showForm"
              :aria-label="showForm ? 'Recolher formulário' : 'Expandir formulário'"
              :aria-expanded="showForm"
            >
              {{ showForm ? 'Recolher' : 'Expandir' }}
            </button>
          </header>

          <form
            v-show="showForm"
            class="task-form"
            @submit.prevent="handleAddTodo"
          >
            <div class="task-form__field">
              <label for="new-todo-title" class="task-form__label">Título</label>
              <div class="task-form__title-row">
                <div class="task-form__input-wrap">
                  <input
                    id="new-todo-title"
                    ref="titleInputRef"
                    v-model="newTodo.title"
                    name="title"
                    type="text"
                    autocomplete="off"
                    placeholder="O que você precisa fazer…"
                    required
                    :disabled="isAdding"
                    @input="handleTitleInput"
                    @focus="showSuggestions = true"
                    @blur="handleBlur"
                    @keydown.down.prevent="navigateSuggestions(1)"
                    @keydown.up.prevent="navigateSuggestions(-1)"
                    @keydown.enter.prevent="selectCurrentSuggestion"
                    @keydown.esc="closeSuggestions"
                    class="task-form__input"
                  />

                  <div
                    v-if="showSuggestions && filteredSuggestions.length > 0"
                    class="task-form__suggestions"
                  >
                    <button
                      v-for="(suggestion, index) in filteredSuggestions"
                      :key="suggestion.id"
                      type="button"
                      @mousedown.prevent="selectSuggestion(suggestion.title)"
                      class="task-form__suggestion"
                      :class="{ 'task-form__suggestion--active': index === selectedSuggestionIndex }"
                    >
                      <span class="task-form__suggestion-title">{{ suggestion.title }}</span>
                      <span v-if="suggestion.description" class="task-form__suggestion-desc">
                        {{ suggestion.description }}
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  class="task-form__ai"
                  @click="improveText"
                  :disabled="!newTodo.title.trim() || isImprovingText"
                  aria-label="Melhorar texto com IA"
                >
                  {{ isImprovingText ? 'Melhorando…' : 'Melhorar' }}
                </button>
              </div>
            </div>

            <div class="task-form__field">
              <span class="task-form__label">Descrição <span class="task-form__optional">(opcional)</span></span>
              <div class="task-form__editor">
                <div class="task-form__tabs" role="tablist" aria-label="Modo de edição da descrição">
                  <button
                    type="button"
                    role="tab"
                    :aria-selected="isPreviewTab"
                    @click="setTab('preview')"
                    class="task-form__tab"
                    :class="{ 'task-form__tab--active': isPreviewTab }"
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    role="tab"
                    :aria-selected="isEditTab"
                    @click="setTab('edit')"
                    class="task-form__tab"
                    :class="{ 'task-form__tab--active': isEditTab }"
                  >
                    Editar
                  </button>
                </div>

                <textarea
                  v-show="isEditTab"
                  v-model="newTodo.description"
                  aria-label="Descrição em Markdown"
                  placeholder="Detalhes, links, checklist em Markdown…"
                  rows="4"
                  :disabled="isAdding"
                  class="task-form__textarea"
                />

                <MarkdownContent
                  v-if="isPreviewTab"
                  :content="newTodo.description"
                  content-class="task-form__preview prose prose-sm dark:prose-invert max-w-none"
                />
              </div>
            </div>

            <fieldset v-if="tagStore.tags.length > 0" class="task-form__fieldset">
              <legend class="task-form__label mb-2">Tags</legend>
              <div class="task-form__chips">
                <button
                  v-for="tag in tagStore.tags"
                  :key="tag.id"
                  type="button"
                  @click="toggleTag(tag.id)"
                  class="task-form__chip border-2"
                  :class="newTodo.tagIds.includes(tag.id)
                    ? [getTagColor(tag.name).bg, getTagColor(tag.name).text, getTagColor(tag.name).border, 'task-form__chip--active']
                    : 'task-form__chip--idle'"
                >
                  {{ tag.name }}
                </button>
              </div>
            </fieldset>

            <div class="task-form__options">
              <button
                type="button"
                class="task-form__pin"
                :class="{ 'task-form__pin--active': newTodo.pinned }"
                :aria-pressed="newTodo.pinned"
                @click="newTodo.pinned = !newTodo.pinned"
              >
                Fixar no topo
              </button>
            </div>

            <button
              type="submit"
              class="task-form__submit"
              :disabled="isAdding || !newTodo.title.trim()"
            >
              {{ isAdding ? 'Adicionando…' : 'Adicionar tarefa' }}
            </button>
          </form>
        </div>

        <div class="workspace-divider" role="separator" />

        <!-- Filtros -->
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
            <label for="search-query" class="sr-only">Buscar tarefas</label>
            <div class="filters-search">
              <input
                id="search-query"
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
              aria-controls="advanced-filters"
            >
              {{ showFilters ? 'Ocultar filtros avançados' : 'Filtros avançados' }}
            </button>
          </div>

          <div
            v-show="showFilters"
            id="advanced-filters"
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
            
            <!-- Botão Exportar Selecionadas -->
            <button
              v-if="selectedTodos.length > 0"
              @click="handleExportSelectedAsTxt"
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
              @click="handleImportData"
              class="flex items-center space-x-1.5 md:space-x-2 px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs md:text-sm"
              title="Importar backup dos dados"
            >
              <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <span class="hidden sm:inline">Importar</span>
            </button>
            
            <button
              @click="handleExportData"
              class="flex items-center space-x-1.5 md:space-x-2 px-3 md:px-4 py-1.5 md:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs md:text-sm"
              title="Exportar backup dos dados"
            >
              <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <span class="hidden sm:inline">Backup</span>
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
            :selected="selectedTodos.includes(todo.id)"
            :view-mode="viewMode"
            @view="viewTodo"
            @edit="editTodo"
            @delete="deleteTodo"
            @toggle-done="toggleDone"
            @toggle-select="toggleSelectTodo"
            @toggle-pin="togglePin"
            @toggle-archive="toggleArchive"
            @update-title="updateTodoTitle"
            @move-to-top="moveToTop"
          />
        </div>
        
        <!-- Elemento sentinela para paginação infinita -->
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
    
    <!-- Modal de visualização -->
    <TodoViewModal
      v-if="viewingTodo"
      :todo="viewingTodo"
      :tags="getTodoTags(viewingTodo)"
      @close="closeViewModal"
      @edit="editTodo"
    />
    
    <!-- Modal de edição -->
    <TodoEditModal
      v-if="editingTodo"
      :todo="editingTodo"
      :all-tags="tagStore.tags"
      @save="saveEdit"
      @cancel="cancelEdit"
      @clone="cloneTodo"
    />
    
    <!-- Toasts -->
    <Toast
      v-for="toast in toasts"
      :key="toast.id"
      :message="toast.message"
      :type="toast.type"
      :duration="toast.duration"
      @close="removeToast(toast.id)"
    />
    
    <!-- Botão Scroll to Top -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-75"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-75"
    >
      <button
        v-if="showScrollToTop && !viewingTodo && !editingTodo"
        @click="scrollToTop"
        aria-label="Voltar ao topo"
        class="fixed right-4 z-40 p-3 min-h-11 min-w-11 bg-blue-600 dark:bg-blue-700 text-white rounded-full shadow-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200 hover:scale-110 focus-visible:ring-2 focus-visible:ring-blue-400 bottom-[max(5rem,calc(env(safe-area-inset-bottom)+4.5rem))] sm:right-6 sm:bottom-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
        </svg>
      </button>
    </Transition>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useTodoStore } from '../stores/todo'
import { useTagStore } from '../stores/tag'
import { getTagColor } from '../utils/colors'
import { useSuggestions } from '../composables/useSuggestions'
import { useAI } from '../composables/useAI'
import { useExport } from '../composables/useExport'
import { useTodoFilters } from '../composables/useTodoFilters'
import { useDragAndDrop } from '../composables/useDragAndDrop'
import { useToast } from '../composables/useToast'
import { useMarkdown } from '../composables/useMarkdown'
import AppLayout from '../components/AppLayout.vue'
import TodoItem from '../components/TodoItem.vue'
import TodoEditModal from '../components/TodoEditModal.vue'
import TodoViewModal from '../components/TodoViewModal.vue'
import MarkdownContent from '../components/MarkdownContent.vue'
import Toast from '../components/Toast.vue'

const todoStore = useTodoStore()
const tagStore = useTagStore()

const newTodo = ref({
  title: '',
  description: '',
  tagIds: [],
  done: false,
  pinned: false
})

const editingTodo = ref(null)
const viewingTodo = ref(null)
const todoListRef = ref(null)
const titleInputRef = ref(null)
const showForm = ref(true)
const showFilters = ref(false)
const selectedTodos = ref([])
const viewMode = ref(localStorage.getItem('todoViewMode') || 'list')
const displayLimit = ref(20)
const sentinelRef = ref(null)
const showScrollToTop = ref(false)
const isLoading = ref(true)
const isAdding = ref(false)

// Composables
const { searchQuery, selectedFilterTags, sendFrequencyFilter, filteredTodos, toggleFilterTag, setSendFrequencyFilter, clearFilters } = 
  useTodoFilters(computed(() => todoStore.sortedTodos))

const activeFilterCount = computed(() => {
  let count = 0
  if (searchQuery.value.trim()) count++
  count += selectedFilterTags.value.length
  if (sendFrequencyFilter.value !== 'all') count++
  return count
})

const hasActiveFilters = computed(() => activeFilterCount.value > 0)

// Paginação: limita quantas tarefas são exibidas
const paginatedTodos = computed(() => {
  return filteredTodos.value.slice(0, displayLimit.value)
})

// Verifica se há mais tarefas para carregar
const hasMoreTodos = computed(() => {
  return filteredTodos.value.length > displayLimit.value
})

const suggestions = useSuggestions(computed(() => todoStore.todos), computed(() => newTodo.value.title))
const { isImprovingText, improveText: aiImproveText } = useAI()
const { exportSelectedAsTxt, exportData, importData } = useExport()
const { initSortable } = useDragAndDrop(
  todoListRef, 
  viewMode, 
  paginatedTodos, 
  computed(() => todoStore.todos),
  todoStore.updateOrder
)
const { toasts, success: showSuccess, remove: removeToast } = useToast()
const { activeTab, isEditTab, isPreviewTab, setTab } = useMarkdown()

const filteredSuggestions = suggestions.filteredSuggestions
const showSuggestions = suggestions.showSuggestions
const selectedSuggestionIndex = suggestions.selectedSuggestionIndex

function setViewMode(mode) {
  viewMode.value = mode
  localStorage.setItem('todoViewMode', mode)
}

function handleTitleInput() {
  suggestions.handleInput()
}

function handleBlur() {
  suggestions.handleBlur()
}

function navigateSuggestions(direction) {
  suggestions.navigateSuggestions(direction)
}

function selectCurrentSuggestion() {
  const title = suggestions.selectCurrentSuggestion(handleAddTodo)
  if (title) {
    newTodo.value.title = title
    titleInputRef.value?.focus()
  }
}

function selectSuggestion(title) {
  newTodo.value.title = title
  showSuggestions.value = false
  titleInputRef.value?.focus()
}

function closeSuggestions() {
  suggestions.closeSuggestions()
}

async function improveText() {
  const improved = await aiImproveText(newTodo.value.title)
  if (improved) {
    newTodo.value.title = improved
  }
}

onMounted(async () => {
  isLoading.value = true
  try {
    await Promise.all([
      todoStore.fetchTodos(),
      tagStore.fetchTags()
    ])
  } finally {
    isLoading.value = false
  }
  
  await nextTick()
  initSortable()
  setupIntersectionObserver()
  setupScrollListener()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Configura listener para mostrar/ocultar botão de scroll to top
function setupScrollListener() {
  window.addEventListener('scroll', handleScroll)
}

function handleScroll() {
  showScrollToTop.value = window.scrollY > 300
}

// Rola suavemente para o topo
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// Configura o observer para paginação infinita
function setupIntersectionObserver() {
  if (!sentinelRef.value) return
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && hasMoreTodos.value) {
          loadMoreTodos()
        }
      })
    },
    {
      rootMargin: '100px' // Carrega antes de chegar ao final
    }
  )
  
  observer.observe(sentinelRef.value)
}

// Carrega mais tarefas
function loadMoreTodos() {
  displayLimit.value += 10
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
  if (!newTodo.value.title.trim() || isAdding.value) return

  isAdding.value = true
  try {
    await todoStore.addTodo({ ...newTodo.value })
    showSuccess('Tarefa adicionada com sucesso!')
    newTodo.value = {
      title: '',
      description: '',
      tagIds: [],
      done: false,
      pinned: false
    }
  } finally {
    isAdding.value = false
  }
}

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
  viewingTodo.value = null // Fecha modal de visualização se estiver aberto
  editingTodo.value = { ...todo }
}

async function saveEdit(updatedTodo) {
  await todoStore.updateTodo(updatedTodo.id, updatedTodo)
  editingTodo.value = null
  showSuccess('Tarefa atualizada com sucesso!')
}

function cancelEdit() {
  editingTodo.value = null
}

async function cloneTodo(todo) {
  try {
    const clonedTodo = await todoStore.cloneTodo(todo)
    editingTodo.value = null
    showSuccess('Tarefa clonada com sucesso!')
    
    // Opcionalmente, abrir o modal de edição para a tarefa clonada
    setTimeout(() => {
      editTodo(clonedTodo)
    }, 300)
  } catch (error) {
    console.error('Erro ao clonar tarefa:', error)
    alert('Erro ao clonar tarefa. Tente novamente.')
  }
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
  await todoStore.updateTodo(todoId, { archived: true })
}

async function updateTodoTitle(todoId, newTitle) {
  await todoStore.updateTodo(todoId, { title: newTitle })
}

async function moveToTop(todoId) {
  await todoStore.moveToTop(todoId)
}

function handleExportSelectedAsTxt() {
  exportSelectedAsTxt(selectedTodos.value, todoStore.todos)
  selectedTodos.value = []
}

function handleExportData() {
  exportData()
}

function handleImportData() {
  importData(async () => {
    await Promise.all([
      todoStore.fetchTodos(),
      tagStore.fetchTags()
    ])
  })
}
</script>

<style scoped>
.workspace-panel {
  @apply bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-5 md:mb-6 overflow-hidden;
}

.workspace-section {
  @apply p-4 md:p-6;
}

.workspace-divider {
  @apply h-px bg-gray-200 dark:bg-gray-700 mx-4 md:mx-6;
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

.workspace-toggle {
  @apply inline-flex items-center px-2.5 py-1.5 text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shrink-0;
}

.workspace-clear {
  @apply text-xs md:text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-2 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shrink-0;
}

/* Task form */
.task-form {
  @apply space-y-4 md:space-y-5;
}

.task-form__field {
  @apply space-y-1.5;
}

.task-form__label {
  @apply block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300;
}

.task-form__optional {
  @apply font-normal text-gray-400 dark:text-gray-500;
}

.task-form__title-row {
  @apply flex items-stretch gap-2;
}

.task-form__input-wrap {
  @apply relative flex-1 min-w-0;
}

.task-form__input {
  @apply w-full px-3 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60;
}

.task-form__suggestions {
  @apply absolute z-20 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto;
}

.task-form__suggestion {
  @apply w-full text-left px-3 py-2.5 text-sm border-b border-gray-100 dark:border-gray-600 last:border-b-0 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors focus-visible:outline-none focus-visible:bg-blue-50 dark:focus-visible:bg-gray-600;
}

.task-form__suggestion--active {
  @apply bg-blue-50 dark:bg-gray-600;
}

.task-form__suggestion-title {
  @apply block font-medium text-gray-800 dark:text-gray-100;
}

.task-form__suggestion-desc {
  @apply block text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5;
}

.task-form__ai {
  @apply inline-flex items-center justify-center shrink-0 px-3 py-2.5 text-xs md:text-sm font-medium rounded-lg border border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-40 disabled:cursor-not-allowed;
}

.task-form__editor {
  @apply rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden bg-gray-50 dark:bg-gray-700/50;
}

.task-form__tabs {
  @apply flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600;
}

.task-form__tab {
  @apply flex-1 px-3 py-1.5 text-xs md:text-sm font-medium rounded-md text-gray-500 dark:text-gray-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500;
}

.task-form__tab--active {
  @apply bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm;
}

.task-form__textarea {
  @apply w-full px-3 md:px-4 py-3 text-base bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 resize-y min-h-[6rem] max-h-48 overflow-y-auto focus:outline-none disabled:opacity-60;
}

.task-form__preview {
  @apply px-3 md:px-4 py-3 min-h-[6rem] max-h-48 overflow-y-auto text-sm md:text-base;
}

.task-form__fieldset {
  @apply border-0 p-0 m-0;
}

.task-form__chips {
  @apply flex flex-wrap gap-1.5 md:gap-2;
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

.task-form__options {
  @apply flex flex-wrap gap-2;
}

.task-form__pin {
  @apply inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500;
}

.task-form__pin--active {
  @apply border-yellow-400 dark:border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400;
}

.task-form__submit {
  @apply w-full py-2.5 px-4 rounded-lg text-sm md:text-base font-semibold text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed;
}

/* Filters */
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
