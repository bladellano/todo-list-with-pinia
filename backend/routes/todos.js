import { readData, writeData } from '../utils/storage.js'
import { apiKeyAuth } from '../middleware/apiAuth.js'

export function setupTodoRoutes(app) {
  // Listar todos (com filtros opcionais)
  app.get('/api/external/todos', apiKeyAuth, async (req, res) => {
    const data = await readData()
    let todos = data.todos
    
    // Filtros via query params
    const { notificable, pinned, done, archived, sendByEmail } = req.query
    
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
    
    res.json(todos)
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
      data.todos[index] = { ...data.todos[index], ...req.body }
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
