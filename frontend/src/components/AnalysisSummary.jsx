import Icon from './Icon'

function AnalysisSummary({ analysis }) {
  return (
    <section aria-labelledby="analysis-summary-heading" className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400">Static analysis result</p>
          <h2 className="mt-2 text-base font-semibold text-slate-100" id="analysis-summary-heading">{analysis.project_name}</h2>
        </div>
        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 font-mono text-[10px] text-emerald-300">FILES INSPECTED</span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Files', analysis.total_files],
          ['Directories', analysis.total_directories],
          ['Languages', analysis.languages.length],
          ['Technologies', analysis.technologies.length],
        ].map(([label, value]) => <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3" key={label}><p className="text-[10px] uppercase tracking-[0.14em] text-slate-600">{label}</p><p className="mt-2 font-mono text-lg font-semibold text-slate-100">{value}</p></div>)}
      </div>
      <div className="mt-4 grid gap-4 border-t border-emerald-400/10 pt-4 sm:grid-cols-2">
        <div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">Detected languages</p><p className="mt-2 text-xs leading-5 text-slate-400">{analysis.languages.map((language) => `${language.name} (${language.file_count})`).join(', ') || 'None detected'}</p></div>
        <div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">Detected technologies</p><p className="mt-2 text-xs leading-5 text-slate-400">{analysis.technologies.join(', ') || 'None detected'}</p></div>
      </div>
      {analysis.important_files.length > 0 && <div className="mt-4 border-t border-emerald-400/10 pt-4"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">Important files</p><div className="mt-2 flex flex-wrap gap-2">{analysis.important_files.slice(0, 12).map((file) => <span className="rounded-md border border-slate-800 bg-slate-950/60 px-2 py-1 font-mono text-[10px] text-indigo-300" key={file}><Icon name="code" size={11} className="mr-1 inline" />{file}</span>)}</div></div>}
    </section>
  )
}

export default AnalysisSummary