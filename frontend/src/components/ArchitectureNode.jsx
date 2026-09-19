import Icon from './Icon'

const nodeStyles = {
  amber: 'border-amber-400/25 bg-amber-400/[0.06] text-amber-300',
  blue: 'border-blue-400/25 bg-blue-400/[0.06] text-blue-300',
  indigo: 'border-indigo-400/25 bg-indigo-400/[0.06] text-indigo-300',
}

function ArchitectureNode({ description, icon, name, accent }) {
  return (
    <div className={`relative z-10 flex min-w-0 items-center gap-3 rounded-xl border p-3.5 transition hover:-translate-y-0.5 hover:bg-slate-800/80 ${nodeStyles[accent]}`}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-950/70">
        <Icon name={icon} size={18} />
      </span>
      <span className="min-w-0">
        <span className="block truncate font-mono text-xs font-semibold text-slate-200">{name}</span>
        <span className="mt-1 block truncate text-[11px] text-slate-500">{description}</span>
      </span>
    </div>
  )
}

export default ArchitectureNode