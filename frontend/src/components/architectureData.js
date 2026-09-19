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