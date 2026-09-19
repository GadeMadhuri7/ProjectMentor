import Icon from './Icon'
import EvidenceBlock from './EvidenceBlock'
import FindingBadge from './FindingBadge'

function FindingCard({ finding }) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/45 p-5 shadow-xl shadow-slate-950/10 transition hover:border-slate-700 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="rounded-lg border border-slate-800 bg-slate-950/70 p-2 text-slate-400"><Icon name={finding.icon} size={17} /></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <FindingBadge tone={finding.categoryTone}>{finding.category}</FindingBadge>
            <FindingBadge tone={finding.severityTone}>{finding.severity}</FindingBadge>
          </div>
          <h3 className="mt-3 text-sm font-semibold text-slate-100">{finding.title}</h3>
          <p className="mt-1.5 text-xs leading-5 text-slate-500">{finding.description}</p>
        </div>
      </div>
      <EvidenceBlock evidence={finding.evidence} />
    </article>
  )
}

export default FindingCard