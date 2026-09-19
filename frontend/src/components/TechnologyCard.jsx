import Icon from './Icon'

const accentStyles = {
  amber: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
  blue: 'border-blue-400/20 bg-blue-400/10 text-blue-300',
  emerald: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  indigo: 'border-indigo-400/20 bg-indigo-400/10 text-indigo-300',
}

function TechnologyCard({ detail, icon, label, value, accent }) {
  return (
    <article className="group rounded-2xl border border-slate-800 bg-slate-900/45 p-4 transition hover:border-slate-700 hover:bg-slate-900/70">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">{label}</p>
        <span className={`rounded-lg border p-2 ${accentStyles[accent]}`}>
          <Icon name={icon} size={16} />
        </span>
      </div>
      <p className="mt-5 font-mono text-sm font-semibold text-slate-200">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </article>
  )
}

export default TechnologyCard