import { useEffect, useState } from 'react'
import { createProject, getProjects } from './api/client'
import './App.css'

function App() {
  const [projects, setProjects] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProjects() {
      try {
        setError('')
        setProjects(await getProjects())
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadProjects()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()

    if (!name.trim()) {
      setError('Project name is required.')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')
      const project = await createProject({
        name: name.trim(),
        description: description.trim() || null,
      })
      setProjects((currentProjects) => [project, ...currentProjects])
      setName('')
      setDescription('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Project review workspace</p>
          <h1>ProjectMentor</h1>
        </div>
        <span className="status-badge">Workspace</span>
      </header>

      <section className="intro">
        <p className="eyebrow">Start here</p>
        <h2>Give your project a place to grow.</h2>
        <p className="intro-copy">
          Create a project now. Repository review and interview preparation will
          build on this foundation.
        </p>
      </section>

      <section className="workspace-grid">
        <form className="project-form" onSubmit={handleSubmit}>
          <div>
            <p className="eyebrow">New project</p>
            <h2>Set up a project</h2>
          </div>
          <label htmlFor="project-name">Project name</label>
          <input
            id="project-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Mentor API"
            maxLength={120}
            disabled={isSubmitting}
          />
          <label htmlFor="project-description">Description <span>(optional)</span></label>
          <textarea
            id="project-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What are you building?"
            rows="4"
            maxLength={500}
            disabled={isSubmitting}
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating project...' : 'Create project'}
          </button>
        </form>

        <section className="project-list" aria-labelledby="projects-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Your workspace</p>
              <h2 id="projects-heading">Projects</h2>
            </div>
            {!isLoading && <span className="project-count">{projects.length}</span>}
          </div>

          {error && <p className="message error-message">{error}</p>}
          {isLoading && <p className="message">Loading projects...</p>}
          {!isLoading && !error && projects.length === 0 && (
            <p className="message empty-message">No projects yet. Create your first one.</p>
          )}
          {!isLoading && !error && projects.length > 0 && (
            <ul className="projects">
              {projects.map((project) => (
                <li key={project.id} className="project-item">
                  <div>
                    <h3>{project.name}</h3>
                    <p>{project.description || 'No description yet.'}</p>
                  </div>
                  <time dateTime={project.created_at}>
                    {new Date(project.created_at).toLocaleDateString()}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  )
}

export default App
