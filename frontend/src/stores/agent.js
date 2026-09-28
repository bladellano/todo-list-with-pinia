import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiFetch } from '../utils/api'

export const useAgentStore = defineStore('agent', () => {
  const agents = ref([])

  async function fetchAgents() {
    try {
      const response = await apiFetch('/agents')
      agents.value = await response.json()
    } catch (error) {
      console.error('Erro ao buscar agents:', error)
    }
  }

  async function addAgent(agent) {
    try {
      const response = await apiFetch('/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agent)
      })
      const newAgent = await response.json()
      agents.value.push(newAgent)
      return newAgent
    } catch (error) {
      console.error('Erro ao adicionar agent:', error)
      throw error
    }
  }

  async function updateAgent(id, updates) {
    try {
      const response = await apiFetch(`/agents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const updated = await response.json()
      const index = agents.value.findIndex((a) => a.id === id)
      if (index !== -1) {
        agents.value[index] = updated
      }
      return updated
    } catch (error) {
      console.error('Erro ao atualizar agent:', error)
      throw error
    }
  }

  async function deleteAgent(id) {
    try {
      await apiFetch(`/agents/${id}`, { method: 'DELETE' })
      agents.value = agents.value.filter((a) => a.id !== id)
    } catch (error) {
      console.error('Erro ao deletar agent:', error)
      throw error
    }
  }

  return {
    agents,
    fetchAgents,
    addAgent,
    updateAgent,
    deleteAgent
  }
})
