import { useState } from 'react'
import Icon from './Icon'
import ProjectManager from './ProjectManager'
import AnswerPanel from './AnswerPanel'
import InterviewQuestionCard from './InterviewQuestionCard'
import InterviewSummary from './InterviewSummary'
import { interviewQuestions, interviewSummary } from './interviewData'

function InterviewWorkspace({ projectManagerProps }) {
  const [questionIndex, setQuestionIndex] = useState(0)
  const [isAnswerVisible, setIsAnswerVisible] = useState(false)
  const currentQuestion = interviewQuestions[questionIndex]

  function handleNextQuestion() {
    setQuestionIndex((index) => (index + 1) % interviewQuestions.length)
    setIsAnswerVisible(false)
  }

  return (
    <main className="min-w-0 flex-1 bg-slate-950">
      <div className="mx-auto max-w-[1280px] px-4 py-5 sm:px-6 sm:py-7 lg:px-10 lg:py-9">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600" aria-label="Breadcrumb">
          <span>Workspace</span>
          <Icon name="chevronRight" size={13} />
          <span className="text-slate-400">Interview Prep</span>
          <span className="ml-1 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-2 py-0.5 text-[10px] font-medium text-indigo-300">Active</span>
        </div>

        <div className="mt-7 flex flex-col justify-between gap-5 border-b border-slate-800/90 pb-7 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium text-indigo-400">Interview workspace</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-100 sm:text-3xl">Interview Preparation</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Practice explaining your project decisions, tradeoffs, and technical boundaries with focused, project-shaped questions.</p>
          </div>
          <div className="hidden items-center gap-2 text-xs text-slate-600 sm:flex"><span className="h-2 w-2 rounded-full bg-indigo-400" />Presentation-only practice context</div>
        </div>

        <InterviewSummary current={questionIndex + 1} summary={interviewSummary} />

        <section aria-labelledby="current-question-heading" className="mt-7">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">Practice prompt</p><h2 className="mt-1 text-sm font-semibold text-slate-200" id="current-question-heading">Current question</h2></div>
            <span className="font-mono text-[10px] text-slate-600">LOCAL QUESTION SET</span>
          </div>
          <InterviewQuestionCard key={currentQuestion.id} question={currentQuestion} questionNumber={questionIndex + 1} />

          <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400/40" onClick={() => setIsAnswerVisible((visible) => !visible)} type="button">
              <Icon name="sparkles" size={15} />{isAnswerVisible ? 'Hide Example Answer' : 'Reveal Answer'}
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/15 transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50" onClick={handleNextQuestion} type="button">
              Next Question <Icon name="arrowUpRight" size={15} />
            </button>
          </div>
          {isAnswerVisible && <AnswerPanel question={currentQuestion} />}
        </section>

        <ProjectManager {...projectManagerProps} />
      </div>
    </main>
  )
}

export default InterviewWorkspace