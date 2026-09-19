import Icon from './Icon'

function EvidenceBlock({ evidence }) {
  return (
    <div className="mt-4 rounded-xl border border-slate-800/90 bg-slate-950/55 p-4">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon name="code" size={14} />
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em]">Evidence context</span>
      </div>
      <p className="mt-3 break-all font-mono text-xs text-indigo-300">{evidence.source}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{evidence.description}</p>
      <div className="mt-4 grid gap-3 border-t border-slate-800/80 pt-3 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">Finding</p>
          <p className="mt-1.5 text-xs leading-5 text-slate-400">{evidence.finding}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">Impact</p>
          <p className="mt-1.5 text-xs leading-5 text-slate-400">{evidence.impact}</p>
        </div>
      </div>
    </div>
  )
}

export default EvidenceBlock