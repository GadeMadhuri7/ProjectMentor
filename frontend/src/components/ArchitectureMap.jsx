import Icon from './Icon'
import ArchitectureNode from './ArchitectureNode'

function ArchitectureMap({ isAnalyzed, nodes }) {
  return (
    <section aria-labelledby="architecture-map-heading" className="rounded-2xl border border-slate-800 bg-slate-900/45 p-5 shadow-xl shadow-slate-950/10 sm:p-6">
      <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-400">System map</p>
          <h2 className="mt-2 text-base font-semibold text-slate-100" id="architecture-map-heading">Application architecture</h2>
        </div>
        <span className="rounded-lg border border-slate-800 bg-slate-950/60 p-2 text-slate-600"><Icon name="layers" size={16} /></span>
      </div>
      <div className="relative mt-6 flex flex-col gap-3 sm:mx-auto sm:max-w-md sm:gap-0 sm:py-2">
        <div className="absolute bottom-12 left-1/2 top-12 hidden w-px -translate-x-1/2 bg-gradient-to-b from-blue-400/50 via-indigo-400/50 to-amber-400/50 sm:block" aria-hidden="true" />
        {nodes.map((node, index) => (
          <div className="relative sm:py-3" key={node.name}>
            <ArchitectureNode {...node} />
            {index < nodes.length - 1 && (
              <div className="flex h-7 items-center justify-center text-indigo-400 sm:absolute sm:inset-x-0 sm:top-full sm:z-20 sm:h-6">
                <Icon name="chevronDown" size={15} />
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="mt-5 border-t border-slate-800/80 pt-4 text-center font-mono text-[10px] text-slate-600">{isAnalyzed ? 'STATIC ANALYSIS FACTS' : 'CLIENT &rarr; SERVICE &rarr; PERSISTENCE'}</p>
    </section>
  )
}

export default ArchitectureMap