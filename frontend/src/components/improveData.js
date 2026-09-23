export const improvementSummary = {
  categories: [
    { label: 'Total suggestions', value: '08', detail: 'Across the review scope', accent: 'indigo' },
    { label: 'Architecture', value: '02', detail: 'Boundaries and structure', accent: 'blue' },
    { label: 'Security', value: '02', detail: 'Controls to strengthen', accent: 'rose' },
    { label: 'Code quality', value: '02', detail: 'Maintainability actions', accent: 'amber' },
    { label: 'Performance', value: '01', detail: 'Runtime opportunities', accent: 'cyan' },
    { label: 'Documentation', value: '01', detail: 'Context to capture', accent: 'emerald' },
  ],
  priorities: [
    { label: 'High', value: '02', accent: 'rose' },
    { label: 'Medium', value: '04', accent: 'amber' },
    { label: 'Low', value: '02', accent: 'slate' },
  ],
}

export const improvementSuggestions = [
  {
    category: 'Architecture',
    categoryTone: 'blue',
    priority: 'Medium',
    priorityTone: 'amber',
    title: 'Separate database configuration from initialization',
    description: 'Make connection settings and session setup independently understandable as the persistence layer grows.',
    icon: 'database',
    relatedEvidence: 'backend/app/database.py',
    evidenceLabel: 'Related evidence',
    action: 'Move environment reads and engine construction behind a focused database configuration boundary.',
    benefit: 'Improves testability and makes deployment-specific settings easier to reason about.',
  },
  {
    category: 'Architecture',
    categoryTone: 'blue',
    priority: 'Medium',
    priorityTone: 'amber',
    title: 'Introduce clearer service and repository separation',
    description: 'Give project operations distinct service responsibilities before additional workflow features are added.',
    icon: 'layers',
    relatedEvidence: 'backend/app/routes/projects.py',
    evidenceLabel: 'Related evidence',
    action: 'Define a small project service layer between route handlers and persistence operations.',
    benefit: 'Keeps HTTP concerns separate from business decisions and reduces future route complexity.',
  },
  {
    category: 'Security',
    categoryTone: 'rose',
    priority: 'High',
    priorityTone: 'rose',
    title: 'Centralize environment configuration',
    description: 'Create one visible configuration boundary for secrets, database settings, and runtime behavior.',
    icon: 'code',
    relatedEvidence: 'backend/app/config.py',
    evidenceLabel: 'Related evidence',
    action: 'Route environment access through typed settings and document which values are required at runtime.',
    benefit: 'Reduces configuration drift and makes sensitive inputs easier to audit before deployment.',
  },
  {
    category: 'Security',
    categoryTone: 'rose',
    priority: 'High',
    priorityTone: 'rose',
    title: 'Add stronger input validation at the API boundary',
    description: 'Make invalid project input fail early with consistent, user-safe responses.',
    icon: 'activity',
    relatedEvidence: 'backend/app/schemas.py',
    evidenceLabel: 'Related evidence',
    action: 'Review request constraints and add explicit validation rules for project fields and lengths.',
    benefit: 'Protects downstream operations and gives clients clearer feedback when requests are incomplete.',
  },
  {
    category: 'Code Quality',
    categoryTone: 'amber',
    priority: 'Medium',
    priorityTone: 'amber',
    title: 'Separate route handlers into focused modules',
    description: 'Keep endpoint declarations small as the workflow gains additional project operations.',
    icon: 'folder',
    relatedEvidence: 'backend/app/routes/projects.py',
    evidenceLabel: 'Related evidence',
    action: 'Group related route concerns and extract repeated response or lookup behavior into named helpers.',
    benefit: 'Makes changes easier to review and lowers the chance of unrelated endpoint regressions.',
  },
  {
    category: 'Code Quality',
    categoryTone: 'amber',
    priority: 'Low',
    priorityTone: 'slate',
    title: 'Improve error handling structure',
    description: 'Use consistent error states across the workspace so failures remain visible without becoming noisy.',
    icon: 'activity',
    relatedEvidence: 'frontend/src/App.jsx',
    evidenceLabel: 'Related evidence',
    action: 'Define shared request-error presentation rules for loading, validation, and server failure states.',
    benefit: 'Creates a more predictable experience while keeping asynchronous UI logic easier to maintain.',
  },
  {
    category: 'Performance',
    categoryTone: 'cyan',
    priority: 'Medium',
    priorityTone: 'amber',
    title: 'Review database query patterns',
    description: 'Establish a habit of checking query shape before the project model expands beyond basic operations.',
    icon: 'database',
    relatedEvidence: 'backend/app/routes/projects.py',
    evidenceLabel: 'Related evidence',
    action: 'Inspect list and detail queries for avoidable repeated work, then add indexes where access patterns justify them.',
    benefit: 'Keeps common workspace requests responsive as project and finding counts increase.',
  },
  {
    category: 'Documentation',
    categoryTone: 'emerald',
    priority: 'Low',
    priorityTone: 'slate',
    title: 'Add API usage documentation',
    description: 'Capture the request and response shape that connects the dashboard to project operations.',
    icon: 'code',
    relatedEvidence: 'backend/app/main.py',
    evidenceLabel: 'Related evidence',
    action: 'Document the project endpoints with example payloads, expected errors, and local setup assumptions.',
    benefit: 'Shortens onboarding time and gives future UI work a stable contract to reference.',
  },
]

export function getAnalysisImprovementSummary(analysis) {
  const warningCount = analysis.analysis_warnings.length

  return {
    categories: [
      { label: 'Evidence-based steps', value: '05', detail: 'Derived from analyzer facts', accent: 'indigo' },
      { label: 'Project scope', value: analysis.total_files.toString(), detail: `${analysis.total_directories} directories inspected`, accent: 'blue' },
      { label: 'Languages', value: analysis.languages.length.toString(), detail: 'Recognized language signals', accent: 'amber' },
      { label: 'Technologies', value: analysis.technologies.length.toString(), detail: 'Manifest signals detected', accent: 'emerald' },
      { label: 'Important files', value: analysis.important_files.length.toString(), detail: 'Recognized project context', accent: 'cyan' },
      { label: 'Analysis warnings', value: warningCount.toString(), detail: warningCount === 0 ? 'No analyzer warnings found' : 'Coverage warnings to review', accent: warningCount === 0 ? 'emerald' : 'rose' },
    ],
    evidence: [
      { label: 'Analyzer facts', value: analysis.structure.files.length.toString(), accent: 'indigo' },
      { label: 'Structure directories', value: analysis.structure.directories.length.toString(), accent: 'blue' },
      { label: 'Warnings', value: warningCount.toString(), accent: warningCount === 0 ? 'emerald' : 'rose' },
    ],
  }
}

export function getAnalysisImprovementSuggestions(analysis) {
  const languageSummary = analysis.languages.length > 0
    ? analysis.languages.map(({ name, file_count }) => `${name} (${file_count} files)`).join(', ')
    : 'No recognized languages detected.'
  const technologySummary = analysis.technologies.length > 0
    ? analysis.technologies.join(', ')
    : 'No supported technology signals detected.'
  const importantFilesSummary = analysis.important_files.length > 0
    ? analysis.important_files.join(', ')
    : 'No recognized important files detected.'
  const warningSummary = analysis.analysis_warnings.length > 0
    ? analysis.analysis_warnings.join(' ')
    : 'No analyzer warnings found.'

  return [
    {
      category: 'Project context',
      categoryTone: 'blue',
      title: 'Create a project inventory note',
      description: `${analysis.project_name} was analyzed as ${analysis.total_files} files across ${analysis.total_directories} directories.`,
      icon: 'folder',
      relatedEvidence: `structure.root: ${analysis.structure.root}`,
      evidenceLabel: 'Analyzer structure',
      action: 'Record the analyzed project scope and structure root as a reference point for future work.',
      benefit: 'Keeps future review and improvement discussions anchored to the inspected project.',
    },
    {
      category: 'Languages',
      categoryTone: 'amber',
      title: 'Document the detected language mix',
      description: languageSummary,
      icon: 'code',
      relatedEvidence: languageSummary,
      evidenceLabel: 'Analyzer languages',
      action: 'Add the detected languages and file counts to the project context documentation.',
      benefit: 'Makes the technology context easier to understand before deeper analysis is available.',
    },
    {
      category: 'Technologies',
      categoryTone: 'emerald',
      title: 'Record detected technology signals',
      description: technologySummary,
      icon: 'layers',
      relatedEvidence: technologySummary,
      evidenceLabel: 'Analyzer technologies',
      action: 'Document the technologies detected from supported project manifests and note the source manifests when available.',
      benefit: 'Provides a concise reference for the project tools represented in the analysis.',
    },
    {
      category: 'Documentation',
      categoryTone: 'cyan',
      title: 'Capture recognized project files',
      description: importantFilesSummary,
      icon: 'activity',
      relatedEvidence: importantFilesSummary,
      evidenceLabel: 'Analyzer important_files',
      action: 'Use the recognized manifests, configuration files, and entry points to build a project orientation checklist.',
      benefit: 'Helps future contributors find the files that define available project context.',
    },
    {
      category: 'Analysis coverage',
      categoryTone: analysis.analysis_warnings.length > 0 ? 'rose' : 'indigo',
      title: analysis.analysis_warnings.length > 0 ? 'Review analyzer coverage warnings' : 'Record the clear analysis result',
      description: warningSummary,
      icon: 'search',
      relatedEvidence: warningSummary,
      evidenceLabel: 'Analyzer analysis_warnings',
      action: analysis.analysis_warnings.length > 0
        ? 'Review the reported coverage conditions before relying on the analysis for broader project conclusions.'
        : 'Record that the analyzer reported no coverage warnings for this project.',
      benefit: 'Makes the limits and coverage of the current static analysis explicit.',
    },
  ]
}