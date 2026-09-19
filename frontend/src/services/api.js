const configuredBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const apiBaseUrl = configuredBaseUrl.endsWith('/api') || configuredBaseUrl === '/api'
  ? configuredBaseUrl
  : `${configuredBaseUrl}/api`

export async function request(path, options = {}) {
  let response

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
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