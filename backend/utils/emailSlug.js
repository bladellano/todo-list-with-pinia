/**
 * Slug estável para deduplicação de tarefas criadas via e-mail (n8n / Gmail).
 */
export function normalizeEmailSlug(value) {
  if (value == null || typeof value !== 'string') {
    return ''
  }

  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const CREATE_TODO_PREFIX = /^create-todo\s*/i

/**
 * Extrai título bruto do assunto após o prefixo create-todo.
 * @returns {string|null} null se ausente ou só o prefixo
 */
export function parseCreateTodoSubject(subject) {
  if (typeof subject !== 'string' || !CREATE_TODO_PREFIX.test(subject)) {
    return null
  }

  const title = subject.replace(CREATE_TODO_PREFIX, '').trim()
  return title.length > 0 ? title : null
}