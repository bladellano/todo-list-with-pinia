import { ref, computed } from 'vue'

export function useTodoFilters(todos) {
  const searchQuery = ref('')
  const selectedFilterTags = ref([])

  const filteredTodos = computed(() => {
    let result = todos.value.filter(todo => !todo.archived)
    
    // Filtro por busca
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(todo => 
        todo.title.toLowerCase().includes(query) ||
        (todo.description && todo.description.toLowerCase().includes(query))
      )
    }
    
    // Filtro por tags (AND - todas as tags devem estar presentes)
    if (selectedFilterTags.value.length > 0) {
      result = result.filter(todo => {
        if (!todo.tagIds || todo.tagIds.length === 0) return false
        return selectedFilterTags.value.every(tagId => todo.tagIds.includes(tagId))
      })
    }
    
    return result
  })

  const toggleFilterTag = (tagId) => {
    const index = selectedFilterTags.value.indexOf(tagId)
    if (index > -1) {
      selectedFilterTags.value.splice(index, 1)
    } else {
      selectedFilterTags.value.push(tagId)
    }
  }

  const clearFilters = () => {
    searchQuery.value = ''
    selectedFilterTags.value = []
  }

  return {
    searchQuery,
    selectedFilterTags,
    filteredTodos,
    toggleFilterTag,
    clearFilters
  }
}
