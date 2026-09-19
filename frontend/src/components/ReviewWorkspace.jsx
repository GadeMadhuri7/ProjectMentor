import Icon from './Icon'
import ProjectManager from './ProjectManager'
import FindingCard from './FindingCard'
import ReviewSummary from './ReviewSummary'
import { reviewFindings, reviewSummary } from './reviewData'

function ReviewWorkspace({ projectManagerProps }) {
  return (
    <main className="min-w-0 flex-1 bg-slate-950">
      <div className="mx-auto max-w-[1280px] px-4 py-5 sm:px-6 sm:py-7 lg:px-10 lg:py-9">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600" aria-label="Breadcrumb">
          <span>Workspace</span>
          <Icon name="chevronRight" size={13} />
          <span className="text-slate-400">Review Findings</span>
          <span className="ml-1 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-2 py-0.5 text-[10px] font-medium text-indigo-300">Active</span>
        </div>

        <div className="mt-7 flex flex-col justify-between gap-5 border-b border-slate-800/90 pb-7 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium text-indigo-400">Evidence workspace</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-100 sm:text-3xl">Review Findings</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Connect each project finding to its supporting evidence, expected impact, and the questions worth investigating next.</p>
          </div>
          <div className="hidden items-center gap-2 text-xs text-slate-600 sm:flex">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Presentation-only review context
          </div>
        </div>

        <ReviewSummary summary={reviewSummary} />

        <section aria-labelledby="findings-heading" className="mt-7">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">Evidence ledger</p>
              <h2 className="mt-1 text-sm font-semibold text-slate-200" id="findings-heading">Findings to review</h2>
            </div>
            <span className="font-mono text-[10px] text-slate-600">{reviewFindings.length.toString().padStart(2, '0')} EXAMPLES</span>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {reviewFindings.map((finding) => <FindingCard finding={finding} key={finding.title} />)}
          </div>
        </section>

        <ProjectManager {...projectManagerProps} />
      </div>
    </main>
  )
}

export default ReviewWorkspace