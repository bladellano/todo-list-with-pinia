import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { hashPassword } from './password.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const DATA_FILE = process.env.DATA_FILE_PATH
  || path.join(__dirname, '..', 'data', 'data.json')

export async function initDataFile() {
  try {
    const dataDir = path.dirname(DATA_FILE)
    await fs.mkdir(dataDir, { recursive: true })
    await fs.access(DATA_FILE)
  } catch {
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        `⚠️  data.json não encontrado — criando arquivo vazio em ${DATA_FILE}. ` +
        'Se você tinha dados antes, o volume persistente provavelmente não está montado neste caminho.'
      )
    }
    const initialData = {
      users: [{ id: 1, username: 'admin', password: await hashPassword('admin') }],
      todos: [],
      tags: [],
      todoOrder: [],
      agents: [],
      sessions: []
    }
    await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2))
  }
}

export async function readData() {
  const data = await fs.readFile(DATA_FILE, 'utf-8')
  return JSON.parse(data)
}

export async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2))
}

let writeQueue = Promise.resolve()

// Serializa leitura + alteração + gravação. Vários POSTs ao mesmo tempo
// (n8n dispara um por e-mail) não podem sobrescrever o arquivo uns aos outros.
export function updateData(mutator) {
  const run = writeQueue.then(async () => {
    const data = await readData()
    const value = await mutator(data)
    await writeData(data)
    return value
  })

  writeQueue = run.then(
    () => undefined,
    () => undefined
  )

  return run
}
