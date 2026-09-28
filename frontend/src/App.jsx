import { useEffect, useState } from 'react'
import { createProject, getProjects } from './api/client'
import DashboardHeader from './components/DashboardHeader'
import WorkflowSidebar from './components/WorkflowSidebar'
import WorkspaceView from './components/WorkspaceView'
import { analyzeProject, askProjectAssistant, checkHealth } from './services/api'

function buildAssistantHistory(messages) {
  const history = []
  let totalCharacters = 0

  for (const message of messages.slice(-10).reverse()) {
    if (!['user', 'assistant'].includes(message.role)) continue
    const availableCharacters = 20000 - totalCharacters
    if (availableCharacters <= 0) break
    const content = message.content.slice(-Math.min(4000, availableCharacters))
    history.push({ role: message.role, content })
    totalCharacters += content.length
  }

  return history.reverse()
}

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
  const [assistantSession, setAssistantSession] = useState({
    projectId: null,
    conversation: [],
    error: '',
  })
  const [isAssistantSending, setIsAssistantSending] = useState(false)
  const activeProject = projects[0] || null
  const assistantConversation = assistantSession.projectId === activeProject?.id
    ? assistantSession.conversation
    : []
  const assistantError = assistantSession.projectId === activeProject?.id
    ? assistantSession.error
    : ''

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
    if (!activeProject) {
      setAnalysisError('Create a project before analyzing an archive.')
      return
    }

    try {
      setIsAnalyzing(true)
      setAnalysisError('')
      setAnalysis(await analyzeProject(file, activeProject.id))
      setActiveStage('understand')
    } catch (requestError) {
      setAnalysisError(requestError.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  async function handleAssistantSend(question) {
    if (!activeProject) return false

    const conversation = buildAssistantHistory(assistantConversation)
    try {
      setIsAssistantSending(true)
      setAssistantSession((currentSession) => ({
        projectId: activeProject.id,
        conversation: currentSession.projectId === activeProject.id ? currentSession.conversation : [],
        error: '',
      }))
      const response = await askProjectAssistant(activeProject.id, question, conversation)
      setAssistantSession((currentSession) => ({
        projectId: activeProject.id,
        error: '',
        conversation: [
          ...(currentSession.projectId === activeProject.id ? currentSession.conversation : []),
          { role: 'user', content: question },
          { role: 'assistant', content: response.answer, evidence: response.evidence || [] },
        ],
      }))
      return true
    } catch {
      setAssistantSession((currentSession) => ({
        projectId: activeProject.id,
        conversation: currentSession.projectId === activeProject.id ? currentSession.conversation : [],
        error: 'The assistant could not complete that request. Check your connection and try again.',
      }))
      return false
    } finally {
      setIsAssistantSending(false)
    }
  }

  function handleAssistantClear() {
    setAssistantSession({
      projectId: activeProject?.id ?? null,
      conversation: [],
      error: '',
    })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <DashboardHeader
        activeProject={activeProject}
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
          activeProject={activeProject}
          assistantConversation={assistantConversation}
          assistantError={assistantError}
          isAnalyzing={isAnalyzing}
          isAssistantSending={isAssistantSending}
          onAnalyze={handleAnalyze}
          onAssistantClear={handleAssistantClear}
          onAssistantSend={handleAssistantSend}
          onNavigate={setActiveStage}
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
