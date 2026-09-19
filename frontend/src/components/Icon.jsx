const iconPaths = {
  activity: (
    <>
      <path d="M3 12h3l2-7 4 14 2-7h3" />
    </>
  ),
  arrowUpRight: (
    <>
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </>
  ),
  chevronRight: <path d="m9 18 6-6-6-6" />,
  code: (
    <>
      <path d="m8 9-3 3 3 3" />
      <path d="m16 9 3 3-3 3" />
      <path d="m14 5-4 14" />
    </>
  ),
  chevronDown: <path d="m6 9 6 6 6-6" />,
  database: (
    <>
      <ellipse cx="12" cy="5" rx="7" ry="3" />
      <path d="M5 5v7c0 1.7 3.1 3 7 3s7-1.3 7-3V5" />
      <path d="M5 12v7c0 1.7 3.1 3 7 3s7-1.3 7-3v-7" />
    </>
  ),
  folder: (
    <>
      <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H9l2 2h8.5A1.5 1.5 0 0 1 21 9.5v7A1.5 1.5 0 0 1 19.5 18h-15A1.5 1.5 0 0 1 3 16.5z" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 16 9 5 9-5" />
    </>
  ),
  menu: (
    <>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </>
  ),
  monitor: (
    <>
      <rect height="13" rx="1.5" width="18" x="3" y="4" />
      <path d="M8 20h8M12 17v3" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 11a8.1 8.1 0 0 0-14.8-3L3 10" />
      <path d="M3 5v5h5" />
      <path d="M4 13a8.1 8.1 0 0 0 14.8 3L21 14" />
      <path d="M21 19v-5h-5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </>
  ),
  server: (
    <>
      <rect height="6" rx="1.5" width="16" x="4" y="4" />
      <rect height="6" rx="1.5" width="16" x="4" y="14" />
      <path d="M8 7h.01M8 17h.01" />
    </>
  ),
  sparkles: (
    <>
      <path d="m12 3-1.1 3.4a4 4 0 0 1-2.5 2.5L5 10l3.4 1.1a4 4 0 0 1 2.5 2.5L12 17l1.1-3.4a4 4 0 0 1 2.5-2.5L19 10l-3.4-1.1a4 4 0 0 1-2.5-2.5z" />
      <path d="m5 3 .4 1.6L7 5l-1.6.4L5 7l-.4-1.6L3 5l1.6-.4zM19 16l.4 1.6L21 18l-1.6.4L19 20l-.4-1.6L17 18l1.6-.4z" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 20h14" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
}

function Icon({ name, size = 18, strokeWidth = 1.8, className = '' }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
    >
      {iconPaths[name]}
    </svg>
  )
}

export default Icon
