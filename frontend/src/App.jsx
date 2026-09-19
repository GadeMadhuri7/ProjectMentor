import { useEffect, useState } from 'react'
import { createProject, getProjects } from './api/client'
import DashboardHeader from './components/DashboardHeader'
import WorkflowSidebar from './components/WorkflowSidebar'
import WorkspaceView from './components/WorkspaceView'
import { analyzeProject, checkHealth } from './services/api'

function App() {
  const [projects, setProjects] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeStage, setActiveStage] = useState('interview')
  const [health, setHealth] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState('')

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

  useEffect(() => {
    checkHealth().then(setHealth).catch((requestError) => setHealth({ error: requestError.message }))
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

  async function handleAnalyze(file) {
    try {
      setIsAnalyzing(true)
      setAnalysisError('')
      setAnalysis(await analyzeProject(file))
      setActiveStage('understand')
    } catch (requestError) {
      setAnalysisError(requestError.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <DashboardHeader
        activeProject={projects[0]}
        health={health}
        onMenuToggle={() => setIsSidebarOpen((isOpen) => !isOpen)}
      />
      <div className="mx-auto flex max-w-[1600px] flex-col lg:min-h-[calc(100vh-65px)] lg:flex-row">
        <WorkflowSidebar
          activeStage={activeStage}
          isOpen={isSidebarOpen}
          onNavigate={(stage) => {
            setActiveStage(stage)
            setIsSidebarOpen(false)
          }}
        />
        <WorkspaceView
          analysis={analysis}
          analysisError={analysisError}
          isAnalyzing={isAnalyzing}
          onAnalyze={handleAnalyze}
          stage={activeStage}
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
