import { useEffect, useState } from 'react'
import { createProject, getProjects } from './api/client'
import DashboardHeader from './components/DashboardHeader'
import WorkflowSidebar from './components/WorkflowSidebar'
import WorkspaceView from './components/WorkspaceView'

function App() {
  const [projects, setProjects] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <DashboardHeader
        activeProject={projects[0]}
        onMenuToggle={() => setIsSidebarOpen((isOpen) => !isOpen)}
      />
      <div className="mx-auto flex max-w-[1600px] flex-col lg:min-h-[calc(100vh-65px)] lg:flex-row">
        <WorkflowSidebar
          isOpen={isSidebarOpen}
          onNavigate={() => setIsSidebarOpen(false)}
        />
        <WorkspaceView
          projectManagerProps={{
            description,
            error,
            isLoading,
            isSubmitting,
            name,
            onDescriptionChange: (event) => setDescription(event.target.value),
            onNameChange: (event) => setName(event.target.value),
            onSubmit: handleSubmit,
            projects,
          }}
        />
      </div>
    </div>
  )
}

export default App
