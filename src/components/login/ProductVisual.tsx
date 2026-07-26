export default function ProductVisual() {
  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden select-none"
      style={{
        background: 'linear-gradient(145deg, #0f0e1a 0%, #16152a 45%, #1a1840 100%)',
        minHeight: '100vh',
      }}
    >
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(99,102,241,0.18) 0%, transparent 70%)',
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Central illustration */}
      <div className="relative z-10 w-full max-w-md px-8">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-12">
          <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#markGradL)" />
            <path
              d="M8 16.5L13.5 22L24 11"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="markGradL" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#818cf8" />
                <stop offset="1" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
          <span
            className="text-2xl font-bold tracking-tight text-white"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            OnTrack
          </span>
        </div>

        {/* Journey illustration */}
        <TaskJourneyIllustration />

        {/* Tagline */}
        <div className="mt-12">
          <p
            className="text-2xl font-semibold text-white leading-snug"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Stay on track.
            <br />
            Get things done.
          </p>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'rgba(165,180,252,0.75)' }}>
            Plan your work, track your progress, and celebrate every completion — all in one elegant workspace.
          </p>
        </div>

        {/* Social proof dots */}
        <div className="mt-10 flex items-center gap-3">
          <div className="flex -space-x-2">
            {['#818cf8', '#6366f1', '#a5b4fc', '#4f46e5'].map((color, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-white text-xs font-semibold"
                style={{
                  backgroundColor: color,
                  borderColor: '#16152a',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {['A', 'M', 'J', 'S'][i]}
              </div>
            ))}
          </div>
          <p className="text-xs" style={{ color: 'rgba(165,180,252,0.6)' }}>
            Joined by <span style={{ color: 'rgba(165,180,252,0.9)' }}>12,000+</span> teams worldwide
          </p>
        </div>
      </div>
    </div>
  )
}

function TaskJourneyIllustration() {
  return (
    <div className="relative w-full" style={{ height: 340 }}>
      <svg
        viewBox="0 0 380 340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full"
      >
        {/* Connection path: Plan → Track → Complete */}
        <path
          d="M 72 100 C 120 100, 120 170, 190 170 C 260 170, 260 240, 310 240"
          stroke="url(#pathGrad)"
          strokeWidth="2"
          strokeDasharray="6 4"
          opacity="0.5"
        />

        {/* Floating decorative nodes */}
        {/* Small circle node 1 */}
        <circle cx="72" cy="100" r="5" fill="#818cf8" opacity="0.6" />
        <circle cx="190" cy="170" r="5" fill="#818cf8" opacity="0.6" />
        <circle cx="310" cy="240" r="5" fill="#818cf8" opacity="0.6" />

        {/* Subtle orbs */}
        <circle cx="300" cy="60" r="40" fill="rgba(99,102,241,0.07)" />
        <circle cx="60" cy="270" r="28" fill="rgba(99,102,241,0.07)" />
        <circle cx="350" cy="180" r="20" fill="rgba(99,102,241,0.05)" />

        {/* Calendar element — top right */}
        <g transform="translate(270, 30)">
          <rect width="84" height="72" rx="10" fill="rgba(30,28,56,0.9)" stroke="rgba(99,102,241,0.3)" strokeWidth="1" />
          {/* Calendar header */}
          <rect width="84" height="22" rx="10" fill="rgba(99,102,241,0.25)" />
          <rect y="10" width="84" height="12" fill="rgba(99,102,241,0.25)" />
          <text x="42" y="16" textAnchor="middle" fontSize="8" fill="rgba(165,180,252,0.9)" fontFamily="'Plus Jakarta Sans',sans-serif" fontWeight="600">July 2025</text>
          {/* Calendar grid dots */}
          {[0, 1, 2, 3, 4, 5, 6].map(col => (
            <circle key={col} cx={10 + col * 11} cy={35} r="2.5" fill={col === 3 ? '#818cf8' : 'rgba(165,180,252,0.2)'} />
          ))}
          {[0, 1, 2, 3, 4, 5, 6].map(col => (
            <circle key={col} cx={10 + col * 11} cy={50} r="2.5" fill={col < 5 ? 'rgba(165,180,252,0.3)' : 'rgba(165,180,252,0.1)'} />
          ))}
          {[0, 1, 2, 3].map(col => (
            <circle key={col} cx={10 + col * 11} cy={65} r="2.5" fill="rgba(165,180,252,0.15)" />
          ))}
        </g>

        {/* PLAN task card — left */}
        <g transform="translate(0, 60)">
          <rect width="130" height="70" rx="12" fill="rgba(30,28,56,0.95)" stroke="rgba(99,102,241,0.35)" strokeWidth="1" />
          {/* Stage label */}
          <rect x="10" y="10" width="36" height="14" rx="4" fill="rgba(99,102,241,0.3)" />
          <text x="28" y="20.5" textAnchor="middle" fontSize="7.5" fill="#a5b4fc" fontFamily="'Plus Jakarta Sans',sans-serif" fontWeight="700" letterSpacing="0.5">PLAN</text>
          {/* Task row */}
          <circle cx="18" cy="40" r="5" stroke="rgba(165,180,252,0.4)" strokeWidth="1.5" fill="none" />
          <rect x="28" y="36" width="60" height="5" rx="2.5" fill="rgba(165,180,252,0.25)" />
          <rect x="28" y="45" width="40" height="4" rx="2" fill="rgba(165,180,252,0.12)" />
          {/* Progress bar */}
          <rect x="10" y="56" width="110" height="4" rx="2" fill="rgba(99,102,241,0.15)" />
          <rect x="10" y="56" width="35" height="4" rx="2" fill="rgba(99,102,241,0.6)" />
        </g>

        {/* TRACK card — center */}
        <g transform="translate(125, 130)">
          <rect width="130" height="80" rx="12" fill="rgba(30,28,56,0.95)" stroke="rgba(99,102,241,0.45)" strokeWidth="1.5" />
          {/* Stage label */}
          <rect x="10" y="10" width="40" height="14" rx="4" fill="rgba(99,102,241,0.4)" />
          <text x="30" y="20.5" textAnchor="middle" fontSize="7.5" fill="#a5b4fc" fontFamily="'Plus Jakarta Sans',sans-serif" fontWeight="700" letterSpacing="0.5">TRACK</text>
          {/* Progress ring mini */}
          <circle cx="110" cy="17" r="8" stroke="rgba(99,102,241,0.2)" strokeWidth="2.5" fill="none" />
          <circle cx="110" cy="17" r="8" stroke="#6366f1" strokeWidth="2.5" fill="none"
            strokeDasharray="32" strokeDashoffset="10" strokeLinecap="round"
            transform="rotate(-90 110 17)" />
          <text x="110" y="20" textAnchor="middle" fontSize="5.5" fill="#a5b4fc" fontFamily="'Plus Jakarta Sans',sans-serif" fontWeight="700">68%</text>
          {/* Task rows */}
          {[
            { done: true, w: 72, label: 'Research phase' },
            { done: true, w: 52, label: 'Wireframes' },
            { done: false, w: 64, label: 'UI Design' },
          ].map((t, i) => (
            <g key={i} transform={`translate(10, ${38 + i * 13})`}>
              {t.done ? (
                <circle cx="5" cy="5" r="5" fill="rgba(99,102,241,0.5)" />
              ) : (
                <circle cx="5" cy="5" r="5" stroke="rgba(165,180,252,0.3)" strokeWidth="1.5" fill="none" />
              )}
              {t.done && (
                <path d="M2.5 5L4.5 7L7.5 3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              )}
              <rect x="15" y="2" width={t.w} height="4.5" rx="2" fill={t.done ? 'rgba(165,180,252,0.2)' : 'rgba(165,180,252,0.12)'} />
            </g>
          ))}
        </g>

        {/* COMPLETE card — bottom right */}
        <g transform="translate(250, 210)">
          <rect width="130" height="70" rx="12" fill="rgba(30,28,56,0.95)" stroke="rgba(99,102,241,0.35)" strokeWidth="1" />
          {/* Stage label */}
          <rect x="10" y="10" width="60" height="14" rx="4" fill="rgba(79,70,229,0.35)" />
          <text x="40" y="20.5" textAnchor="middle" fontSize="7.5" fill="#a5b4fc" fontFamily="'Plus Jakarta Sans',sans-serif" fontWeight="700" letterSpacing="0.5">COMPLETE</text>
          {/* Checkmark badge */}
          <circle cx="110" cy="17" r="8" fill="rgba(99,102,241,0.5)" />
          <path d="M106.5 17L109 19.5L113.5 14.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Completed tasks */}
          {[55, 42, 68].map((w, i) => (
            <g key={i} transform={`translate(10, ${38 + i * 10})`}>
              <circle cx="4" cy="4" r="4" fill="rgba(99,102,241,0.45)" />
              <path d="M2 4L3.5 5.5L6 2.5" stroke="white" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="13" y="1.5" width={w} height="4" rx="2" fill="rgba(165,180,252,0.15)" />
            </g>
          ))}
        </g>

        {/* Floating mini tags */}
        <g transform="translate(170, 60)">
          <rect width="56" height="20" rx="6" fill="rgba(99,102,241,0.2)" stroke="rgba(99,102,241,0.3)" strokeWidth="1" />
          <circle cx="10" cy="10" r="3" fill="#818cf8" />
          <rect x="18" y="7" width="30" height="4" rx="2" fill="rgba(165,180,252,0.3)" />
        </g>

        <g transform="translate(40, 190)">
          <rect width="64" height="20" rx="6" fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.25)" strokeWidth="1" />
          <circle cx="10" cy="10" r="3" fill="rgba(165,180,252,0.5)" />
          <rect x="18" y="7" width="38" height="4" rx="2" fill="rgba(165,180,252,0.2)" />
        </g>

        <g transform="translate(220, 295)">
          <rect width="76" height="20" rx="6" fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.25)" strokeWidth="1" />
          <circle cx="10" cy="10" r="3" fill="rgba(129,140,248,0.6)" />
          <rect x="18" y="7" width="48" height="4" rx="2" fill="rgba(165,180,252,0.2)" />
        </g>

        {/* Stage labels on path */}
        <text x="36" y="96" fontSize="9" fill="rgba(165,180,252,0.45)" fontFamily="'Plus Jakarta Sans',sans-serif" fontWeight="600" letterSpacing="1">PLAN</text>
        <text x="164" y="166" fontSize="9" fill="rgba(165,180,252,0.45)" fontFamily="'Plus Jakarta Sans',sans-serif" fontWeight="600" letterSpacing="1">TRACK</text>
        <text x="283" y="236" fontSize="9" fill="rgba(165,180,252,0.45)" fontFamily="'Plus Jakarta Sans',sans-serif" fontWeight="600" letterSpacing="1">DONE</text>

        <defs>
          <linearGradient id="pathGrad" x1="72" y1="100" x2="310" y2="240" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
