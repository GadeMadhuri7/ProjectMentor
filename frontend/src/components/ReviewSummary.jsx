import Icon from './Icon'

const accentStyles = {
  amber: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
  blue: 'border-blue-400/20 bg-blue-400/10 text-blue-300',
  emerald: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  indigo: 'border-indigo-400/20 bg-indigo-400/10 text-indigo-300',
  rose: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
}

const icons = {
  amber: 'activity',
  blue: 'layers',
  emerald: 'folder',
  indigo: 'search',
  rose: 'code',
}

function ReviewSummary({ isAnalyzed, summary }) {
  return (
    <section aria-labelledby="review-summary-heading" className="mt-6">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">Review pulse</p>
          <h2 className="mt-1 text-sm font-semibold text-slate-200" id="review-summary-heading">Finding summary</h2>
        </div>
        <span className="hidden rounded-full border border-slate-800 bg-slate-900/60 px-2.5 py-1 font-mono text-[10px] text-slate-600 sm:inline-flex">{isAnalyzed ? 'STATIC ANALYSIS' : 'MOCK REVIEW'}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {summary.map((item) => (
          <article className="rounded-2xl border border-slate-800 bg-slate-900/45 p-4 transition hover:border-slate-700 hover:bg-slate-900/70" key={item.label}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">{item.label}</p>
              <span className={`rounded-lg border p-1.5 ${accentStyles[item.accent]}`}><Icon name={icons[item.accent]} size={14} /></span>
            </div>
            <p className="mt-4 font-mono text-2xl font-semibold text-slate-100">{item.value}</p>
            <p className="mt-1 text-[11px] text-slate-500">{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ReviewSummary