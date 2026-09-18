import Icon from './Icon'

function ProjectManager({
  error,
  isLoading,
  isSubmitting,
  name,
  description,
  projects,
  onNameChange,
  onDescriptionChange,
  onSubmit,
}) {
  return (
    <section className="mt-8 grid gap-5 xl:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.28fr)]" aria-label="Project workspace">
      <form className="rounded-2xl border border-slate-800 bg-slate-900/45 p-5 shadow-xl shadow-slate-950/10" onSubmit={onSubmit}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-400">Workspace setup</p>
            <h2 className="mt-2 text-base font-semibold text-slate-100">Add a project</h2>
          </div>
          <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-300">
            <Icon name="folder" size={16} />
          </div>
        </div>
        <label className="block text-xs font-medium text-slate-400" htmlFor="project-name">Project name</label>
        <input
          className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-700 focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-400/10 disabled:cursor-wait disabled:opacity-60"
          disabled={isSubmitting}
          id="project-name"
          maxLength={120}
          onChange={onNameChange}
          placeholder="e.g. Mentor API"
          type="text"
          value={name}
        />
        <label className="mt-4 block text-xs font-medium text-slate-400" htmlFor="project-description">
          Description <span className="text-slate-600">(optional)</span>
        </label>
        <textarea
          className="mt-2 w-full resize-y rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-700 focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-400/10 disabled:cursor-wait disabled:opacity-60"
          disabled={isSubmitting}
          id="project-description"
          maxLength={500}
          onChange={onDescriptionChange}
          placeholder="What are you building?"
          rows="3"
          value={description}
        />
        <button
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/15 transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 disabled:cursor-wait disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          <Icon name="folder" size={15} />
          {isSubmitting ? 'Creating project...' : 'Create project'}
        </button>
      </form>

      <section className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900/45 p-5 shadow-xl shadow-slate-950/10" aria-labelledby="projects-heading">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">Connected context</p>
            <h2 className="mt-2 text-base font-semibold text-slate-100" id="projects-heading">Projects</h2>
          </div>
          {!isLoading && <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-[11px] font-semibold text-slate-400">{projects.length}</span>}
        </div>

        {error && <p className="py-6 text-sm text-rose-400">{error}</p>}
        {isLoading && <p className="py-6 text-sm text-slate-500">Loading projects...</p>}
        {!isLoading && !error && projects.length === 0 && (
          <p className="py-6 text-sm text-slate-500">No projects yet. Create your first project to begin.</p>
        )}
        {!isLoading && !error && projects.length > 0 && (
          <ul className="divide-y divide-slate-800/80">
            {projects.map((project) => (
              <li className="flex items-start justify-between gap-4 py-4 first:pt-5 last:pb-1" key={project.id}>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-medium text-slate-200">{project.name}</h3>
                  <p className="mt-1 truncate text-xs text-slate-500">{project.description || 'No description yet.'}</p>
                </div>
                <time className="shrink-0 text-[11px] text-slate-600" dateTime={project.created_at}>
                  {new Date(project.created_at).toLocaleDateString()}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  )
}

export default ProjectManager
