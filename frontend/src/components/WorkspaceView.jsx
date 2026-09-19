import Icon from './Icon'
import ProjectManager from './ProjectManager'
import ArchitectureMap from './ArchitectureMap'
import InsightsPanel from './InsightsPanel'
import TechnologySummary from './TechnologySummary'
import { architectureInsights, architectureNodes, technologySummaries } from './architectureData'

function WorkspaceView({ projectManagerProps }) {
  return (
    <main className="min-w-0 flex-1 bg-slate-950">
      <div className="mx-auto max-w-[1280px] px-4 py-5 sm:px-6 sm:py-7 lg:px-10 lg:py-9">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600" aria-label="Breadcrumb">
          <span>Workspace</span>
          <Icon name="chevronRight" size={13} />
          <span className="text-slate-400">Understand</span>
          <span className="ml-1 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-2 py-0.5 text-[10px] font-medium text-indigo-300">Active</span>
        </div>

        <div className="mt-7 flex flex-col justify-between gap-5 border-b border-slate-800/90 pb-7 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium text-indigo-400">Architecture workspace</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-100 sm:text-3xl">Understand &amp; Architecture</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Explore your project structure and build a clear mental model of how the pieces fit together.</p>
          </div>
          <div className="hidden items-center gap-2 text-xs text-slate-600 sm:flex">
            <span className="h-2 w-2 rounded-full bg-slate-700" />
            Awaiting repository analysis
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 border-b border-slate-800/90">
          <div className="flex items-center gap-6">
            <button className="relative pb-3 text-xs font-semibold text-indigo-300 after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-indigo-400" type="button">
              <span className="inline-flex items-center gap-2"><Icon name="layers" size={15} />Diagram Map</span>
            </button>
            <button className="pb-3 text-xs font-medium text-slate-600 transition hover:text-slate-300" type="button">
              <span className="inline-flex items-center gap-2"><Icon name="folder" size={15} />Files Tree</span>
            </button>
          </div>
          <button aria-label="Search workspace" className="mb-2 rounded-lg p-2 text-slate-600 transition hover:bg-slate-900 hover:text-slate-300" type="button">
            <Icon name="search" size={16} />
          </button>
        </div>

        <TechnologySummary technologies={technologySummaries} />

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
          <ArchitectureMap nodes={architectureNodes} />
          <InsightsPanel insights={architectureInsights} />
        </div>

        <ProjectManager {...projectManagerProps} />
      </div>
    </main>
  )
}

export default WorkspaceView
