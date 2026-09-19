import InterviewWorkspace from './InterviewWorkspace'
import ArchitectureWorkspace from './ArchitectureWorkspace'
import ImproveWorkspace from './ImproveWorkspace'
import ReviewWorkspace from './ReviewWorkspace'
import UploadWorkspace from './UploadWorkspace'

function WorkspaceView({ projectManagerProps, stage }) {
  const workspaceProps = { projectManagerProps }

  if (stage === 'upload') return <UploadWorkspace {...workspaceProps} />
  if (stage === 'understand') return <ArchitectureWorkspace {...workspaceProps} />
  if (stage === 'review') return <ReviewWorkspace {...workspaceProps} />
  if (stage === 'improve') return <ImproveWorkspace {...workspaceProps} />
  return <InterviewWorkspace {...workspaceProps} />
}

export default WorkspaceView
