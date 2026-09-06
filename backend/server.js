import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { initDataFile } from './utils/storage.js'
import { setupAuthRoutes } from './routes/auth.js'
import { setupTodoRoutes } from './routes/todos.js'
import { setupTagRoutes } from './routes/tags.js'
import { setupDataRoutes } from './routes/data.js'
import { setupAIRoutes } from './routes/ai.js'
import { requireSession, isPublicApiRoute } from './middleware/sessionAuth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env') })

const app = express()
const PORT = process.env.PORT || 3001

function resolveHost() {
  const isProduction = process.env.NODE_ENV === 'production'
  let host = (process.env.SERVER_HOST || (isProduction ? '0.0.0.0' : 'localhost'))
    .replace(/^https?:\/\//, '')
    .trim()

  const validBindHosts = new Set(['0.0.0.0', '127.0.0.1', 'localhost', '::', '::1'])
  if (!validBindHosts.has(host)) {
    console.warn(`⚠️  SERVER_HOST="${host}" não é válido para bind no container — usando 0.0.0.0`)
    host = '0.0.0.0'
  }

  return host
}

const HOST = resolveHost()

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.use(async (req, res, next) => {
  if (!req.path.startsWith('/api/') || isPublicApiRoute(req)) {
    return next()
  }
  return requireSession(req, res, next)
})

// Configurar rotas
setupAuthRoutes(app)
setupTodoRoutes(app)
setupTagRoutes(app)
setupDataRoutes(app)
setupAIRoutes(app, process.env.OPENAI_API_KEY, process.env.OPENAI_MODEL)

// Iniciar servidor
await initDataFile()

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'todo-backend' })
})

app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor rodando em ${HOST}:${PORT}`)
})
