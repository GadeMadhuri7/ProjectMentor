const priorityStyles = {
  amber: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
  rose: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
  slate: 'border-slate-700 bg-slate-900 text-slate-400',
}

function PriorityBadge({ children, tone = 'slate' }) {
  return <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${priorityStyles[tone]}`}>{children} priority</span>
}

export default PriorityBadge