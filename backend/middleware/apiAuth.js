/**
 * Middleware de autenticação para APIs externas (n8n, webhooks, etc)
 * Valida API Key enviada no header Authorization: Bearer <API_KEY>
 */
export function apiKeyAuth(req, res, next) {
  const apiKey = process.env.API_KEY
  
  // Se não houver API_KEY configurada, permite acesso (modo desenvolvimento)
  if (!apiKey) {
    console.warn('⚠️  API_KEY não configurada - acesso público ao endpoint')
    return next()
  }
  
  const authHeader = req.headers.authorization
  
  if (!authHeader) {
    return res.status(401).json({ 
      error: 'Não autorizado',
      message: 'Header Authorization não encontrado' 
    })
  }
  
  // Suporta tanto "Bearer TOKEN" quanto "TOKEN"
  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : authHeader
  
  if (token !== apiKey) {
    return res.status(401).json({ 
      error: 'Não autorizado',
      message: 'API Key inválida' 
    })
  }
  
  next()
}
