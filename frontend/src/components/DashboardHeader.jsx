import Icon from './Icon'

function DashboardHeader({ activeProject, onMenuToggle }) {
  return (
    <header className="border-b border-slate-800/90 bg-slate-950/95 px-4 py-3 shadow-2xl shadow-slate-950/20 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            aria-label="Toggle workflow navigation"
            className="rounded-lg border border-slate-800 p-2 text-slate-400 transition hover:border-slate-700 hover:bg-slate-900 hover:text-slate-100 lg:hidden"
            onClick={onMenuToggle}
            type="button"
          >
            <Icon name="menu" />
          </button>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-lg font-bold text-white shadow-lg shadow-indigo-500/20">
            P
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-slate-100">ProjectMentor</p>
            <p className="hidden truncate text-xs text-slate-500 sm:block">AI Architect &amp; Interview Workspace</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden min-w-0 items-center gap-3 border-l border-slate-800 pl-4 md:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-slate-400">
              <Icon name="folder" size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-600">Repository context</p>
              <p className="max-w-48 truncate text-xs font-medium text-slate-300">
                {activeProject?.name || 'No repository selected'}
              </p>
            </div>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-indigo-400/60 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            type="button"
          >
            <Icon name="refresh" size={15} />
            <span className="hidden sm:inline">Rescan Repository</span>
            <span className="sm:hidden">Rescan</span>
          </button>
          <div className="hidden h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-400 sm:flex">
            <Icon name="user" size={16} />
          </div>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
