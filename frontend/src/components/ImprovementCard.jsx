import Icon from './Icon'
import PriorityBadge from './PriorityBadge'

const categoryStyles = {
  amber: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
  blue: 'border-blue-400/20 bg-blue-400/10 text-blue-300',
  cyan: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300',
  emerald: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  rose: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
}

function ImprovementCard({ suggestion }) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/45 p-5 shadow-xl shadow-slate-950/10 transition hover:border-slate-700 hover:bg-slate-900/60 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="rounded-lg border border-slate-800 bg-slate-950/70 p-2 text-slate-400"><Icon name={suggestion.icon} size={17} /></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${categoryStyles[suggestion.categoryTone]}`}>{suggestion.category}</span>
            <PriorityBadge tone={suggestion.priorityTone}>{suggestion.priority}</PriorityBadge>
          </div>
          <h3 className="mt-3 text-sm font-semibold text-slate-100">{suggestion.title}</h3>
          <p className="mt-1.5 text-xs leading-5 text-slate-500">{suggestion.description}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-4 text-[10px]">
        <span className="rounded-md border border-slate-800 bg-slate-950/60 px-2 py-1 font-medium uppercase tracking-[0.12em] text-slate-600">Finding</span>
        <Icon name="arrowUpRight" size={13} className="text-slate-700" />
        <span className="rounded-md border border-slate-800 bg-slate-950/60 px-2 py-1 font-medium uppercase tracking-[0.12em] text-slate-600">Improvement</span>
        <Icon name="arrowUpRight" size={13} className="text-indigo-400" />
        <span className="rounded-md border border-indigo-400/20 bg-indigo-400/10 px-2 py-1 font-medium uppercase tracking-[0.12em] text-indigo-300">Suggested action</span>
      </div>

      <div className="mt-3 rounded-xl border border-slate-800/90 bg-slate-950/55 p-4">
        <div className="flex items-center gap-2 text-slate-500">
          <Icon name="code" size={14} />
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em]">{suggestion.evidenceLabel}</span>
        </div>
        <p className="mt-2 break-all font-mono text-xs text-amber-300">{suggestion.relatedEvidence}</p>
        <div className="mt-4 border-t border-slate-800/80 pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-400">Suggested action</p>
          <p className="mt-1.5 text-xs leading-5 text-slate-300">{suggestion.action}</p>
        </div>
        <div className="mt-3 border-t border-slate-800/80 pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-400">Expected benefit</p>
          <p className="mt-1.5 text-xs leading-5 text-slate-500">{suggestion.benefit}</p>
        </div>
      </div>
    </article>
  )
}

export default ImprovementCard