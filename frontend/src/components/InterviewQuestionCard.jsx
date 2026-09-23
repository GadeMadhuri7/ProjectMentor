import Icon from './Icon'
import DifficultyBadge from './DifficultyBadge'

const categoryStyles = {
  API: 'border-indigo-400/20 bg-indigo-400/10 text-indigo-300',
  Architecture: 'border-blue-400/20 bg-blue-400/10 text-blue-300',
  Backend: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300',
  Database: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
  Frontend: 'border-blue-400/20 bg-blue-400/10 text-blue-300',
  'Project Design': 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  Security: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
}

function InterviewQuestionCard({ question, questionNumber }) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/45 p-5 shadow-xl shadow-slate-950/10 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] font-semibold text-slate-600">QUESTION {String(questionNumber).padStart(2, '0')}</span>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${categoryStyles[question.category] || 'border-indigo-400/20 bg-indigo-400/10 text-indigo-300'}`}>{question.category}</span>
          <DifficultyBadge difficulty={question.difficulty} />
        </div>
        <span className="rounded-lg border border-slate-800 bg-slate-950/70 p-2 text-slate-600"><Icon name="user" size={16} /></span>
      </div>
      <h2 className="mt-5 max-w-3xl text-lg font-semibold leading-7 text-slate-100 sm:text-xl">{question.question}</h2>
      <div className="mt-5 grid gap-3 border-t border-slate-800/80 pt-4 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">Related project area</p>
          <p className="mt-1.5 text-xs text-slate-400">{question.relatedArea}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">Related file / evidence</p>
          <p className="mt-1.5 break-all font-mono text-xs text-indigo-300">{question.relatedFile}</p>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-slate-800/90 bg-slate-950/55 p-4">
        <div className="flex items-center gap-2 text-amber-300"><Icon name="activity" size={14} /><span className="text-[10px] font-semibold uppercase tracking-[0.16em]">Why this may be asked</span></div>
        <p className="mt-2 text-xs leading-5 text-slate-500">{question.whyAsked}</p>
      </div>
    </article>
  )
}

export default InterviewQuestionCard