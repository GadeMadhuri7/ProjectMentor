import Icon from './Icon'

function InsightCard({ category, description, icon, title }) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 transition hover:border-slate-700">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 rounded-lg bg-indigo-400/10 p-2 text-indigo-300"><Icon name={icon} size={15} /></span>
        <div>
          <span className="rounded-full border border-indigo-400/20 bg-indigo-400/10 px-2 py-0.5 text-[10px] font-medium text-indigo-300">{category}</span>
          <h3 className="mt-3 text-sm font-semibold text-slate-200">{title}</h3>
          <p className="mt-1.5 text-xs leading-5 text-slate-500">{description}</p>
        </div>
      </div>
    </article>
  )
}

export default InsightCard