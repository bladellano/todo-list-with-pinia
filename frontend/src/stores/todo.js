import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`

export const useTodoStore = defineStore('todo', () => {
  const todos = ref([])
  const customOrder = ref([])

  const sortedTodos = computed(() => {
    let result = []
    
    if (customOrder.value.length === 0) {
      // Ordenação padrão por data de criação (DESC)
      result = [...todos.value].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      )
    } else {
      // Ordenação personalizada
      const orderedTodos = []
      const todoMap = new Map(todos.value.map(t => [t.id, t]))
      
      customOrder.value.forEach(id => {
        if (todoMap.has(id)) {
          orderedTodos.push(todoMap.get(id))
          todoMap.delete(id)
        }
      })
      
      // Adicionar todos que não estão na ordem personalizada
      todoMap.forEach(todo => orderedTodos.push(todo))
      
      result = orderedTodos
    }
    
    // Separar pinned e não pinned, mantendo ordem
    const pinned = result.filter(t => t.pinned)
    const notPinned = result.filter(t => !t.pinned)
    
    return [...pinned, ...notPinned]
  })

  async function fetchTodos() {
    try {
      const response = await fetch(`${API_URL}/todos`)
      todos.value = await response.json()
      
      // Buscar ordem personalizada
      const orderResponse = await fetch(`${API_URL}/todos/order`)
      customOrder.value = await orderResponse.json()
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error)
    }
  }

  async function addTodo(todo) {
    try {
      const response = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todo)
      })
      const newTodo = await response.json()
      todos.value.push(newTodo)
      return newTodo
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error)
    }
  }

  async function updateTodo(id, updates) {
    try {
      // Se estiver marcando como concluída, adiciona a data
      if (updates.done === true) {
        updates.completedAt = new Date().toISOString()
      } else if (updates.done === false) {
        updates.completedAt = null
      }
      
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const updatedTodo = await response.json()
      
      const index = todos.value.findIndex(t => t.id === id)
      if (index !== -1) {
        todos.value[index] = updatedTodo
      }
      
      return updatedTodo
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error)
    }
  }

  async function deleteTodo(id) {
    try {
      await fetch(`${API_URL}/todos/${id}`, { method: 'DELETE' })
      todos.value = todos.value.filter(t => t.id !== id)
      customOrder.value = customOrder.value.filter(todoId => todoId !== id)
      await saveOrder()
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error)
    }
  }

  async function updateOrder(newOrder) {
    customOrder.value = newOrder
    await saveOrder()
  }

  async function saveOrder() {
    try {
      await fetch(`${API_URL}/todos/order`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: customOrder.value })
      })
    } catch (error) {
      console.error('Erro ao salvar ordem:', error)
    }
  }

  return {
    todos,
    sortedTodos,
    customOrder,
    fetchTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    updateOrder
  }
})
