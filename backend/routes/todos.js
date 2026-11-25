import { readData, writeData, updateData } from '../utils/storage.js'
import { apiKeyAuth } from '../middleware/apiAuth.js'
import { normalizeEmailSlug } from '../utils/emailSlug.js'

const EXTERNAL_TODO_BATCH_LIMIT = 100

function pinIds(data, ids) {
  if (!ids.length) return

  if (!Array.isArray(data.todoOrder)) {
    data.todoOrder = []
  }
  if (data.todoOrder.length === 0) {
    data.todoOrder = data.todos.map(todo => todo.id)
  }

  const selected = new Set(ids)
  data.todoOrder = [
    ...ids,
    ...data.todoOrder.filter(id => !selected.has(id))
  ]
}

function applyExternalTodo(data, input, id) {
  const source = input || {}
  const gmailMessageId = typeof source.gmailMessageId === 'string' && source.gmailMessageId.trim()
    ? source.gmailMessageId.trim()
    : typeof source.gmailMessageId === 'number' && Number.isFinite(source.gmailMessageId)
      ? String(source.gmailMessageId)
      : null
  const trimmedTitle = typeof source.title === 'string' ? source.title.trim() : ''

  if (!trimmedTitle) {
    return {
      gmailMessageId,
      ok: false,
      created: false,
      error: 'O campo title é obrigatório'
    }
  }

  const rawSlug = source.emailSlug
  const slug = normalizeEmailSlug(
    typeof rawSlug === 'string' && rawSlug.trim() ? rawSlug : trimmedTitle
  )

  if (!slug) {
    return {
      gmailMessageId,
      ok: false,
      created: false,
      error: 'emailSlug inválido ou ausente'
    }
  }

  const existing = data.todos.find(
    todo => normalizeEmailSlug(todo.emailSlug || '') === slug
  )

  if (existing) {
    return {
      gmailMessageId,
      ok: true,
      created: false,
      emailSlug: slug,
      todo: existing
    }
  }

  const newTodo = {
    id,
    title: trimmedTitle,
    description: typeof source.description === 'string' ? source.description : '',
    emailSlug: slug,
    tagIds: [],
    done: false,
    pinned: true,
    archived: false,
    notificable: false,
    sendByEmail: false,
    emails: [],
    sendFrequency: 'daily',
    sendTime: '09:00',
    createdAt: new Date().toISOString(),
    completedAt: null
  }

  data.todos.push(newTodo)

  return {
    gmailMessageId,
    ok: true,
    created: true,
    emailSlug: slug,
    todo: newTodo
  }
}

export function setupTodoRoutes(app) {
  // Listar todos (com filtros opcionais)
  app.get('/api/external/todos', apiKeyAuth, async (req, res) => {
    const data = await readData()
    let todos = data.todos
    
    // Filtros via query params
    const { notificable, pinned, done, archived, sendByEmail, emailSlug } = req.query
    
    // Aplicar filtros se fornecidos
    if (notificable !== undefined) {
      const filterValue = notificable === 'true' || notificable === '1'
      todos = todos.filter(t => t.notificable === filterValue)
    }
    
    if (pinned !== undefined) {
      const filterValue = pinned === 'true' || pinned === '1'
      todos = todos.filter(t => t.pinned === filterValue)
    }
    
    if (done !== undefined) {
      const filterValue = done === 'true' || done === '1'
      todos = todos.filter(t => t.done === filterValue)
    }
    
    if (archived !== undefined) {
      const filterValue = archived === 'true' || archived === '1'
      todos = todos.filter(t => t.archived === filterValue)
    }

    if (sendByEmail !== undefined) {
      const filterValue = sendByEmail === 'true' || sendByEmail === '1'
      todos = todos.filter(t => t.sendByEmail === filterValue)
    }

    if (emailSlug !== undefined && String(emailSlug).trim() !== '') {
      const slug = normalizeEmailSlug(String(emailSlug))
      todos = todos.filter(
        t => normalizeEmailSlug(t.emailSlug || '') === slug
      )
    }
    
    res.json(todos)
  })

  // Vários e-mails no mesmo evento: uma leitura e uma gravação para a lista inteira.
  app.post('/api/external/todos/batch', apiKeyAuth, async (req, res) => {
    const items = req.body?.items

    if (!Array.isArray(items)) {
      return res.status(400).json({
        error: 'Dados inválidos',
        message: 'O campo items deve ser uma lista'
      })
    }

    if (items.length > EXTERNAL_TODO_BATCH_LIMIT) {
      return res.status(400).json({
        error: 'Dados inválidos',
        message: `No máximo ${EXTERNAL_TODO_BATCH_LIMIT} itens por requisição`
      })
    }

    const baseId = Date.now()
    const results = await updateData(data => {
      const createdIds = []
      const itemResults = items.map((item, index) => {
        const result = applyExternalTodo(data, item, baseId + index)
        if (result.created) createdIds.push(result.todo.id)
        return result
      })
      pinIds(data, createdIds)
      return itemResults
    })

    res.status(200).json({ results })
  })

  // Criar uma tarefa via integração externa, com dedupe por emailSlug.
  app.post('/api/external/todos', apiKeyAuth, async (req, res) => {
    const result = await updateData(data => {
      const outcome = applyExternalTodo(data, req.body, Date.now())
      if (outcome.created) pinIds(data, [outcome.todo.id])
      return outcome
    })

    if (!result.ok) {
      return res.status(400).json({
        error: 'Dados inválidos',
        message: result.error
      })
    }

    res.status(result.created ? 201 : 200).json({
      created: result.created,
      todo: result.todo
    })
  })

  // Listar todos
  app.get('/api/todos', async (req, res) => {
    const data = await readData()
    res.json(data.todos)
  })

  // Criar todo
  app.post('/api/todos', async (req, res) => {
    const data = await readData()
    const newTodo = {
      id: Date.now(),
      ...req.body,
      createdAt: new Date().toISOString()
    }
    data.todos.push(newTodo)
    await writeData(data)
    res.json(newTodo)
  })

  // Obter ordem customizada
  app.get('/api/todos/order', async (req, res) => {
    const data = await readData()
    res.json(data.todoOrder || [])
  })

  // Atualizar ordem customizada
  app.put('/api/todos/order', async (req, res) => {
    const data = await readData()
    data.todoOrder = req.body.order
    await writeData(data)
    res.json({ success: true })
  })

  // Atualizar todo
  app.put('/api/todos/:id', async (req, res) => {
    const data = await readData()
    const index = data.todos.findIndex(t => t.id === parseInt(req.params.id))
    
    if (index !== -1) {
      const { emailSlug: _ignored, ...updates } = req.body || {}
      data.todos[index] = { ...data.todos[index], ...updates }
      await writeData(data)
      res.json(data.todos[index])
    } else {
      res.status(404).json({ message: 'Tarefa não encontrada' })
    }
  })

  // Deletar todo
  app.delete('/api/todos/:id', async (req, res) => {
    const data = await readData()
    data.todos = data.todos.filter(t => t.id !== parseInt(req.params.id))
    await writeData(data)
    res.json({ success: true })
  })
}
