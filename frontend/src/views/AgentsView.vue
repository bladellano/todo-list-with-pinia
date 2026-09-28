<template>
  <AppLayout>
    <div class="max-w-4xl mx-auto px-4 md:px-0">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 mb-4 md:mb-6 transition-colors">
        <h1 class="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 text-pretty">
          Agents (disparo diário)
        </h1>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          O n8n consulta
          <code class="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">GET /api/external/agent-dispatch</code>
          com a mesma API Key dos outros endpoints externos.
        </p>

        <form class="space-y-4" @submit.prevent="handleSave">
          <div>
            <label for="agent-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
            <input
              id="agent-name"
              v-model="form.name"
              type="text"
              required
              autocomplete="off"
              placeholder="Ex.: Revisão semanal de pendências"
              class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label for="agent-prompt" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Instruções (markdown)
            </label>
            <textarea
              id="agent-prompt"
              v-model="form.prompt"
              rows="8"
              placeholder="# Objetivo&#10;Analise as tarefas abaixo e..."
              class="w-full px-3 py-2 text-sm font-mono border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <fieldset>
            <legend class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dias da semana</legend>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="px-3 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                @click="setAllDays(true)"
              >
                Todos
              </button>
              <button
                type="button"
                class="px-3 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                @click="setAllDays(false)"
              >
                Nenhum
              </button>
            </div>
            <div class="mt-2 flex flex-wrap gap-2">
              <label
                v-for="day in dayOptions"
                :key="day.key"
                class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors"
                :class="form.schedule[day.key]
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'"
              >
                <input
                  v-model="form.schedule[day.key]"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {{ day.label }}
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tarefas vinculadas ({{ form.todoIds.length }})
            </legend>
            <p v-if="activeTodos.length === 0" class="text-sm text-gray-500 dark:text-gray-400">
              Nenhuma tarefa ativa. Crie tarefas na página inicial.
            </p>
            <div v-else class="max-h-48 overflow-y-auto space-y-1 border border-gray-200 dark:border-gray-600 rounded-lg p-2">
              <label
                v-for="todo in activeTodos"
                :key="todo.id"
                class="flex items-start gap-2 px-2 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  :value="todo.id"
                  v-model="form.todoIds"
                  class="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="text-gray-800 dark:text-gray-100">{{ todo.title }}</span>
              </label>
            </div>
          </fieldset>

          <label class="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input v-model="form.enabled" type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            Agent ativo (participa do disparo nos dias marcados)
          </label>

          <div class="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              class="px-4 py-2 text-sm bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 font-medium"
            >
              {{ editingId ? 'Salvar alterações' : 'Criar agent' }}
            </button>
            <button
              v-if="editingId"
              type="button"
              class="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              @click="resetForm"
            >
              Cancelar edição
            </button>
          </div>
        </form>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 transition-colors">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Agents cadastrados ({{ agentStore.agents.length }})
        </h2>

        <div v-if="agentStore.agents.length === 0" class="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
          Nenhum agent ainda.
        </div>

        <div class="space-y-3">
          <article
            v-for="agent in agentStore.agents"
            :key="agent.id"
            class="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
          >
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-gray-100">{{ agent.name }}</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{ scheduleSummary(agent.schedule) }} · {{ agent.todoIds?.length || 0 }} tarefa(s)
                </p>
              </div>
              <span
                class="text-xs px-2 py-1 rounded-full"
                :class="agent.enabled
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'"
              >
                {{ agent.enabled ? 'Ativo' : 'Inativo' }}
              </span>
            </div>

            <pre
              v-if="agent.prompt"
              class="mt-3 text-xs whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-900/50 p-3 rounded max-h-32 overflow-y-auto text-gray-700 dark:text-gray-300"
            >{{ agent.prompt }}</pre>

            <div class="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                class="px-3 py-1.5 text-xs rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                @click="startEdit(agent)"
              >
                Editar
              </button>
              <button
                type="button"
                class="px-3 py-1.5 text-xs rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                @click="removeAgent(agent.id)"
              >
                Excluir
              </button>
            </div>
          </article>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import AppLayout from '../components/AppLayout.vue'
import { useAgentStore } from '../stores/agent'
import { useTodoStore } from '../stores/todo'

const agentStore = useAgentStore()
const todoStore = useTodoStore()

const editingId = ref(null)

const dayOptions = [
  { key: 'sun', label: 'Dom' },
  { key: 'mon', label: 'Seg' },
  { key: 'tue', label: 'Ter' },
  { key: 'wed', label: 'Qua' },
  { key: 'thu', label: 'Qui' },
  { key: 'fri', label: 'Sex' },
  { key: 'sat', label: 'Sáb' }
]

function emptySchedule() {
  return Object.fromEntries(dayOptions.map((d) => [d.key, false]))
}

const form = reactive({
  name: '',
  prompt: '',
  enabled: false,
  schedule: emptySchedule(),
  todoIds: []
})

const activeTodos = computed(() =>
  todoStore.todos.filter((t) => !t.archived)
)

onMounted(async () => {
  await Promise.all([agentStore.fetchAgents(), todoStore.fetchTodos()])
})

function setAllDays(value) {
  for (const day of dayOptions) {
    form.schedule[day.key] = value
  }
}

function scheduleSummary(schedule) {
  if (!schedule) return 'Sem dias'
  const labels = dayOptions.filter((d) => schedule[d.key]).map((d) => d.label)
  if (labels.length === 7) return 'Todos os dias'
  if (labels.length === 0) return 'Nenhum dia'
  return labels.join(', ')
}

function resetForm() {
  editingId.value = null
  form.name = ''
  form.prompt = ''
  form.enabled = false
  form.schedule = emptySchedule()
  form.todoIds = []
}

function startEdit(agent) {
  editingId.value = agent.id
  form.name = agent.name
  form.prompt = agent.prompt || ''
  form.enabled = agent.enabled === true
  form.schedule = { ...emptySchedule(), ...(agent.schedule || {}) }
  form.todoIds = [...(agent.todoIds || [])]
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function handleSave() {
  const payload = {
    name: form.name.trim(),
    prompt: form.prompt,
    enabled: form.enabled,
    schedule: { ...form.schedule },
    todoIds: [...form.todoIds]
  }

  if (editingId.value) {
    await agentStore.updateAgent(editingId.value, payload)
  } else {
    await agentStore.addAgent(payload)
  }
  resetForm()
}

async function removeAgent(id) {
  if (confirm('Excluir este agent?')) {
    await agentStore.deleteAgent(id)
    if (editingId.value === id) {
      resetForm()
    }
  }
}
</script>
