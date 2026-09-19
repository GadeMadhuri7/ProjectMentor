import TechnologyCard from './TechnologyCard'

function TechnologySummary({ technologies }) {
  return (
    <section aria-labelledby="technology-summary-heading" className="mt-6">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">Architecture signals</p>
          <h2 className="mt-1 text-sm font-semibold text-slate-200" id="technology-summary-heading">Technology summary</h2>
        </div>
        <span className="hidden rounded-full border border-slate-800 bg-slate-900/60 px-2.5 py-1 font-mono text-[10px] text-slate-600 sm:inline-flex">MOCK CONTEXT</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {technologies.map((technology) => <TechnologyCard key={technology.label} {...technology} />)}
      </div>
    </section>
  )
}

export default TechnologySummary