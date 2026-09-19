const configuredBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const apiBaseUrl = configuredBaseUrl.endsWith('/api') || configuredBaseUrl === '/api'
  ? configuredBaseUrl
  : `${configuredBaseUrl}/api`

export async function request(path, options = {}) {
  let response
  const headers = options.body instanceof FormData
    ? { ...options.headers }
    : { 'Content-Type': 'application/json', ...options.headers }

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      headers,
      ...options,
    })
  } catch {
    throw new Error('Unable to connect to the ProjectMentor API.')
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.detail || 'The request could not be completed.')
  }

  return response.json()
}

export function checkHealth() {
  return request('/health')
}

export function analyzeProject(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request('/projects/analyze', {
    method: 'POST',
    headers: {},
    body: formData,
  })
}