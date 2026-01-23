<template>
  <AppLayout>
    <div class="max-w-4xl mx-auto">
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-4">Configuração de Tags</h1>
        
        <!-- Formulário para adicionar tag -->
        <form @submit.prevent="handleAddTag" class="flex space-x-2">
          <input
            v-model="newTagName"
            type="text"
            placeholder="Nome da nova tag..."
            required
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Adicionar
          </button>
        </form>
      </div>
      
      <!-- Lista de tags -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">
          Tags Cadastradas ({{ tagStore.tags.length }})
        </h2>
        
        <div v-if="tagStore.tags.length === 0" class="text-center py-8 text-gray-500">
          Nenhuma tag cadastrada. Adicione uma nova tag acima!
        </div>
        
        <div class="space-y-2">
          <div
            v-for="tag in tagStore.tags"
            :key="tag.id"
            class="flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition"
          >
            <div class="flex items-center space-x-3">
              <span
                v-if="!editingTagId || editingTagId !== tag.id"
                class="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium"
              >
                {{ tag.name }}
              </span>
              
              <input
                v-else
                v-model="editingTagName"
                @keyup.enter="saveTagEdit(tag.id)"
                @keyup.esc="cancelEdit"
                class="px-4 py-2 border border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autofocus
              />
            </div>
            
            <div class="flex space-x-2">
              <button
                v-if="!editingTagId || editingTagId !== tag.id"
                @click="startEdit(tag)"
                class="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                title="Editar"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
              
              <template v-else>
                <button
                  @click="saveTagEdit(tag.id)"
                  class="p-2 text-green-600 hover:bg-green-50 rounded transition"
                  title="Salvar"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </button>
                
                <button
                  @click="cancelEdit"
                  class="p-2 text-gray-600 hover:bg-gray-200 rounded transition"
                  title="Cancelar"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </template>
              
              <button
                @click="deleteTag(tag.id)"
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
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTagStore } from '../stores/tag'
import AppLayout from '../components/AppLayout.vue'

const tagStore = useTagStore()

const newTagName = ref('')
const editingTagId = ref(null)
const editingTagName = ref('')

onMounted(() => {
  tagStore.fetchTags()
})

async function handleAddTag() {
  if (newTagName.value.trim()) {
    await tagStore.addTag({ name: newTagName.value.trim() })
    newTagName.value = ''
  }
}

function startEdit(tag) {
  editingTagId.value = tag.id
  editingTagName.value = tag.name
}

async function saveTagEdit(id) {
  if (editingTagName.value.trim()) {
    await tagStore.updateTag(id, { name: editingTagName.value.trim() })
    cancelEdit()
  }
}

function cancelEdit() {
  editingTagId.value = null
  editingTagName.value = ''
}

async function deleteTag(id) {
  if (confirm('Tem certeza que deseja excluir esta tag?')) {
    await tagStore.deleteTag(id)
  }
}
</script>
