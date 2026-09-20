import Icon from './Icon'
import InsightCard from './InsightCard'

function InsightsPanel({ isAnalyzed, insights }) {
  return (
    <aside aria-labelledby="insights-heading" className="rounded-2xl border border-slate-800 bg-slate-900/45 p-5 shadow-xl shadow-slate-950/10 sm:p-6">
      <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400">{isAnalyzed ? 'Static analysis' : 'Inferred design'}</p>
          <h2 className="mt-2 text-base font-semibold text-slate-100" id="insights-heading">System notes</h2>
        </div>
        <span className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-2 text-emerald-300"><Icon name="sparkles" size={16} /></span>
      </div>
      <div className="mt-4 space-y-3">
        {insights.map((insight) => <InsightCard key={insight.title} {...insight} />)}
      </div>
      <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/15 transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50" type="button">
        Proceed to Evidence Review
        <Icon name="arrowUpRight" size={15} />
      </button>
      <p className="mt-3 text-center text-[10px] text-slate-600">{isAnalyzed ? 'Facts reported by the static analyzer' : 'Example findings for this workspace'}</p>
    </aside>
  )
}

export default InsightsPanel