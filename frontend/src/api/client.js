import { request } from '../services/api'

export function getProjects() {
  return request('/projects')
}

export function createProject(project) {
  return request('/projects', {
    method: 'POST',
    body: JSON.stringify(project),
  })
}