import { ref, computed } from 'vue'

export function useSuggestions(todos, inputValue) {
  const showSuggestions = ref(false)
  const selectedSuggestionIndex = ref(-1)

  const filteredSuggestions = computed(() => {
    const input = inputValue.value.trim().toLowerCase()
    if (input.length < 2) return []
    
    return todos.value
      .filter(todo => !todo.archived && todo.title.toLowerCase().includes(input))
      .slice(0, 5)
  })

  const handleInput = () => {
    showSuggestions.value = true
    selectedSuggestionIndex.value = -1
  }

  const handleBlur = () => {
    setTimeout(() => {
      showSuggestions.value = false
      selectedSuggestionIndex.value = -1
    }, 200)
  }

  const navigateSuggestions = (direction) => {
    if (filteredSuggestions.value.length === 0) return
    
    const newIndex = selectedSuggestionIndex.value + direction
    
    if (newIndex < -1) {
      selectedSuggestionIndex.value = filteredSuggestions.value.length - 1
    } else if (newIndex >= filteredSuggestions.value.length) {
      selectedSuggestionIndex.value = -1
    } else {
      selectedSuggestionIndex.value = newIndex
    }
  }

  const selectSuggestion = (title) => {
    showSuggestions.value = false
    selectedSuggestionIndex.value = -1
    return title
  }

  const closeSuggestions = () => {
    showSuggestions.value = false
    selectedSuggestionIndex.value = -1
  }

  const selectCurrentSuggestion = (onSubmit) => {
    if (selectedSuggestionIndex.value >= 0 && selectedSuggestionIndex.value < filteredSuggestions.value.length) {
      return filteredSuggestions.value[selectedSuggestionIndex.value].title
    }
    onSubmit()
    return null
  }

  return {
    showSuggestions,
    selectedSuggestionIndex,
    filteredSuggestions,
    handleInput,
    handleBlur,
    navigateSuggestions,
    selectSuggestion,
    closeSuggestions,
    selectCurrentSuggestion
  }
}
