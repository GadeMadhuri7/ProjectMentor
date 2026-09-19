const difficultyStyles = {
  Easy: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  Hard: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
  Medium: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
}

function DifficultyBadge({ difficulty }) {
  return <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${difficultyStyles[difficulty]}`}>{difficulty}</span>
}

export default DifficultyBadge