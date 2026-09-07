import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiFetch } from '../utils/api'

export const useTodoStore = defineStore('todo', () => {
  const todos = ref([])
  const customOrder = ref([])

  const sortedTodos = computed(() => {
    let result = []
    
    if (customOrder.value.length === 0) {
      result = [...todos.value].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      )
    } else {
      const orderedTodos = []
      const todoMap = new Map(todos.value.map(t => [t.id, t]))
      
      customOrder.value.forEach(id => {
        if (todoMap.has(id)) {
          orderedTodos.push(todoMap.get(id))
          todoMap.delete(id)
        }
      })
      
      todoMap.forEach(todo => orderedTodos.push(todo))
      result = orderedTodos
    }
    
    const pinned = result.filter(t => t.pinned)
    const notPinned = result.filter(t => !t.pinned)
    
    return [...pinned, ...notPinned]
  })

  async function fetchTodos() {
    try {
      const response = await apiFetch('/todos')
      todos.value = await response.json()
      
      const orderResponse = await apiFetch('/todos/order')
      customOrder.value = await orderResponse.json()
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error)
    }
  }

  async function addTodo(todo) {
    try {
      const response = await apiFetch('/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todo)
      })
      const newTodo = await response.json()
      todos.value.push(newTodo)

      if (newTodo.pinned) {
        await prependToOrder(newTodo.id)
      }

      return newTodo
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error)
    }
  }

  async function updateTodo(id, updates) {
    try {
      if (updates.done === true) {
        updates.completedAt = new Date().toISOString()
      } else if (updates.done === false) {
        updates.completedAt = null
      }
      
      const response = await apiFetch(`/todos/${id}`, {
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
      await apiFetch(`/todos/${id}`, { method: 'DELETE' })
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
      await apiFetch('/todos/order', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: customOrder.value })
      })
    } catch (error) {
      console.error('Erro ao salvar ordem:', error)
    }
  }

  async function prependToOrder(id) {
    if (customOrder.value.length === 0) {
      customOrder.value = todos.value.map(t => t.id)
    }

    customOrder.value = customOrder.value.filter(todoId => todoId !== id)
    customOrder.value.unshift(id)
    await saveOrder()
  }

  async function moveToTop(id) {
    try {
      await updateTodo(id, { pinned: true })
      await prependToOrder(id)
    } catch (error) {
      console.error('Erro ao mover para o topo:', error)
    }
  }

  async function cloneTodo(todo) {
    try {
      const clonedTodo = {
        title: `${todo.title} (Cópia)`,
        description: todo.description || '',
        tagIds: [...(todo.tagIds || [])],
        done: false,
        pinned: todo.pinned || false,
        notificable: todo.notificable || false,
        archived: false
      }
      
      const response = await apiFetch('/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clonedTodo)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const newTodo = await response.json()
      todos.value.push(newTodo)

      if (newTodo.pinned) {
        await prependToOrder(newTodo.id)
      }

      return newTodo
    } catch (error) {
      console.error('Erro ao clonar tarefa:', error)
      throw error
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
    updateOrder,
    moveToTop,
    cloneTodo
  }
})
