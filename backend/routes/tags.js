import { readData, writeData } from '../utils/storage.js'

export function setupTagRoutes(app) {
  // Listar tags
  app.get('/api/tags', async (req, res) => {
    const data = await readData()
    res.json(data.tags)
  })

  // Criar tag
  app.post('/api/tags', async (req, res) => {
    const data = await readData()
    const newTag = {
      id: Date.now(),
      ...req.body
    }
    data.tags.push(newTag)
    await writeData(data)
    res.json(newTag)
  })

  // Atualizar tag
  app.put('/api/tags/:id', async (req, res) => {
    const data = await readData()
    const index = data.tags.findIndex(t => t.id === parseInt(req.params.id))
    
    if (index !== -1) {
      data.tags[index] = { ...data.tags[index], ...req.body }
      await writeData(data)
      res.json(data.tags[index])
    } else {
      res.status(404).json({ message: 'Tag não encontrada' })
    }
  })

  // Deletar tag
  app.delete('/api/tags/:id', async (req, res) => {
    const data = await readData()
    data.tags = data.tags.filter(t => t.id !== parseInt(req.params.id))
    await writeData(data)
    res.json({ success: true })
  })
}
