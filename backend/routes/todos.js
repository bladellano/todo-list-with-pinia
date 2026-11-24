import { readData, writeData } from '../utils/storage.js'
import { apiKeyAuth } from '../middleware/apiAuth.js'
import { normalizeEmailSlug } from '../utils/emailSlug.js'

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

  // Criar todo via integração externa (n8n / Gmail create-todo) com dedupe por emailSlug
  app.post('/api/external/todos', apiKeyAuth, async (req, res) => {
    const { title, description, emailSlug: rawSlug } = req.body || {}

    const trimmedTitle = typeof title === 'string' ? title.trim() : ''
    if (!trimmedTitle) {
      return res.status(400).json({
        error: 'Dados inválidos',
        message: 'O campo title é obrigatório'
      })
    }

    const slug = normalizeEmailSlug(
      typeof rawSlug === 'string' && rawSlug.trim()
        ? rawSlug
        : trimmedTitle
    )

    if (!slug) {
      return res.status(400).json({
        error: 'Dados inválidos',
        message: 'emailSlug inválido ou ausente'
      })
    }

    const data = await readData()
    const existing = data.todos.find(
      t => normalizeEmailSlug(t.emailSlug || '') === slug
    )

    if (existing) {
      return res.status(200).json({
        created: false,
        todo: existing
      })
    }

    const newTodo = {
      id: Date.now(),
      title: trimmedTitle,
      description: typeof description === 'string' ? description : '',
      emailSlug: slug,
      tagIds: [],
      done: false,
      pinned: false,
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
    await writeData(data)

    res.status(201).json({
      created: true,
      todo: newTodo
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
