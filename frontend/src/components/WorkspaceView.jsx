import InterviewWorkspace from './InterviewWorkspace'
import ArchitectureWorkspace from './ArchitectureWorkspace'
import ImproveWorkspace from './ImproveWorkspace'
import ReviewWorkspace from './ReviewWorkspace'
import UploadWorkspace from './UploadWorkspace'
import AssistantWorkspace from './AssistantWorkspace'

function WorkspaceView({
  analysis,
  analysisError,
  assistantConversation,
  assistantError,
  activeProject,
  isAnalyzing,
  isAssistantSending,
  onAnalyze,
  onAssistantClear,
  onAssistantSend,
  onNavigate,
  projectManagerProps,
  stage,
}) {
  const workspaceProps = { projectManagerProps }

  if (stage === 'assistant') {
    return (
      <AssistantWorkspace
        activeProject={activeProject}
        conversation={assistantConversation}
        error={assistantError}
        isSending={isAssistantSending}
        onClear={onAssistantClear}
        onNavigate={onNavigate}
        onSend={onAssistantSend}
      />
    )
  }
  if (stage === 'upload') return <UploadWorkspace analysis={analysis} analysisError={analysisError} isAnalyzing={isAnalyzing} onAnalyze={onAnalyze} {...workspaceProps} />
  if (stage === 'understand') return <ArchitectureWorkspace analysis={analysis} {...workspaceProps} />
  if (stage === 'review') return <ReviewWorkspace analysis={analysis} {...workspaceProps} />
  if (stage === 'improve') return <ImproveWorkspace analysis={analysis} {...workspaceProps} />
  return <InterviewWorkspace analysis={analysis} {...workspaceProps} />
}

export default WorkspaceView
