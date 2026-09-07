<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black bg-opacity-50 overscroll-none"
      @click.self="emit('close')"
    >
      <div
        ref="modalRef"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="labelledBy"
        class="flex flex-col min-h-0 w-full max-h-[100dvh] sm:max-h-[min(90dvh,100%)] bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-lg shadow-xl overflow-hidden transition-colors"
        :class="maxWidthClass"
      >
        <header
          v-if="slots.header"
          class="shrink-0 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 sm:px-6 sm:pt-4 sm:pb-4 border-b border-gray-200 dark:border-gray-700"
        >
          <slot name="header" />
        </header>

        <div class="min-h-0 flex-1 overflow-y-auto overflow-x-auto overscroll-contain px-4 py-4 sm:px-6">
          <slot />
        </div>

        <footer
          v-if="slots.footer"
          class="shrink-0 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        >
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useSlots } from 'vue'
import { useModal } from '../composables/useModal'

defineProps({
  labelledBy: {
    type: String,
    default: undefined
  },
  maxWidthClass: {
    type: String,
    default: 'sm:max-w-2xl'
  }
})

const emit = defineEmits(['close'])
const slots = useSlots()
const { modalRef } = useModal(() => emit('close'))
</script>
