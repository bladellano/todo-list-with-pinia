<template>
  <button
    type="button"
    :disabled="disabled || loading"
    :aria-label="ariaLabel"
    :title="ariaLabel"
    class="inline-flex items-center justify-center shrink-0 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 min-h-11 px-2.5 text-xs font-semibold tracking-wide md:min-h-0 md:px-2 md:py-2 border"
    :class="disabled || loading
      ? 'border-gray-200 dark:border-gray-600 bg-transparent text-gray-400 cursor-not-allowed'
      : 'border-amber-200/70 dark:border-amber-800/50 bg-amber-50/40 dark:bg-amber-950/20 text-amber-700/90 dark:text-amber-400/85 hover:bg-amber-50 dark:hover:bg-amber-900/25 hover:border-amber-300/80 dark:hover:border-amber-700/60'"
    @click="$emit('click')"
  >
    <svg
      v-if="loading"
      class="w-3.5 h-3.5 animate-spin opacity-70"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    <span v-else>IA</span>
  </button>
</template>

<script setup>
defineProps({
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  ariaLabel: { type: String, default: 'Sugestão com IA' }
})

defineEmits(['click'])
</script>
