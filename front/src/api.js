import { API_URL } from './config'
import { AUTH_KEY, notifyAuthChanged } from './auth'

const readAuth = () => {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null')
  } catch (error) {
    console.error('Não foi possível ler a sessão salva.', error)
    return null
  }
}

export const saveAuth = (auth) => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth))
  notifyAuthChanged()
}

export const clearAuth = () => {
  localStorage.removeItem(AUTH_KEY)
  notifyAuthChanged()
}

export const apiRequest = async (path, options = {}) => {
  const auth = readAuth()
  const headers = new Headers(options.headers)

  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (auth?.token) headers.set('Authorization', `Bearer ${auth.token}`)

  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  if ((response.status === 401 || response.status === 403) && auth?.token) {
    clearAuth()
  }
  return response
}

export const apiJson = async (path, options = {}) => {
  const response = await apiRequest(path, options)
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Erro ${response.status} ao falar com a API`)
  }
  return response.status === 204 ? null : response.json()
}
