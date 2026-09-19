import Icon from './Icon'
import ProjectManager from './ProjectManager'

function UploadWorkspace({ projectManagerProps }) {
  return (
    <main className="min-w-0 flex-1 bg-slate-950">
      <div className="mx-auto max-w-[1280px] px-4 py-5 sm:px-6 sm:py-7 lg:px-10 lg:py-9">
        <div className="flex items-center gap-2 text-xs text-slate-600" aria-label="Breadcrumb"><span>Workspace</span><Icon name="chevronRight" size={13} /><span className="text-slate-400">Upload Repository</span><span className="ml-1 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-2 py-0.5 text-[10px] font-medium text-indigo-300">Active</span></div>
        <div className="mt-7 border-b border-slate-800/90 pb-7"><p className="text-xs font-medium text-indigo-400">Project workspace</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-100 sm:text-3xl">Upload Repository</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Create a project context to begin exploring its architecture, evidence, improvements, and interview questions.</p></div>
        <ProjectManager {...projectManagerProps} />
      </div>
    </main>
  )
}

export default UploadWorkspace