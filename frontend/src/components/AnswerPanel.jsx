import Icon from './Icon'

function AnswerPanel({ question }) {
  return (
    <section aria-labelledby="answer-heading" className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-5 sm:p-6">
      <div className="flex items-center gap-2 text-emerald-300">
        <Icon name="sparkles" size={16} />
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em]" id="answer-heading">Example answer</h2>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{question.mockAnswer}</p>
      <div className="mt-5 border-t border-emerald-400/10 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-400">Key points</p>
        <ul className="mt-2 grid gap-2 sm:grid-cols-3">
          {question.keyPoints.map((point) => <li className="flex gap-2 text-xs leading-5 text-slate-500" key={point}><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />{point}</li>)}
        </ul>
      </div>
      <p className="mt-4 font-mono text-[10px] text-slate-600">MOCK INTERVIEW CONTENT</p>
    </section>
  )
}

export default AnswerPanel