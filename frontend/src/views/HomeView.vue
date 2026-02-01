<template>
  <AppLayout>
    <div class="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1920px]">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 mb-4 md:mb-6 transition-colors">
        <div class="flex items-center justify-between cursor-pointer mb-4" @click="showForm = !showForm">
          <h1 class="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100">Tarefas</h1>
          <button
            type="button"
            class="p-1 text-gray-600 hover:text-gray-800 transition"
            :title="showForm ? 'Recolher formulário' : 'Expandir formulário'"
          >
            <svg 
              class="w-5 h-5 transition-transform duration-200" 
              :class="{ 'rotate-180': showForm }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>
        
        <!-- Formulário para adicionar tarefa -->
        <form v-show="showForm" @submit.prevent="handleAddTodo" class="space-y-4">
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
          
          <!-- Campo de Descrição com Markdown -->
          <div>
            <!-- Abas -->
            <div class="flex border-b border-gray-200 dark:border-gray-600 mb-2">
              <button
                type="button"
                @click="setTab('preview')"
                class="px-3 md:px-4 py-2 text-xs md:text-sm font-medium transition-colors border-b-2"
                :class="isPreviewTab 
                  ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400' 
                  : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'"
              >
                Preview
              </button>
              <button
                type="button"
                @click="setTab('edit')"
                class="px-3 md:px-4 py-2 text-xs md:text-sm font-medium transition-colors border-b-2"
                :class="isEditTab 
                  ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400' 
                  : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'"
              >
                Editar
              </button>
            </div>
            
            <!-- Editor -->
            <textarea
              v-show="isEditTab"
              v-model="newTodo.description"
              placeholder="Descrição em Markdown (opcional)..."
              rows="4"
              class="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
            />
            
            <!-- Preview -->
            <div
              v-show="isPreviewTab"
              class="w-full min-h-[100px] px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 prose prose-sm dark:prose-invert max-w-none"
              v-html="renderMarkdown(newTodo.description)"
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
          
          <!-- Opção de pinar -->
          <div class="flex items-center space-x-2">
            <input
              id="pin-new-todo"
              v-model="newTodo.pinned"
              type="checkbox"
              class="w-4 h-4 text-yellow-600 rounded focus:ring-2 focus:ring-yellow-500"
            />
            <label for="pin-new-todo" class="text-sm md:text-base text-gray-700 dark:text-gray-300 cursor-pointer flex items-center space-x-1">
              <svg class="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 16 16">
                <path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a5.927 5.927 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707-.195-.195.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a5.922 5.922 0 0 1 1.013.16l3.134-3.133a2.772 2.772 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146z"/>
              </svg>
              <span>Fixar no topo</span>
            </label>
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
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4': viewMode === 'grid-3',
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4': viewMode === 'grid-4',
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 md:gap-3': viewMode === 'grid-5',
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-2 md:gap-3': viewMode === 'grid-6',
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-7 gap-2': viewMode === 'grid-7',
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-2': viewMode === 'grid-8'
          }"
        >
          <TodoItem
            v-for="todo in filteredTodos"
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
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
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
import Toast from '../components/Toast.vue'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
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

// Composables
const { searchQuery, selectedFilterTags, filteredTodos, toggleFilterTag, clearFilters } = 
  useTodoFilters(computed(() => todoStore.sortedTodos))

const suggestions = useSuggestions(computed(() => todoStore.todos), computed(() => newTodo.value.title))
const { isImprovingText, improveText: aiImproveText } = useAI()
const { exportSelectedAsTxt, exportData, importData } = useExport()
const { initSortable } = useDragAndDrop(
  todoListRef, 
  viewMode, 
  filteredTodos, 
  computed(() => todoStore.todos),
  todoStore.updateOrder
)
const { toasts, success: showSuccess, remove: removeToast } = useToast()
const { activeTab, isEditTab, isPreviewTab, setTab, renderMarkdown } = useMarkdown()

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
  const improved = await aiImproveText(newTodo.value.title, API_URL)
  if (improved) {
    newTodo.value.title = improved
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
    
    showSuccess('Tarefa adicionada com sucesso!')
    
    newTodo.value = {
      title: '',
      description: '',
      tagIds: [],
      done: false,
      pinned: false
    }
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
  exportData(API_URL)
}

function handleImportData() {
  importData(API_URL, async () => {
    await Promise.all([
      todoStore.fetchTodos(),
      tagStore.fetchTags()
    ])
  })
}
</script>
