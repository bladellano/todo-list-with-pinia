import { readData, writeData } from '../utils/storage.js'
import { verifyPassword, ensurePasswordHashed, isBcryptHash } from '../utils/password.js'
import { createSession, revokeSession } from '../utils/sessions.js'
import { requireSession } from '../middleware/sessionAuth.js'

function extractToken(req) {
  const authHeader = req.headers.authorization
  if (!authHeader) return null
  return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader
}

export function setupAuthRoutes(app) {
  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body
    const data = await readData()

    const userIndex = data.users.findIndex(u => u.username === username)
    if (userIndex === -1) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas' })
    }

    const user = data.users[userIndex]
    const valid = await verifyPassword(password, user.password)

    if (!valid) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas' })
    }

    if (!isBcryptHash(user.password)) {
      data.users[userIndex].password = await ensurePasswordHashed(user.password)
      await writeData(data)
    }

    const token = await createSession(user.id)

    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username }
    })
  })

  app.post('/api/auth/logout', requireSession, async (req, res) => {
    await revokeSession(extractToken(req))
    res.json({ success: true })
  })

  app.get('/api/auth/me', requireSession, (req, res) => {
    res.json({ success: true, user: req.user })
  })
}
