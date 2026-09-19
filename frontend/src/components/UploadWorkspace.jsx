import { useState } from 'react'
import Icon from './Icon'
import ProjectManager from './ProjectManager'
import AnalysisSummary from './AnalysisSummary'

function UploadWorkspace({ analysis, analysisError, isAnalyzing, onAnalyze, projectManagerProps }) {
  const [selectedFile, setSelectedFile] = useState(null)

  function handleSubmit(event) {
    event.preventDefault()
    if (selectedFile) onAnalyze(selectedFile)
  }

  return (
    <main className="min-w-0 flex-1 bg-slate-950">
      <div className="mx-auto max-w-[1280px] px-4 py-5 sm:px-6 sm:py-7 lg:px-10 lg:py-9">
        <div className="flex items-center gap-2 text-xs text-slate-600" aria-label="Breadcrumb"><span>Workspace</span><Icon name="chevronRight" size={13} /><span className="text-slate-400">Upload Repository</span><span className="ml-1 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-2 py-0.5 text-[10px] font-medium text-indigo-300">Active</span></div>
        <div className="mt-7 border-b border-slate-800/90 pb-7"><p className="text-xs font-medium text-indigo-400">Project workspace</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-100 sm:text-3xl">Upload Repository</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Create a project context to begin exploring its architecture, evidence, improvements, and interview questions.</p></div>
        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/45 p-5 shadow-xl shadow-slate-950/10 sm:p-6" aria-labelledby="analysis-upload-heading">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-400">Static inspection</p><h2 className="mt-2 text-base font-semibold text-slate-100" id="analysis-upload-heading">Analyze a project archive</h2><p className="mt-2 text-xs leading-5 text-slate-500">ZIP files are inspected as untrusted data. Project code is never executed and dependencies are never installed.</p></div>
            <span className="rounded-lg bg-indigo-500/10 p-2 text-indigo-300"><Icon name="upload" size={16} /></span>
          </div>
          <form className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleSubmit}>
            <div className="min-w-0 flex-1"><label className="block text-xs font-medium text-slate-400" htmlFor="project-archive">Project ZIP archive</label><input accept=".zip,application/zip" className="mt-2 block w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-xs text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-slate-800 file:px-2 file:py-1 file:text-xs file:font-medium file:text-slate-300" disabled={isAnalyzing} id="project-archive" onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} type="file" /></div>
            <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/15 transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 disabled:cursor-not-allowed disabled:opacity-50" disabled={!selectedFile || isAnalyzing} type="submit"><Icon name="activity" size={15} />{isAnalyzing ? 'Analyzing...' : 'Analyze project'}</button>
          </form>
          {analysisError && <p className="mt-4 text-xs text-rose-400">{analysisError}</p>}
        </section>
        {analysis && <AnalysisSummary analysis={analysis} />}
        <ProjectManager {...projectManagerProps} />
      </div>
    </main>
  )
}

export default UploadWorkspace