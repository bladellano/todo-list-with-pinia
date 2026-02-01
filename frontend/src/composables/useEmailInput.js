import { ref } from 'vue'

export function useEmailInput(initialEmails = []) {
  const emails = ref([...initialEmails])
  const inputValue = ref('')
  const error = ref('')

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
  }

  function addEmail(email) {
    const trimmedEmail = email.trim()
    
    if (!trimmedEmail) return
    
    if (!isValidEmail(trimmedEmail)) {
      error.value = 'E-mail inválido'
      return
    }
    
    if (emails.value.includes(trimmedEmail)) {
      error.value = 'E-mail já adicionado'
      return
    }
    
    emails.value.push(trimmedEmail)
    error.value = ''
    inputValue.value = ''
  }

  function removeEmail(index) {
    emails.value.splice(index, 1)
  }

  function handleInput(value) {
    inputValue.value = value
    error.value = ''
    
    // Detectar separadores (;) e adicionar e-mails automaticamente
    if (value.includes(';')) {
      const parts = value.split(';')
      parts.slice(0, -1).forEach(email => addEmail(email))
      inputValue.value = parts[parts.length - 1]
    }
  }

  function handleKeydown(event) {
    // Enter ou Tab: adicionar e-mail
    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault()
      if (inputValue.value.trim()) {
        addEmail(inputValue.value)
      }
    }
    
    // Backspace: remover último e-mail se input estiver vazio
    if (event.key === 'Backspace' && !inputValue.value && emails.value.length > 0) {
      removeEmail(emails.value.length - 1)
    }
  }

  function clearAll() {
    emails.value = []
    inputValue.value = ''
    error.value = ''
  }

  return {
    emails,
    inputValue,
    error,
    addEmail,
    removeEmail,
    handleInput,
    handleKeydown,
    clearAll
  }
}
