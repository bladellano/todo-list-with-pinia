import { readData, writeData } from '../utils/storage.js'

export function setupAuthRoutes(app) {
  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body
    const data = await readData()
    
    const user = data.users.find(
      u => u.username === username && u.password === password
    )
    
    if (user) {
      res.json({ success: true, user: { id: user.id, username: user.username } })
    } else {
      res.status(401).json({ success: false, message: 'Credenciais inválidas' })
    }
  })
}
