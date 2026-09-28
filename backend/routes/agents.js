import { readData, writeData } from '../utils/storage.js'
import { apiKeyAuth } from '../middleware/apiAuth.js'

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

const DEFAULT_SCHEDULE = Object.fromEntries(DAY_KEYS.map((k) => [k, false]))

function ensureAgentsArray(data) {
  if (!Array.isArray(data.agents)) {
    data.agents = []
  }
}

function normalizeSchedule(schedule) {
  if (!schedule || typeof schedule !== 'object') {
    return { ...DEFAULT_SCHEDULE }
  }
  const normalized = { ...DEFAULT_SCHEDULE }
  for (const key of DAY_KEYS) {
    if (schedule[key] === true) {
      normalized[key] = true
    }
  }
  return normalized
}

function normalizeTodoIds(todoIds) {
  if (!Array.isArray(todoIds)) return []
  return [...new Set(todoIds.map((id) => parseInt(id, 10)).filter((id) => !Number.isNaN(id)))]
}

function agentRunsOnDate(agent, date) {
  if (!agent?.enabled) return false
  const key = DAY_KEYS[date.getDay()]
  return agent.schedule?.[key] === true
}

function buildAgentPayload(agent, todosById) {
  const todoIds = normalizeTodoIds(agent.todoIds)
  const todos = todoIds
    .map((id) => todosById.get(id))
    .filter(Boolean)

  return {
    agentId: agent.id,
    name: agent.name,
    prompt: agent.prompt || '',
    todoIds,
    todos
  }
}

export function setupAgentRoutes(app) {
  app.get('/api/external/agent-dispatch', apiKeyAuth, async (req, res) => {
    const data = await readData()
    ensureAgentsArray(data)

    const date = req.query.date ? new Date(req.query.date) : new Date()
    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({ error: 'Parâmetro date inválido' })
    }

    const todosById = new Map(data.todos.map((t) => [t.id, t]))
    const weekdayKey = DAY_KEYS[date.getDay()]
    const dueAgents = data.agents.filter((agent) => agentRunsOnDate(agent, date))
    const agents = dueAgents.map((agent) => buildAgentPayload(agent, todosById))

    res.json({
      date: date.toISOString().slice(0, 10),
      weekday: weekdayKey,
      agents,
      meta: {
        configuredCount: data.agents.length,
        dueCount: agents.length,
        weekdayKey,
        serverTime: date.toISOString()
      }
    })
  })

  app.get('/api/agents', async (_req, res) => {
    const data = await readData()
    ensureAgentsArray(data)
    res.json(data.agents)
  })

  app.post('/api/agents', async (req, res) => {
    const data = await readData()
    ensureAgentsArray(data)

    const name = typeof req.body.name === 'string' ? req.body.name.trim() : ''
    if (!name) {
      return res.status(400).json({ message: 'Nome é obrigatório' })
    }

    const newAgent = {
      id: Date.now(),
      name,
      prompt: typeof req.body.prompt === 'string' ? req.body.prompt : '',
      enabled: req.body.enabled === true,
      schedule: normalizeSchedule(req.body.schedule),
      todoIds: normalizeTodoIds(req.body.todoIds),
      createdAt: new Date().toISOString()
    }

    data.agents.push(newAgent)
    await writeData(data)
    res.json(newAgent)
  })

  app.put('/api/agents/:id', async (req, res) => {
    const data = await readData()
    ensureAgentsArray(data)

    const index = data.agents.findIndex((a) => a.id === parseInt(req.params.id, 10))
    if (index === -1) {
      return res.status(404).json({ message: 'Agent não encontrado' })
    }

    const current = data.agents[index]
    const updates = { ...req.body }

    if (updates.name !== undefined) {
      const name = typeof updates.name === 'string' ? updates.name.trim() : ''
      if (!name) {
        return res.status(400).json({ message: 'Nome é obrigatório' })
      }
      updates.name = name
    }

    if (updates.prompt !== undefined && typeof updates.prompt !== 'string') {
      updates.prompt = String(updates.prompt)
    }

    if (updates.schedule !== undefined) {
      updates.schedule = normalizeSchedule(updates.schedule)
    }

    if (updates.todoIds !== undefined) {
      updates.todoIds = normalizeTodoIds(updates.todoIds)
    }

    if (updates.enabled !== undefined) {
      updates.enabled = updates.enabled === true
    }

    data.agents[index] = { ...current, ...updates }
    await writeData(data)
    res.json(data.agents[index])
  })

  app.delete('/api/agents/:id', async (req, res) => {
    const data = await readData()
    ensureAgentsArray(data)

    const id = parseInt(req.params.id, 10)
    const before = data.agents.length
    data.agents = data.agents.filter((a) => a.id !== id)

    if (data.agents.length === before) {
      return res.status(404).json({ message: 'Agent não encontrado' })
    }

    await writeData(data)
    res.json({ success: true })
  })
}
