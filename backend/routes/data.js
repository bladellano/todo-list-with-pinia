import { readData, writeData } from '../utils/storage.js'

export function setupDataRoutes(app) {
  // Exportar dados
  app.get('/api/export', async (req, res) => {
    const data = await readData()
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename=todo-backup-${Date.now()}.json`)
    res.json(data)
  })

  // Importar dados
  app.post('/api/import', async (req, res) => {
    try {
      const importedData = req.body
      
      if (!importedData.users || !importedData.todos || !importedData.tags) {
        return res.status(400).json({ 
          success: false, 
          message: 'Arquivo inválido. Estrutura de dados incorreta.' 
        })
      }
      
      if (!Array.isArray(importedData.users) || 
          !Array.isArray(importedData.todos) || 
          !Array.isArray(importedData.tags)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Arquivo inválido. Dados devem ser arrays.' 
        })
      }
      
      if (!importedData.todoOrder) {
        importedData.todoOrder = []
      }
      
      await writeData(importedData)
      
      res.json({ 
        success: true, 
        message: 'Dados importados com sucesso!',
        stats: {
          users: importedData.users.length,
          todos: importedData.todos.length,
          tags: importedData.tags.length
        }
      })
    } catch (error) {
      console.error('Erro ao importar:', error)
      res.status(500).json({ 
        success: false, 
        message: 'Erro ao processar arquivo. Verifique o formato.' 
      })
    }
  })
}
