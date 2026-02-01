<template>
  <div class="space-y-2">
    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
      {{ label }}
    </label>
    
    <div 
      class="flex flex-wrap items-center gap-2 px-3 py-2 border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-colors"
      :class="[
        error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600',
        'bg-white dark:bg-gray-700'
      ]"
      @click="$refs.input?.focus()"
    >
      <!-- E-mails adicionados -->
      <div
        v-for="(email, index) in emails"
        :key="index"
        class="flex items-center space-x-1 px-2 py-1 bg-blue-500 text-white text-sm rounded-md"
      >
        <span>{{ email }}</span>
        <button
          type="button"
          @click.stop="removeEmail(index)"
          class="hover:bg-blue-600 rounded-full p-0.5 transition"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <!-- Input -->
      <input
        ref="input"
        :value="inputValue"
        @input="handleInput($event.target.value)"
        @keydown="handleKeydown"
        type="text"
        :placeholder="emails.length === 0 ? placeholder : ''"
        class="flex-1 min-w-[120px] outline-none bg-transparent text-sm text-gray-900 dark:text-gray-100"
      />
    </div>
    
    <!-- Erro -->
    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
    
    <!-- Dica -->
    <p class="text-xs text-gray-500 dark:text-gray-400">
      {{ hint }}
    </p>
  </div>
</template>

<script setup>
import { toRefs } from 'vue'
import { useEmailInput } from '../composables/useEmailInput'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  label: {
    type: String,
    default: 'Destinatários'
  },
  placeholder: {
    type: String,
    default: 'Digite um e-mail e pressione Enter'
  },
  hint: {
    type: String,
    default: 'Separe múltiplos e-mails com ; ou pressione Enter/Tab'
  }
})

const emit = defineEmits(['update:modelValue'])

const emailInput = useEmailInput(props.modelValue)
const { emails, inputValue, error } = toRefs(emailInput)

function handleInput(value) {
  emailInput.handleInput(value)
  emit('update:modelValue', emails.value)
}

function handleKeydown(event) {
  emailInput.handleKeydown(event)
  emit('update:modelValue', emails.value)
}

function removeEmail(index) {
  emailInput.removeEmail(index)
  emit('update:modelValue', emails.value)
}
</script>
