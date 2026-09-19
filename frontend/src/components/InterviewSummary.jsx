import Icon from './Icon'

function InterviewSummary({ current, summary }) {
  const progress = (current / summary.total) * 100

  return (
    <section aria-labelledby="interview-summary-heading" className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/45 p-5 shadow-xl shadow-slate-950/10 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-400">Practice pulse</p>
          <h2 className="mt-2 text-base font-semibold text-slate-100" id="interview-summary-heading">Interview progress</h2>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-indigo-400/20 bg-indigo-400/10 px-3 py-2 text-indigo-300">
          <Icon name="activity" size={15} />
          <span className="font-mono text-xs">{current} / {summary.total}</span>
        </div>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-950">
        <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-400 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['Total questions', summary.total, 'indigo'],
          ['Easy', summary.easy, 'emerald'],
          ['Medium', summary.medium, 'amber'],
          ['Hard', summary.hard, 'rose'],
        ].map(([label, value, tone]) => (
          <div className="flex items-center justify-between gap-3 border-t border-slate-800/80 pt-3" key={label}>
            <span className="text-[11px] text-slate-500">{label}</span>
            <span className={`font-mono text-sm font-semibold ${tone === 'emerald' ? 'text-emerald-300' : tone === 'amber' ? 'text-amber-300' : tone === 'rose' ? 'text-rose-300' : 'text-indigo-300'}`}>{value}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default InterviewSummary