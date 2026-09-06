import { readData, writeData } from '../utils/storage.js'
import { ensurePasswordHashed } from '../utils/password.js'

function stripSensitiveFields(data) {
  return {
    ...data,
    users: data.users.map(({ password, ...user }) => user),
    sessions: undefined
  }
}

async function normalizeImportedUsers(importedUsers, existingUsers) {
  const existingByUsername = new Map(existingUsers.map(u => [u.username, u]))

  return Promise.all(importedUsers.map(async (user) => {
    if (user.password) {
      return {
        ...user,
        password: await ensurePasswordHashed(user.password)
      }
    }

    const existing = existingByUsername.get(user.username)
    if (existing?.password) {
      return { ...user, password: existing.password }
    }

    return user
  }))
}

export function setupDataRoutes(app) {
  app.get('/api/export', async (req, res) => {
    const data = await readData()
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename=todo-backup-${Date.now()}.json`)
    res.json(stripSensitiveFields(data))
  })

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

      importedData.sessions = []

      const currentData = await readData()
      importedData.users = await normalizeImportedUsers(importedData.users, currentData.users)

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
