import { defineStore } from 'pinia'
import { ref } from 'vue'

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`

export const useTagStore = defineStore('tag', () => {
  const tags = ref([])

  async function fetchTags() {
    try {
      const response = await fetch(`${API_URL}/tags`)
      tags.value = await response.json()
    } catch (error) {
      console.error('Erro ao buscar tags:', error)
    }
  }

  async function addTag(tag) {
    try {
      const response = await fetch(`${API_URL}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tag)
      })
      const newTag = await response.json()
      tags.value.push(newTag)
      return newTag
    } catch (error) {
      console.error('Erro ao adicionar tag:', error)
    }
  }

  async function updateTag(id, updates) {
    try {
      const response = await fetch(`${API_URL}/tags/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const updatedTag = await response.json()
      
      const index = tags.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tags.value[index] = updatedTag
      }
      
      return updatedTag
    } catch (error) {
      console.error('Erro ao atualizar tag:', error)
    }
  }

  async function deleteTag(id) {
    try {
      await fetch(`${API_URL}/tags/${id}`, { method: 'DELETE' })
      tags.value = tags.value.filter(t => t.id !== id)
    } catch (error) {
      console.error('Erro ao deletar tag:', error)
    }
  }

  return {
    tags,
    fetchTags,
    addTag,
    updateTag,
    deleteTag
  }
})
