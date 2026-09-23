export const interviewSummary = {
  total: 12,
  easy: 4,
  medium: 5,
  hard: 3,
}

export const interviewQuestions = [
  {
    id: 'architecture-overview',
    question: 'Can you explain the overall architecture of this project?',
    category: 'Architecture',
    difficulty: 'Medium',
    relatedArea: 'Client, API, and persistence layers',
    relatedFile: 'frontend/src/components/WorkspaceView.jsx',
    whyAsked: 'This tests whether you can describe system boundaries and explain how the major pieces work together.',
    mockAnswer: 'The project is organized around a React and Vite client, a FastAPI backend, and a relational persistence layer. The frontend owns the workspace experience and calls a small API client, while backend routes coordinate project operations and database access. That separation gives each layer a clear responsibility and leaves room for future analysis workflows.',
    keyPoints: ['React and Vite provide the client workspace', 'FastAPI owns the HTTP boundary', 'Database access stays behind backend operations'],
  },
  {
    id: 'fastapi-choice',
    question: 'Why was FastAPI used for the backend?',
    category: 'Backend',
    difficulty: 'Easy',
    relatedArea: 'Python API service',
    relatedFile: 'backend/app/main.py',
    whyAsked: 'Interviewers use framework choices to understand how you weigh developer experience, contracts, and runtime needs.',
    mockAnswer: 'FastAPI is a practical fit for a Python service because it supports explicit request contracts, automatic API documentation, and an efficient development workflow. It also keeps the service surface lightweight while the product is still establishing its project and analysis flows.',
    keyPoints: ['Python aligns with the application context', 'Typed schemas make request contracts visible', 'Automatic docs improve API discoverability'],
  },
  {
    id: 'mysql-communication',
    question: 'How does the application communicate with MySQL?',
    category: 'Database',
    difficulty: 'Medium',
    relatedArea: 'Persistence and ORM access',
    relatedFile: 'backend/app/database.py',
    whyAsked: 'This reveals whether you can trace a request from an endpoint through the ORM to stored data.',
    mockAnswer: 'The backend uses SQLAlchemy as the ORM boundary for database access. Configuration creates the connection context, models describe the stored entities, and route operations use that persistence layer instead of embedding raw connection details in the client.',
    keyPoints: ['SQLAlchemy abstracts persistence operations', 'Database setup is a backend concern', 'The frontend communicates through API requests'],
  },
  {
    id: 'react-structure',
    question: 'How is the React frontend structured?',
    category: 'Frontend',
    difficulty: 'Easy',
    relatedArea: 'Dashboard shell and workspace components',
    relatedFile: 'frontend/src/App.jsx',
    whyAsked: 'A good answer demonstrates how you keep application state, layout, and reusable UI responsibilities separate.',
    mockAnswer: 'The root App component owns project-loading and creation state, then composes the dashboard header, workflow sidebar, and current workspace. Focused components render each workspace surface, while local data modules keep presentation examples separate from future API data.',
    keyPoints: ['App owns project CRUD state', 'Shell components define the shared layout', 'Workspace components keep feature UI focused'],
  },
  {
    id: 'api-communication',
    question: 'How does the frontend communicate with backend APIs?',
    category: 'API',
    difficulty: 'Medium',
    relatedArea: 'Project request client',
    relatedFile: 'frontend/src/api/client.js',
    whyAsked: 'This checks whether you can explain the contract between UI events and server operations.',
    mockAnswer: 'The frontend keeps request functions in a dedicated API client module. Components call those functions from event or effect handlers, update local loading and error state, and then render the returned project data. The architecture workspaces currently use mock presentation data and do not call analysis APIs.',
    keyPoints: ['Request details are centralized', 'UI state reflects loading and errors', 'Interview workspace data is intentionally local'],
  },
  {
    id: 'repository-safety',
    question: 'How would you protect uploaded repositories from unsafe execution?',
    category: 'Security',
    difficulty: 'Hard',
    relatedArea: 'Repository analysis boundary',
    relatedFile: 'Workspace context (future capability)',
    whyAsked: 'This evaluates threat modeling around untrusted source code, file content, and analysis tooling.',
    mockAnswer: 'I would treat every uploaded repository as untrusted. Analysis should run in an isolated, resource-limited environment with no unnecessary network or credential access, strict file and process boundaries, timeouts, and sanitized outputs. The service should also validate archive paths and record an auditable analysis lifecycle before exposing results to the workspace.',
    keyPoints: ['Isolate analysis from application credentials', 'Limit CPU, memory, time, and network access', 'Validate archives and sanitize returned content'],
  },
  {
    id: 'growth-decisions',
    question: 'What design decisions would you reconsider if this project grew significantly?',
    category: 'Project Design',
    difficulty: 'Hard',
    relatedArea: 'Workflow orchestration and data contracts',
    relatedFile: 'frontend/src/components/WorkflowSidebar.jsx',
    whyAsked: 'This invites you to discuss tradeoffs, future boundaries, and where a prototype would need stronger infrastructure.',
    mockAnswer: 'I would formalize workflow state instead of relying on a single statically mounted workspace, define versioned contracts for findings and suggestions, and move long-running repository analysis into background jobs. I would also add durable progress tracking and stronger observability before supporting multiple concurrent projects.',
    keyPoints: ['Formalize workflow and result contracts', 'Move expensive analysis to background jobs', 'Add durable progress and observability'],
  },
]

export function getAnalysisInterviewSummary(analysis) {
  return {
    total: 7,
    facts: [
      { label: 'Files', value: analysis.total_files, tone: 'indigo' },
      { label: 'Directories', value: analysis.total_directories, tone: 'blue' },
      { label: 'Languages', value: analysis.languages.length, tone: 'emerald' },
      { label: 'Technologies', value: analysis.technologies.length, tone: 'amber' },
    ],
  }
}

export function getAnalysisInterviewQuestions(analysis) {
  const languageSummary = analysis.languages.length > 0
    ? analysis.languages.map(({ name, file_count }) => `${name} (${file_count} files)`).join(', ')
    : 'No recognized languages detected.'
  const technologySummary = analysis.technologies.length > 0
    ? analysis.technologies.join(', ')
    : 'No supported technology signals detected.'
  const importantFilesSummary = analysis.important_files.length > 0
    ? analysis.important_files.join(', ')
    : 'No recognized important files detected.'
  const directorySummary = analysis.structure.directories.length > 0
    ? analysis.structure.directories.join(', ')
    : 'No nested directories detected.'
  const warningSummary = analysis.analysis_warnings.length > 0
    ? analysis.analysis_warnings.join(' ')
    : 'No analyzer warnings found.'

  return [
    {
      id: 'project-scope',
      question: `How would you describe the scope of ${analysis.project_name}?`,
      category: 'Project scope',
      relatedArea: 'Static project inventory',
      relatedFile: `${analysis.total_files} files / ${analysis.total_directories} directories`,
      whyAsked: 'This gives you a factual starting point for describing the project represented by the analysis.',
      mockAnswer: `The analyzed project is ${analysis.project_name}. The static inventory contains ${analysis.total_files} files across ${analysis.total_directories} directories.`,
      keyPoints: [`Project name: ${analysis.project_name}`, `${analysis.total_files} files inspected`, `${analysis.total_directories} directories reported`],
    },
    {
      id: 'detected-languages',
      question: 'Which programming languages were detected in this project?',
      category: 'Languages',
      relatedArea: 'Language signals',
      relatedFile: languageSummary,
      whyAsked: 'This tests whether you can distinguish analyzer observations from assumptions about the project.',
      mockAnswer: `The analyzer detected these language signals: ${languageSummary}`,
      keyPoints: analysis.languages.length > 0 ? analysis.languages.map(({ name, file_count }) => `${name}: ${file_count} files`) : ['No recognized language extensions were found'],
    },
    {
      id: 'detected-technologies',
      question: 'Which technologies were detected, and what evidence supports that list?',
      category: 'Technologies',
      relatedArea: 'Manifest technology signals',
      relatedFile: technologySummary,
      whyAsked: 'This encourages a precise explanation of what the analyzer can establish from supported manifests.',
      mockAnswer: `The analyzer detected these technology signals: ${technologySummary}. These signals come from the supported project manifests inspected by the analyzer.`,
      keyPoints: analysis.technologies.length > 0 ? analysis.technologies : ['No supported technology signals were detected'],
    },
    {
      id: 'important-files',
      question: 'Which important project files should you be ready to explain?',
      category: 'Important files',
      relatedArea: 'Recognized manifests and entry points',
      relatedFile: importantFilesSummary,
      whyAsked: 'Recognized filenames provide concrete places to begin project orientation without implying what their contents do.',
      mockAnswer: `The analyzer recognized these important files: ${importantFilesSummary}`,
      keyPoints: analysis.important_files.length > 0 ? analysis.important_files.slice(0, 3) : ['No recognized important files were found'],
    },
    {
      id: 'directory-organization',
      question: 'How is the project organized according to the analyzed structure?',
      category: 'Project structure',
      relatedArea: 'Directory and file organization',
      relatedFile: directorySummary,
      whyAsked: 'This lets you describe the observable file organization without claiming architectural responsibilities the analyzer did not verify.',
      mockAnswer: `The analyzer reported these directory paths: ${directorySummary}`,
      keyPoints: [`${analysis.structure.files.length} file records in the structure snapshot`, `${analysis.structure.directories.length} directory records`, 'Describe observed paths before inferring responsibilities'],
    },
    {
      id: 'analysis-coverage',
      question: 'Were there any analyzer warnings or coverage limits to mention?',
      category: 'Analysis coverage',
      relatedArea: 'Static analysis coverage',
      relatedFile: 'analysis_warnings',
      whyAsked: 'A reliable interview explanation should make the limits of the available evidence explicit.',
      mockAnswer: warningSummary,
      keyPoints: analysis.analysis_warnings.length > 0 ? analysis.analysis_warnings : ['No analyzer warnings found'],
    },
    {
      id: 'further-investigation',
      question: 'What would you investigate further before discussing implementation decisions?',
      category: 'Further investigation',
      relatedArea: 'Evidence gaps and interview preparation',
      relatedFile: analysis.important_files[0] || 'No recognized important file',
      whyAsked: 'The current analyzer provides inventory signals, so this question helps separate verified facts from topics that need source-level investigation.',
      mockAnswer: 'I would inspect the recognized project files and directory paths directly to understand their contents and responsibilities. I would treat the current analysis as inventory evidence rather than as proof of runtime behavior or design decisions.',
      keyPoints: ['Inspect recognized important files', 'Trace directory contents', 'Separate static inventory from unverified behavior'],
    },
  ]
}