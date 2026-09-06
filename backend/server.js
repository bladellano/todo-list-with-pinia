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

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env') })

const app = express()
const PORT = process.env.PORT || 3001
const HOST = (process.env.SERVER_HOST || 'localhost').replace(/^https?:\/\//, '')

app.use(cors())
app.use(express.json({ limit: '10mb' }))

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
