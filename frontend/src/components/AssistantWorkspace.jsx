import { useState } from 'react'
import Icon from './Icon'

const exampleQuestions = [
  'How does this project connect to MySQL?',
  'Explain the main project structure.',
  'Which files are important for understanding the backend?',
  'What technologies were detected?',
  'What should I investigate next?',
]

const MAX_QUESTION_LENGTH = 2000

function AssistantWorkspace({
  activeProject,
  conversation,
  error,
  isSending,
  onClear,
  onNavigate,
  onSend,
}) {
  const [draft, setDraft] = useState('')

  async function submitQuestion(question = draft) {
    const trimmedQuestion = question.trim()
    if (!trimmedQuestion || trimmedQuestion.length > MAX_QUESTION_LENGTH || !activeProject || isSending) return

    const succeeded = await onSend(trimmedQuestion)
    if (succeeded) setDraft('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    submitQuestion()
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submitQuestion()
    }
  }

  return (
    <main className="min-w-0 flex-1 bg-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-65px)] max-w-[1280px] flex-col px-4 py-5 sm:px-6 sm:py-7 lg:px-10 lg:py-9">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600" aria-label="Breadcrumb">
          <span>Workspace</span>
          <Icon name="chevronRight" size={13} />
          <span className="text-slate-400">AI Assistant</span>
          <span className="ml-1 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-2 py-0.5 text-[10px] font-medium text-indigo-300">Active</span>
        </div>

        <div className="mt-7 flex flex-col justify-between gap-4 border-b border-slate-800/90 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium text-indigo-400">ProjectMentor assistant</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-100 sm:text-3xl">AI Project Assistant</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Ask follow-up questions grounded in the analyzed source and inspect the files behind each answer.
            </p>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-800 px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-slate-700 hover:bg-slate-900 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40 sm:self-auto"
            disabled={(!conversation.length && !error) || isSending}
            onClick={onClear}
            type="button"
          >
            <Icon name="refresh" size={14} />
            Clear conversation
          </button>
        </div>

        <section className="mt-5 flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900/30" aria-label="Project assistant conversation">
          {activeProject && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-4 py-3 sm:px-5">
              <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500">
                <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                <span>Project context</span>
                <span className="truncate font-mono text-slate-300">{activeProject.name}</span>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-600">Evidence-grounded</span>
            </div>
          )}

          {!activeProject ? (
            <div className="flex flex-1 flex-col items-center justify-center px-5 py-14 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/[0.06] text-amber-300">
                <Icon name="folder" size={21} />
              </span>
              <h2 className="mt-4 text-base font-semibold text-slate-100">Choose a project first</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Create a project in the repository workspace before asking project-specific questions.</p>
              <button
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                onClick={() => onNavigate('upload')}
                type="button"
              >
                Open Upload Repository <Icon name="arrowUpRight" size={14} />
              </button>
            </div>
          ) : (
            <div className="flex flex-1 flex-col">
              <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6" aria-live="polite" aria-relevant="additions">
                {conversation.length === 0 && !isSending && (
                  <div className="mx-auto flex max-w-2xl flex-col items-center py-7 text-center sm:py-10">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-400/[0.07] text-indigo-300">
                      <Icon name="sparkles" size={21} />
                    </span>
                    <h2 className="mt-4 text-base font-semibold text-slate-100">Start with your project</h2>
                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Each question is checked against this project&apos;s retrieved source evidence. Follow-ups use recent conversation for context.</p>
                    <div className="mt-6 grid w-full gap-2 text-left sm:grid-cols-2">
                      {exampleQuestions.map((question) => (
                        <button
                          className="rounded-lg border border-slate-800 bg-slate-950/45 px-3.5 py-3 text-left text-xs leading-5 text-slate-400 transition hover:border-indigo-400/30 hover:bg-slate-950 hover:text-slate-200"
                          key={question}
                          onClick={() => setDraft(question)}
                          type="button"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {conversation.map((message, index) => (
                  <article className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`} key={`${message.role}-${index}`}>
                    <div className={`min-w-0 max-w-[min(100%,760px)] rounded-xl border px-4 py-3.5 sm:px-5 ${message.role === 'user' ? 'border-indigo-400/20 bg-indigo-500/[0.09]' : 'border-slate-800 bg-slate-950/60'}`}>
                      <div className={`mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] ${message.role === 'user' ? 'text-indigo-300' : 'text-emerald-300'}`}>
                        {message.role === 'assistant' && <Icon name="sparkles" size={13} />}
                        {message.role === 'user' ? 'You' : 'ProjectMentor'}
                      </div>
                      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-200">{message.content}</p>
                      {message.role === 'assistant' && message.evidence?.length > 0 && (
                        <div className="mt-4 border-t border-slate-800 pt-3">
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Evidence</p>
                          <ul className="grid gap-2 sm:grid-cols-2">
                            {message.evidence.map((item) => (
                              <li className="min-w-0 rounded-lg border border-slate-800/80 bg-slate-900/55 px-3 py-2.5" key={`${item.path}-${item.chunk_index}-${item.start_line}`}>
                                <p className="break-all font-mono text-xs text-indigo-300">{item.path}</p>
                                <p className="mt-1 text-[11px] text-slate-500">Lines {item.start_line}–{item.end_line}</p>
                                {typeof item.similarity === 'number' && <p className="mt-1 font-mono text-[10px] text-slate-600">Similarity {item.similarity.toFixed(2)}</p>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </article>
                ))}

                {isSending && (
                  <div className="flex justify-start" role="status">
                    <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-slate-400">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400" />
                      Searching project evidence...
                    </div>
                  </div>
                )}
                {error && (
                  <div className="rounded-lg border border-rose-400/20 bg-rose-400/[0.06] px-4 py-3 text-xs leading-5 text-rose-300" role="alert">
                    {error} Your question is still in the composer so you can retry.
                  </div>
                )}
              </div>

              <form className="border-t border-slate-800 bg-slate-950/55 p-3 sm:p-4" onSubmit={handleSubmit}>
                <label className="sr-only" htmlFor="assistant-question">Ask about this project</label>
                <div className="flex flex-col gap-2 rounded-xl border border-slate-700/90 bg-slate-950 px-3 py-2 focus-within:border-indigo-400/50 sm:flex-row sm:items-end sm:gap-3 sm:px-4">
                  <textarea
                    className="max-h-40 min-h-12 min-w-0 flex-1 resize-y border-0 bg-transparent px-0 py-2 text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-600 focus:ring-0 disabled:cursor-wait disabled:opacity-60"
                    disabled={isSending}
                    id="assistant-question"
                    maxLength={MAX_QUESTION_LENGTH}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question about the analyzed project..."
                    rows={2}
                    value={draft}
                  />
                  <button
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 disabled:cursor-not-allowed disabled:opacity-45 sm:mb-0.5"
                    disabled={!draft.trim() || draft.length > MAX_QUESTION_LENGTH || isSending}
                    type="submit"
                  >
                    <Icon name="arrowUpRight" size={15} />
                    {isSending ? 'Sending...' : 'Send'}
                  </button>
                </div>
                <div className="mt-2 flex justify-between gap-3 px-1 text-[10px] text-slate-600">
                  <span>Enter to send · Shift+Enter for a new line</span>
                  <span>{draft.length}/{MAX_QUESTION_LENGTH}</span>
                </div>
              </form>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default AssistantWorkspace
