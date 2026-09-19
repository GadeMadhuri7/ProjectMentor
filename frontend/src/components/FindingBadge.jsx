const badgeStyles = {
  amber: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
  blue: 'border-blue-400/20 bg-blue-400/10 text-blue-300',
  emerald: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  indigo: 'border-indigo-400/20 bg-indigo-400/10 text-indigo-300',
  rose: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
}

function FindingBadge({ children, tone = 'indigo' }) {
  return <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${badgeStyles[tone]}`}>{children}</span>
}

export default FindingBadge