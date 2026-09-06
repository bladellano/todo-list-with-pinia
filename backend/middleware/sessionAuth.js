import { validateSession } from '../utils/sessions.js'

function extractToken(req) {
  const authHeader = req.headers.authorization
  if (!authHeader) return null

  return authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader
}

export async function requireSession(req, res, next) {
  const token = extractToken(req)
  const user = await validateSession(token)

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Não autorizado. Faça login novamente.'
    })
  }

  req.user = user
  next()
}

export function isPublicApiRoute(req) {
  const { method, path } = req

  if (method === 'GET' && path === '/api/health') return true
  if (method === 'POST' && path === '/api/auth/login') return true
  if (path.startsWith('/api/external/')) return true

  return false
}
