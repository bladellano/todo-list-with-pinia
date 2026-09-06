import { readData, writeData } from '../utils/storage.js'
import { verifyPassword, ensurePasswordHashed, isBcryptHash } from '../utils/password.js'

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

    res.json({ success: true, user: { id: user.id, username: user.username } })
  })
}
