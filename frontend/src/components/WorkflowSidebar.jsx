import Icon from './Icon'

const workflowSteps = [
  { id: 'upload', number: '1', label: 'Upload Repository', icon: 'upload' },
  { id: 'understand', number: '2', label: 'Understand', icon: 'layers' },
  { id: 'review', number: '3', label: 'Review Findings', icon: 'activity' },
  { id: 'improve', number: '4', label: 'Improve Suggestions', icon: 'sparkles' },
  { id: 'interview', number: '5', label: 'Interview Prep', icon: 'user' },
]

function WorkflowSidebar({ activeStage, isOpen, onNavigate }) {
  return (
    <aside
      className={`${isOpen ? 'block' : 'hidden'} border-b border-slate-800 bg-slate-950/70 lg:block lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r`}
    >
      <div className="sticky top-0 p-4 lg:p-5">
        <div className="mb-5 flex items-center justify-between px-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">Workspace</p>
            <h2 className="mt-1 text-sm font-semibold text-slate-200">Analysis Workflow</h2>
          </div>
          <Icon name="chevronRight" className="text-slate-700" size={16} />
        </div>

        <nav aria-label="Analysis workflow" className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1 lg:overflow-visible">
          {workflowSteps.map((step) => {
            const isActive = step.id === activeStage
            const isComplete = !isActive && Number(step.number) < Number(activeStage === 'upload' ? 1 : activeStage === 'understand' ? 2 : activeStage === 'review' ? 3 : activeStage === 'improve' ? 4 : 5)
            return (
              <button
                aria-current={isActive ? 'step' : undefined}
                className={`group flex min-w-max items-center gap-3 rounded-xl border px-3 py-3 text-left transition lg:w-full ${
                  isActive
                    ? 'border-indigo-400/25 bg-indigo-500/10 text-indigo-200 shadow-lg shadow-indigo-950/20'
                    : 'border-transparent text-slate-500 hover:border-slate-800 hover:bg-slate-900/70 hover:text-slate-300'
                }`}
                key={step.number}
                onClick={() => onNavigate(step.id)}
                type="button"
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
                    isActive
                      ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30'
                      : isComplete
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-slate-900 text-slate-600 group-hover:text-slate-400'
                  }`}
                >
                  {step.number}
                </span>
                <span className="flex min-w-0 items-center gap-2.5">
                  <Icon name={step.icon} size={16} />
                  <span className="text-xs font-medium">{step.label}</span>
                </span>
                {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" />}
              </button>
            )
          })}
        </nav>

        <div className="mt-7 hidden rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 lg:block">
          <div className="flex items-center gap-2 text-slate-400">
            <Icon name="code" size={15} />
            <span className="text-[11px] font-medium">Repository analysis</span>
          </div>
          <p className="mt-2 text-[11px] leading-5 text-slate-600">Your project workspace will appear here once a repository is connected.</p>
        </div>
      </div>
    </aside>
  )
}

export default WorkflowSidebar
