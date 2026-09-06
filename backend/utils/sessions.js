import crypto from 'crypto'
import { readData, writeData } from './storage.js'

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 dias

function ensureSessionsArray(data) {
  if (!Array.isArray(data.sessions)) {
    data.sessions = []
  }
}

function pruneExpiredSessions(sessions) {
  const now = Date.now()
  return sessions.filter(s => new Date(s.expiresAt).getTime() > now)
}

export async function createSession(userId) {
  const data = await readData()
  ensureSessionsArray(data)

  const token = crypto.randomBytes(32).toString('hex')
  const now = new Date()
  const session = {
    token,
    userId,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS).toISOString()
  }

  data.sessions = pruneExpiredSessions(data.sessions)
  data.sessions.push(session)
  await writeData(data)

  return token
}

export async function validateSession(token) {
  if (!token) return null

  const data = await readData()
  ensureSessionsArray(data)

  const session = data.sessions.find(s => s.token === token)
  if (!session) return null

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    data.sessions = data.sessions.filter(s => s.token !== token)
    await writeData(data)
    return null
  }

  const user = data.users.find(u => u.id === session.userId)
  if (!user) return null

  return { id: user.id, username: user.username }
}

export async function revokeSession(token) {
  if (!token) return

  const data = await readData()
  ensureSessionsArray(data)
  data.sessions = data.sessions.filter(s => s.token !== token)
  await writeData(data)
}
