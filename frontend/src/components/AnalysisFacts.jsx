import Icon from './Icon'

function AnalysisFacts({ analysis }) {
  const directories = analysis.structure?.directories || []
  const files = analysis.important_files || []

  return (
    <section aria-labelledby="analysis-facts-heading" className="mt-5 grid gap-5 xl:grid-cols-3">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/45 p-5 shadow-xl shadow-slate-950/10 sm:p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-400">Static facts</p>
        <h2 className="mt-2 text-base font-semibold text-slate-100" id="analysis-facts-heading">Detected languages</h2>
        <div className="mt-4 space-y-2">
          {analysis.languages.length > 0 ? analysis.languages.map(({ name, file_count }) => <div className="flex items-center justify-between gap-3 text-xs" key={name}><span className="text-slate-400">{name}</span><span className="font-mono text-slate-500">{file_count} files</span></div>) : <p className="text-xs text-slate-500">No recognized languages detected.</p>}
        </div>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/45 p-5 shadow-xl shadow-slate-950/10 sm:p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-400">Project structure</p>
        <h2 className="mt-2 text-base font-semibold text-slate-100">Directories</h2>
        <div className="mt-4 flex max-h-28 flex-wrap content-start gap-2 overflow-auto">
          {directories.length > 0 ? directories.map((directory) => <span className="rounded-md border border-slate-800 bg-slate-950/60 px-2 py-1 font-mono text-[10px] text-slate-400" key={directory}><Icon name="folder" size={11} className="mr-1 inline" />{directory}</span>) : <p className="text-xs text-slate-500">No nested directories detected.</p>}
        </div>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/45 p-5 shadow-xl shadow-slate-950/10 sm:p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-400">Project structure</p>
        <h2 className="mt-2 text-base font-semibold text-slate-100">Important files</h2>
        <div className="mt-4 flex max-h-28 flex-wrap content-start gap-2 overflow-auto">
          {files.length > 0 ? files.map((file) => <span className="rounded-md border border-slate-800 bg-slate-950/60 px-2 py-1 font-mono text-[10px] text-slate-400" key={file}><Icon name="code" size={11} className="mr-1 inline" />{file}</span>) : <p className="text-xs text-slate-500">No recognized important files detected.</p>}
        </div>
      </div>
    </section>
  )
}

export default AnalysisFacts