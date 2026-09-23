import Icon from './Icon'

const accentStyles = {
  amber: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
  blue: 'border-blue-400/20 bg-blue-400/10 text-blue-300',
  cyan: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300',
  emerald: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  indigo: 'border-indigo-400/20 bg-indigo-400/10 text-indigo-300',
  rose: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
  slate: 'border-slate-700 bg-slate-900 text-slate-400',
}

const icons = {
  amber: 'activity',
  blue: 'layers',
  cyan: 'activity',
  emerald: 'folder',
  indigo: 'sparkles',
  rose: 'code',
  slate: 'activity',
}

function ImprovementSummary({ isAnalyzed, summary }) {
  return (
    <section aria-labelledby="improvement-summary-heading" className="mt-6">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">Action pulse</p>
          <h2 className="mt-1 text-sm font-semibold text-slate-200" id="improvement-summary-heading">Improvement summary</h2>
        </div>
        <span className="hidden rounded-full border border-slate-800 bg-slate-900/60 px-2.5 py-1 font-mono text-[10px] text-slate-600 sm:inline-flex">{isAnalyzed ? 'STATIC ANALYSIS' : 'MOCK ACTIONS'}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {summary.categories.map((item) => (
          <article className="rounded-2xl border border-slate-800 bg-slate-900/45 p-4 transition hover:border-slate-700 hover:bg-slate-900/70" key={item.label}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">{item.label}</p>
              <span className={`rounded-lg border p-1.5 ${accentStyles[item.accent]}`}><Icon name={icons[item.accent]} size={14} /></span>
            </div>
            <p className="mt-4 font-mono text-2xl font-semibold text-slate-100">{item.value}</p>
            <p className="mt-1 text-[11px] text-slate-500">{item.detail}</p>
          </article>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-slate-800 bg-slate-900/30 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">{isAnalyzed ? 'Evidence basis' : 'Priority queue'}</p>
        {(isAnalyzed ? summary.evidence : summary.priorities).map((item) => (
          <span className="inline-flex items-center gap-2" key={item.label}>
            <span className={`h-1.5 w-1.5 ${isAnalyzed ? 'rounded-full bg-indigo-400' : `rounded-full ${item.accent === 'rose' ? 'bg-rose-400' : item.accent === 'amber' ? 'bg-amber-400' : 'bg-slate-500'}`}`} />
            <span className="text-xs text-slate-500">{item.label}</span>
            <span className={`rounded-md border px-1.5 py-0.5 font-mono text-[10px] ${accentStyles[item.accent]}`}>{item.value}</span>
          </span>
        ))}
      </div>
    </section>
  )
}

export default ImprovementSummary