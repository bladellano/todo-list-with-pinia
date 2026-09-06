const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`

export function getToken() {
  return localStorage.getItem('token')
}

export function getAuthHeaders(extra = {}) {
  const headers = { ...extra }
  const token = getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

export function clearAuthSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export async function apiFetch(path, options = {}) {
  const { headers = {}, ...rest } = options
  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: getAuthHeaders(headers)
  })

  if (response.status === 401 && !path.startsWith('/auth/login')) {
    clearAuthSession()
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
    throw new Error('Não autorizado')
  }

  return response
}

export { API_BASE }
