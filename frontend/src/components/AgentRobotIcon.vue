<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    class="shrink-0 opacity-55"
    :class="sizeClass"
  >
    <path
      d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7v1h-1.5a4.5 4.5 0 0 1-4.5 4.5h-7A4.5 4.5 0 0 1 5.5 16H4v-1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 12 2ZM9 11.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"
    />
  </svg>
</template>

<script setup>
defineProps({
  sizeClass: {
    type: String,
    default: 'w-3.5 h-3.5'
  }
})
</script>
