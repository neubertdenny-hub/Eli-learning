/**
 * Eli Robot Component – Premium Edition with Animations
 *
 * Modern, high-quality animated character.
 * Renders as SVG with 7 mood states and smooth motion.
 */

import React from "react"

export type EliMood =
  | "neutral"
  | "happy"
  | "excited"
  | "thinking"
  | "explaining"
  | "celebrating"
  | "encouraging"

interface EliRobotProps {
  mood?: EliMood
  size?: "sm" | "md" | "lg"
  className?: string
  animated?: boolean
}

const SIZES = {
  sm: { width: 120, height: 140, scale: 0.8 },
  md: { width: 180, height: 210, scale: 1 },
  lg: { width: 280, height: 320, scale: 1.5 },
}

export function EliRobot({
  mood = "neutral",
  size = "md",
  className = "",
  animated = true,
}: EliRobotProps) {
  const dims = SIZES[size]

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <style>{`
        @keyframes eli-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes eli-nod-head {
          0%, 100% { transform: rotateX(0deg) translateY(0); }
          25% { transform: rotateX(-5deg) translateY(-2px); }
          50% { transform: rotateX(0deg) translateY(0); }
          75% { transform: rotateX(5deg) translateY(2px); }
        }
        @keyframes eli-pulse-body {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.03); }
        }
        .eli-container {
          ${animated ? 'animation: eli-float 3s ease-in-out infinite;' : ''}
        }
        .eli-head {
          ${animated ? 'animation: eli-nod-head 4s ease-in-out infinite;' : ''}
          transform-origin: center center;
        }
        .eli-body {
          ${animated ? 'animation: eli-pulse-body 2.8s ease-in-out infinite;' : ''}
          transform-origin: center;
        }
      `}</style>

      <svg
        width={dims.width}
        height={dims.height}
        viewBox="0 0 200 240"
        className="eli-container drop-shadow-xl transition-transform duration-300"
      >
        <defs>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>

          <linearGradient id="headGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          <radialGradient id="glowGradient">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>

          <filter id="softShadow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
        </defs>

        {/* Glow Background (for celebrating/excited moods) */}
        {(mood === "celebrating" || mood === "excited") && (
          <circle cx="100" cy="100" r="110" fill="url(#glowGradient)" opacity="0.6" />
        )}

        {/* Body (with breathing animation) */}
        <g className="eli-body">
          <rect
            x="60"
            y="110"
            width="80"
            height="90"
            rx="16"
            fill="url(#bodyGradient)"
            filter="url(#softShadow)"
          />

          {/* Chest Light */}
          <circle cx="100" cy="145" r="9" fill="#0ea5e9" opacity="0.8" />
          <circle cx="100" cy="145" r="6" fill="#38bdf8" opacity="0.6" />

          {/* Left Arm */}
          <rect
            x="40"
            y="125"
            width="18"
            height="50"
            rx="8"
            fill="url(#bodyGradient)"
            opacity="0.8"
            filter="url(#softShadow)"
          />

          {/* Right Arm */}
          <rect
            x="142"
            y="125"
            width="18"
            height="50"
            rx="8"
            fill="url(#bodyGradient)"
            opacity="0.8"
            filter="url(#softShadow)"
          />
        </g>

        {/* Head (with nodding animation) */}
        <g className="eli-head">
          <circle cx="100" cy="60" r="40" fill="url(#headGradient)" filter="url(#softShadow)" />

          {/* Antenna */}
          <line x1="100" y1="20" x2="100" y2="5" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" />
          <circle cx="100" cy="2" r="4" fill="#3b82f6" />

          {/* Left Eye White */}
          <circle cx="80" cy="55" r="12" fill="#ffffff" opacity="0.95" />

          {/* Right Eye White */}
          <circle cx="120" cy="55" r="12" fill="#ffffff" opacity="0.95" />

          {/* Eyes based on Mood */}
          {mood === "thinking" ? (
            <>
              <circle cx="80" cy="55" r="7" fill="#1d4ed8" opacity="0.8" />
              <text x="82" y="58" fontSize="10" fontWeight="bold" fill="#1d4ed8" textAnchor="middle">
                ?
              </text>
              <circle cx="120" cy="55" r="7" fill="#1d4ed8" opacity="0.8" />
            </>
          ) : mood === "excited" || mood === "celebrating" ? (
            <>
              <circle cx="80" cy="55" r="7" fill="#1d4ed8" opacity="0.9" />
              <text x="80" y="58" fontSize="12" fontWeight="bold" fill="#fbbf24" textAnchor="middle">
                ★
              </text>
              <circle cx="120" cy="55" r="7" fill="#1d4ed8" opacity="0.9" />
              <text x="120" y="58" fontSize="12" fontWeight="bold" fill="#fbbf24" textAnchor="middle">
                ★
              </text>
            </>
          ) : (
            <>
              <circle cx="80" cy="55" r="7" fill="#1d4ed8" opacity="0.85" />
              <circle cx="120" cy="55" r="7" fill="#1d4ed8" opacity="0.85" />
            </>
          )}

          {/* Mouth Area */}
          <rect x="75" y="75" width="50" height="22" rx="8" fill="#ffffff" opacity="0.9" />

          {/* Mouth Expression */}
          {mood === "happy" || mood === "encouraging" ? (
            <path
              d="M 85 85 Q 100 92 115 85"
              stroke="#1d4ed8"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
          ) : mood === "excited" || mood === "celebrating" ? (
            <>
              <path
                d="M 85 85 Q 100 93 115 85"
                stroke="#1d4ed8"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
              <text x="100" y="88" fontSize="14" textAnchor="middle" fill="#fbbf24">
                ✨
              </text>
            </>
          ) : mood === "thinking" ? (
            <path
              d="M 85 87 Q 100 88 115 87"
              stroke="#1d4ed8"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              opacity="0.6"
            />
          ) : mood === "explaining" ? (
            <>
              <circle cx="100" cy="86" r="4" fill="#1d4ed8" opacity="0.7" />
              <circle cx="88" cy="81" r="2" fill="#1d4ed8" opacity="0.5" />
              <circle cx="112" cy="81" r="2" fill="#1d4ed8" opacity="0.5" />
            </>
          ) : (
            <line x1="85" y1="86" x2="115" y2="86" stroke="#1d4ed8" strokeWidth="2" opacity="0.5" />
          )}
        </g>

        {/* Accent Elements based on Mood */}
        {(mood === "celebrating" || mood === "excited") && (
          <>
            <text x="25" y="40" fontSize="24" opacity="0.7">
              ✨
            </text>
            <text x="175" y="50" fontSize="24" opacity="0.7">
              ✨
            </text>
            <text x="30" y="150" fontSize="20" opacity="0.6">
              🎉
            </text>
            <text x="170" y="160" fontSize="20" opacity="0.6">
              🎉
            </text>
          </>
        )}

        {mood === "encouraging" && (
          <>
            <text x="20" y="140" fontSize="22">
              👍
            </text>
            <text x="180" y="140" fontSize="22">
              👍
            </text>
          </>
        )}

        {mood === "thinking" && (
          <>
            <circle cx="150" cy="100" r="4" fill="#1d4ed8" opacity="0.5" />
            <circle cx="160" cy="115" r="3" fill="#1d4ed8" opacity="0.4" />
          </>
        )}
      </svg>

      {/* Glow effect container for celebrating/excited */}
      {(mood === "celebrating" || mood === "excited") && (
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-blue-300 to-transparent opacity-30 blur-2xl animate-pulse-soft"
          style={{ pointerEvents: "none", width: dims.width + 40, height: dims.height + 40 }}
        />
      )}
    </div>
  )
}

/**
 * Eli Speaking Component
 * Shows Eli with a premium speech bubble
 */

interface EliSpeakingProps {
  mood?: EliMood
  message: string
  size?: "sm" | "md" | "lg"
  className?: string
  animated?: boolean
}

export function EliSpeaking({
  mood = "neutral",
  message,
  size = "md",
  className = "",
  animated = true,
}: EliSpeakingProps) {
  return (
    <div className={`flex flex-col items-center gap-6 ${className}`}>
      <EliRobot mood={mood} size={size} animated={animated} />

      {/* Premium Speech Bubble */}
      <div className="relative max-w-md animate-fade-in">
        <div className="bg-white border-2 border-blue-200 rounded-2xl px-6 py-4 shadow-lg">
          <p className="text-gray-900 font-medium text-base leading-relaxed">{message}</p>

          {/* Pointer */}
          <div className="absolute -bottom-3 left-8 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-white" />
          <div className="absolute -bottom-2.5 left-8 w-0 h-0 border-l-5 border-r-5 border-t-5 border-l-transparent border-r-transparent border-t-blue-200" />
        </div>
      </div>
    </div>
  )
}
