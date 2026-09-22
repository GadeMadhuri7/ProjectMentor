export const reviewSummary = [
  { label: 'Total findings', value: '08', detail: 'Across the review scope', accent: 'indigo' },
  { label: 'Architecture', value: '03', detail: 'Structure and boundaries', accent: 'blue' },
  { label: 'Security', value: '01', detail: 'Risk signals to verify', accent: 'rose' },
  { label: 'Code quality', value: '03', detail: 'Maintainability signals', accent: 'amber' },
  { label: 'Documentation', value: '01', detail: 'Context gaps to clarify', accent: 'emerald' },
]

export const reviewFindings = [
  {
    category: 'Architecture',
    categoryTone: 'blue',
    severity: 'Review',
    severityTone: 'indigo',
    title: 'Service boundary is easy to identify',
    description: 'The application presents a clear handoff between the browser client, API gateway, and persistence layer.',
    icon: 'layers',
    evidence: {
      source: 'frontend/src/api/client.js',
      description: 'The client module centralizes browser requests behind a small project-focused API surface.',
      finding: 'A focused client boundary supports predictable request ownership.',
      impact: 'Future features can extend the API client without spreading request details through the UI.',
    },
  },
  {
    category: 'Data Flow',
    categoryTone: 'amber',
    severity: 'Trace',
    severityTone: 'amber',
    title: 'Project creation follows a direct request path',
    description: 'The create-project interaction provides a compact path from form submission to persisted project context.',
    icon: 'activity',
    evidence: {
      source: 'frontend/src/components/ProjectManager.jsx',
      description: 'The project form gathers name and description values before invoking the supplied submit handler.',
      finding: 'Input ownership stays close to the project workspace surface.',
      impact: 'The flow should be straightforward to validate when real evidence is connected later.',
    },
  },
  {
    category: 'Security',
    categoryTone: 'rose',
    severity: 'Verify',
    severityTone: 'rose',
    title: 'Repository context needs an explicit trust boundary',
    description: 'The workspace will need a clear policy for which repository metadata may be exposed to future analysis tools.',
    icon: 'code',
    evidence: {
      source: 'Workspace context (mock example)',
      description: 'The current shell reserves space for repository context but does not implement repository analysis.',
      finding: 'Repository-derived context should be treated as untrusted input.',
      impact: 'A future implementation should define filtering and access rules before analysis is enabled.',
    },
  },
  {
    category: 'Documentation',
    categoryTone: 'emerald',
    severity: 'Context',
    severityTone: 'emerald',
    title: 'Architecture notes can anchor the project story',
    description: 'The architecture workspace gives contributors a concise place to connect technologies with responsibilities.',
    icon: 'folder',
    evidence: {
      source: 'Architecture workspace (mock example)',
      description: 'The preceding workspace presents technology cards, a system map, and inferred design notes.',
      finding: 'Visual context can become a useful starting point for deeper project documentation.',
      impact: 'Keeping these notes current will reduce the cost of onboarding and interview preparation.',
    },
  },
]

export function getAnalysisReviewSummary(analysis) {
  const warningCount = analysis.analysis_warnings.length

  return [
    { label: 'Static observations', value: '05', detail: 'Facts derived from the analyzer', accent: 'indigo' },
    { label: 'Project scope', value: analysis.total_files.toString(), detail: `${analysis.total_directories} directories inspected`, accent: 'blue' },
    { label: 'Languages', value: analysis.languages.length.toString(), detail: 'Recognized language signals', accent: 'amber' },
    { label: 'Technologies', value: analysis.technologies.length.toString(), detail: 'Manifest signals detected', accent: 'emerald' },
    { label: 'Analysis warnings', value: warningCount.toString(), detail: warningCount === 0 ? 'No analyzer warnings found' : 'Coverage warnings to review', accent: warningCount === 0 ? 'emerald' : 'rose' },
  ]
}

export function getAnalysisReviewFindings(analysis) {
  const structureFileCount = analysis.structure.files.length
  const structureDirectoryCount = analysis.structure.directories.length
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
    : 'No analyzer warnings were reported for this project.'

  return [
    {
      category: 'Project inventory',
      categoryTone: 'blue',
      severity: 'Static fact',
      severityTone: 'indigo',
      title: 'Project scope was inspected',
      description: `${analysis.project_name} contains ${analysis.total_files} files across ${analysis.total_directories} directories in the analyzer result.`,
      icon: 'folder',
      evidence: {
        source: 'Analyzer project inventory',
        description: `The static analyzer counted files and directories without executing project code. Its structure snapshot contains ${structureFileCount} file records and ${structureDirectoryCount} directory records.`,
        finding: `${analysis.total_files} files and ${analysis.total_directories} directories were reported.`,
        impact: 'This establishes the scope represented by the current static analysis.',
      },
    },
    {
      category: 'Languages',
      categoryTone: 'indigo',
      severity: 'Static fact',
      severityTone: 'indigo',
      title: 'Recognized language signals',
      description: languageSummary,
      icon: 'code',
      evidence: {
        source: 'Analyzer languages result',
        description: 'Language values are inferred from recognized file extensions and counted by file.',
        finding: languageSummary,
        impact: 'This identifies the language signals included in the analysis scope.',
      },
    },
    {
      category: 'Technologies',
      categoryTone: 'amber',
      severity: 'Manifest signal',
      severityTone: 'amber',
      title: 'Recognized technology signals',
      description: technologySummary,
      icon: 'layers',
      evidence: {
        source: 'Analyzer technology result',
        description: 'Technology values come from supported dependency and project manifest checks.',
        finding: technologySummary,
        impact: 'These signals provide factual context for the analyzed project.',
      },
    },
    {
      category: 'Project structure',
      categoryTone: 'emerald',
      severity: 'Static fact',
      severityTone: 'emerald',
      title: 'Recognized project files',
      description: importantFilesSummary,
      icon: 'activity',
      evidence: {
        source: 'Analyzer important_files result',
        description: 'The analyzer records recognized project, manifest, configuration, and entry-point filenames.',
        finding: importantFilesSummary,
        impact: 'These files identify available project context for later review steps.',
      },
    },
    {
      category: 'Analysis coverage',
      categoryTone: analysis.analysis_warnings.length > 0 ? 'rose' : 'emerald',
      severity: analysis.analysis_warnings.length > 0 ? 'Warning' : 'Clear',
      severityTone: analysis.analysis_warnings.length > 0 ? 'rose' : 'emerald',
      title: analysis.analysis_warnings.length > 0 ? 'Analyzer warnings were reported' : 'No analyzer warnings found',
      description: warningSummary,
      icon: 'search',
      evidence: {
        source: 'Analyzer analysis_warnings result',
        description: 'Warnings describe analysis coverage conditions such as skipped unreadable files or a file limit.',
        finding: warningSummary,
        impact: analysis.analysis_warnings.length > 0 ? 'Review these conditions when interpreting the static analysis scope.' : 'The analyzer reported no coverage warnings for this project.',
      },
    },
  ]
}