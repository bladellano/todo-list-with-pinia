<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">Editar Tarefa</h2>
      
      <form @submit.prevent="handleSave" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Título
          </label>
          <input
            v-model="editForm.title"
            type="text"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Descrição
          </label>
          <textarea
            v-model="editForm.description"
            rows="3"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="tag in allTags"
              :key="tag.id"
              type="button"
              @click="toggleTag(tag.id)"
              class="px-3 py-1 rounded-full text-sm transition border-2"
              :class="editForm.tagIds.includes(tag.id) 
                ? [getTagColor(tag.name).bg, getTagColor(tag.name).text, getTagColor(tag.name).border, 'font-medium']
                : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'"
            >
              {{ tag.name }}
            </button>
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <input
            v-model="editForm.done"
            type="checkbox"
            id="done-checkbox"
            class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label for="done-checkbox" class="text-sm font-medium text-gray-700">
            Tarefa concluída
          </label>
        </div>
        
        <div class="flex items-center space-x-2">
          <input
            v-model="editForm.notificable"
            type="checkbox"
            id="notificable-checkbox"
            class="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
          />
          <label for="notificable-checkbox" class="text-sm font-medium text-gray-700">
            Habilitar notificações (n8n)
          </label>
        </div>
        
        <div class="flex space-x-3 pt-4">
          <button
            type="submit"
            class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            Salvar
          </button>
          <button
            type="button"
            @click="$emit('cancel')"
            class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getTagColor } from '../utils/colors'

const props = defineProps({
  todo: {
    type: Object,
    required: true
  },
  allTags: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['save', 'cancel'])

const editForm = ref({
  id: props.todo.id,
  title: props.todo.title,
  description: props.todo.description || '',
  tagIds: props.todo.tagIds || [],
  done: props.todo.done || false,
  notificable: props.todo.notificable || false
})

function toggleTag(tagId) {
  const index = editForm.value.tagIds.indexOf(tagId)
  if (index > -1) {
    editForm.value.tagIds.splice(index, 1)
  } else {
    editForm.value.tagIds.push(tagId)
  }
}

function handleSave() {
  emit('save', editForm.value)
}
</script>
