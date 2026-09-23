import InterviewWorkspace from './InterviewWorkspace'
import ArchitectureWorkspace from './ArchitectureWorkspace'
import ImproveWorkspace from './ImproveWorkspace'
import ReviewWorkspace from './ReviewWorkspace'
import UploadWorkspace from './UploadWorkspace'

function WorkspaceView({ analysis, analysisError, isAnalyzing, onAnalyze, projectManagerProps, stage }) {
  const workspaceProps = { projectManagerProps }

  if (stage === 'upload') return <UploadWorkspace analysis={analysis} analysisError={analysisError} isAnalyzing={isAnalyzing} onAnalyze={onAnalyze} {...workspaceProps} />
  if (stage === 'understand') return <ArchitectureWorkspace analysis={analysis} {...workspaceProps} />
  if (stage === 'review') return <ReviewWorkspace analysis={analysis} {...workspaceProps} />
  if (stage === 'improve') return <ImproveWorkspace analysis={analysis} {...workspaceProps} />
  return <InterviewWorkspace {...workspaceProps} />
}

export default WorkspaceView
