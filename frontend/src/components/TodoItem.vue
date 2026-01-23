<template>
  <div
    class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-move"
    :class="{ 'opacity-60': todo.done }"
  >
    <div class="flex items-start space-x-3">
      <!-- Drag handle -->
      <div class="drag-handle cursor-move pt-1">
        <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
        </svg>
      </div>
      
      <!-- Checkbox -->
      <div class="pt-1">
        <input
          type="checkbox"
          :checked="todo.done"
          @change="$emit('toggle-done', todo)"
          class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <!-- Conteúdo -->
      <div class="flex-1">
        <h3
          class="font-semibold text-gray-800"
          :class="{ 'line-through': todo.done }"
        >
          {{ todo.title }}
        </h3>
        
        <p
          v-if="todo.description"
          class="text-sm text-gray-600 mt-1"
          :class="{ 'line-through': todo.done }"
        >
          {{ todo.description }}
        </p>
        
        <div v-if="tags.length > 0" class="flex flex-wrap gap-1 mt-2">
          <span
            v-for="tag in tags"
            :key="tag.id"
            class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
          >
            {{ tag.name }}
          </span>
        </div>
        
        <div class="text-xs text-gray-400 mt-2">
          <div>Criada: {{ formatDate(todo.createdAt) }}</div>
          <div v-if="todo.done && todo.completedAt" class="text-green-600 font-medium mt-1">
            ✓ Concluída: {{ formatDate(todo.completedAt) }}
          </div>
        </div>
      </div>
      
      <!-- Ações -->
      <div class="flex space-x-2">
        <button
          @click="$emit('edit', todo)"
          class="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
          title="Editar"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
        </button>
        
        <button
          @click="$emit('delete', todo.id)"
          class="p-2 text-red-600 hover:bg-red-50 rounded transition"
          title="Excluir"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  todo: {
    type: Object,
    required: true
  },
  tags: {
    type: Array,
    default: () => []
  }
})

defineEmits(['edit', 'delete', 'toggle-done'])

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
