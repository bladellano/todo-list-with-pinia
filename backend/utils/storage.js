import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const DATA_FILE = path.join(__dirname, '..', 'data', 'data.json')

const initialData = {
  users: [{ id: 1, username: 'admin', password: 'admin' }],
  todos: [],
  tags: [],
  todoOrder: []
}

export async function initDataFile() {
  try {
    const dataDir = path.dirname(DATA_FILE)
    await fs.mkdir(dataDir, { recursive: true })
    await fs.access(DATA_FILE)
  } catch {
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
