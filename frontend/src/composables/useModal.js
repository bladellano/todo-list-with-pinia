import { onMounted, onUnmounted, ref } from 'vue'
import { onKeyStroke } from '@vueuse/core'

let lockCount = 0
let previousOverflow = ''

function lockBodyScroll() {
  if (lockCount === 0) {
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  lockCount += 1
}

function unlockBodyScroll() {
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount === 0) {
    document.body.style.overflow = previousOverflow
  }
}

export function useModal(onClose) {
  const modalRef = ref(null)

  onKeyStroke('Escape', (e) => {
    e.preventDefault()
    onClose()
  })

  function trapFocus(e) {
    if (e.key !== 'Tab' || !modalRef.value) return

    const focusable = modalRef.value.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  onMounted(() => {
    lockBodyScroll()
    const focusable = modalRef.value?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    focusable?.focus()
    document.addEventListener('keydown', trapFocus)
  })

  onUnmounted(() => {
    unlockBodyScroll()
    document.removeEventListener('keydown', trapFocus)
  })

  return { modalRef }
}
