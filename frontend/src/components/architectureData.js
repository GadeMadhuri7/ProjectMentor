export const technologySummaries = [
  {
    label: 'Detected API',
    value: 'FastAPI',
    detail: 'Python backend',
    icon: 'server',
    accent: 'indigo',
  },
  {
    label: 'Frontend Layer',
    value: 'React + Vite',
    detail: 'Tailwind UI',
    icon: 'monitor',
    accent: 'blue',
  },
  {
    label: 'Database Schema',
    value: 'MySQL',
    detail: 'SQLAlchemy ORM',
    icon: 'database',
    accent: 'amber',
  },
  {
    label: 'AI Context Engine',
    value: 'Groq / RAG',
    detail: 'Vector chunks / context information',
    icon: 'sparkles',
    accent: 'emerald',
  },
]

export const architectureNodes = [
  { name: 'Frontend Client', description: 'React + Vite interface', icon: 'monitor', accent: 'blue' },
  { name: 'FastAPI Gateway', description: 'Python service boundary', icon: 'server', accent: 'indigo' },
  { name: 'MySQL Storage', description: 'SQLAlchemy persistence', icon: 'database', accent: 'amber' },
]

export const architectureInsights = [
  {
    category: 'Pattern',
    title: 'Layered architecture',
    description: 'A clear client, service, and persistence separation keeps responsibilities easy to trace.',
    icon: 'layers',
  },
  {
    category: 'Data flow',
    title: 'Request-driven storage',
    description: 'The gateway appears to coordinate client requests before they reach the relational store.',
    icon: 'activity',
  },
]

export function getAnalysisTechnologySummaries(technologies) {
  return technologies.map((technology) => ({
    label: 'Detected technology',
    value: technology,
    detail: 'Static manifest signal',
    icon: 'code',
    accent: 'indigo',
  }))
}

export function getAnalysisNodes(analysis) {
  const languageSummary = analysis.languages.length > 0
    ? analysis.languages.map(({ name, file_count }) => `${name} (${file_count})`).join(', ')
    : 'No recognized languages'
  const technologySummary = analysis.technologies.length > 0
    ? analysis.technologies.join(', ')
    : 'No technologies detected'

  return [
    { name: analysis.project_name, description: `${analysis.total_files} files in ${analysis.total_directories} directories`, icon: 'folder', accent: 'blue' },
    { name: 'Detected languages', description: languageSummary, icon: 'code', accent: 'indigo' },
    { name: 'Detected technologies', description: technologySummary, icon: 'layers', accent: 'amber' },
    { name: 'Important files', description: `${analysis.important_files.length} identified`, icon: 'activity', accent: 'blue' },
  ]
}

export function getAnalysisInsights(analysis) {
  return [
    {
      category: 'Static fact',
      title: 'Repository inventory',
      description: `${analysis.total_files} files and ${analysis.total_directories} directories were inspected without executing project code.`,
      icon: 'folder',
    },
    {
      category: 'Static fact',
      title: 'Manifest signals',
      description: analysis.technologies.length > 0
        ? `The analyzer detected ${analysis.technologies.join(', ')} from recognized project manifests.`
        : 'No supported technology signals were found in recognized manifests.',
      icon: 'code',
    },
  ]
}