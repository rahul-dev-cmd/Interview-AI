"use client";

interface RocketSVGProps {
  size?: number;
  className?: string;
  showFlame?: boolean;
}

export default function RocketSVG({
  size = 180,
  className = "",
  showFlame = true,
}: RocketSVGProps) {
  const h = size * 1.6;

  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 200 320"
      fill="none"
      className={className}
      style={{ filter: "drop-shadow(0 12px 28px rgba(0,0,0,0.18))" }}
    >
      <defs>
        {/* Body metallic gradient */}
        <linearGradient id="rBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#C8CDD3" />
          <stop offset="35%" stopColor="#F0F2F5" />
          <stop offset="70%" stopColor="#E2E5E9" />
          <stop offset="100%" stopColor="#A0A7B0" />
        </linearGradient>

        {/* Nose cone */}
        <linearGradient id="rNose" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#FF8C00" />
          <stop offset="100%" stopColor="#E8650A" />
        </linearGradient>

        {/* Window */}
        <radialGradient id="rWin" cx="0.4" cy="0.35" r="0.6">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </radialGradient>

        {/* Fins */}
        <linearGradient id="rFin" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#FF8C00" />
          <stop offset="100%" stopColor="#D4400A" />
        </linearGradient>

        {/* Flame outer */}
        <linearGradient id="rFlameO" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#FF6B00" />
          <stop offset="45%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#FBBF24" />
        </linearGradient>

        {/* Flame inner */}
        <linearGradient id="rFlameI" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#FFFBEB" />
        </linearGradient>

        {/* Window reflection */}
        <radialGradient id="rWinR" cx="0.3" cy="0.3" r="0.4">
          <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      {/* ——— BODY ——— */}
      <path
        d="M100,45 C130,45 140,90 140,160 C140,210 135,230 130,240 L70,240 C65,230 60,210 60,160 C60,90 70,45 100,45Z"
        fill="url(#rBody)"
        stroke="#9CA3AF"
        strokeWidth="0.8"
      />

      {/* Body highlight strip */}
      <path
        d="M88,55 C92,50 96,48 100,48 C100,48 95,55 93,90 C91,140 92,200 93,238 L88,238 C87,200 85,140 87,90 C87,70 88,55 88,55Z"
        fill="rgba(255,255,255,0.35)"
      />

      {/* ——— NOSE CONE ——— */}
      <path
        d="M100,8 C110,8 130,35 135,60 L65,60 C70,35 90,8 100,8Z"
        fill="url(#rNose)"
      />
      {/* Nose / body seam */}
      <ellipse cx="100" cy="60" rx="37" ry="4" fill="#E8650A" opacity="0.5" />

      {/* ——— WINDOW ——— */}
      <circle cx="100" cy="118" r="18" fill="url(#rWin)" stroke="#4B5563" strokeWidth="3" />
      {/* Window rim highlight */}
      <circle cx="100" cy="118" r="20" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      {/* Glare */}
      <circle cx="93" cy="110" r="6" fill="url(#rWinR)" />

      {/* ——— FINS ——— */}
      {/* Left */}
      <path
        d="M60,195 C50,210 35,245 30,255 C30,255 45,250 60,240Z"
        fill="url(#rFin)"
        stroke="#C2410C"
        strokeWidth="0.5"
      />
      {/* Right */}
      <path
        d="M140,195 C150,210 165,245 170,255 C170,255 155,250 140,240Z"
        fill="url(#rFin)"
        stroke="#C2410C"
        strokeWidth="0.5"
      />

      {/* ——— NOZZLE ——— */}
      <path
        d="M80,240 L78,255 L122,255 L120,240Z"
        fill="#6B7280"
        stroke="#4B5563"
        strokeWidth="0.5"
      />
      <rect x="82" y="248" width="36" height="4" rx="1" fill="#4B5563" />

      {/* ——— FLAME (animated) ——— */}
      {showFlame && (
        <g className="animate-flame">
          {/* Outer flame */}
          <path fill="url(#rFlameO)" opacity="0.92">
            <animate
              attributeName="d"
              values="M82,255 Q100,340 118,255;M82,255 Q100,325 118,255;M82,255 Q100,345 118,255;M82,255 Q100,330 118,255;M82,255 Q100,340 118,255"
              dur="0.4s"
              repeatCount="indefinite"
            />
          </path>
          {/* Inner flame */}
          <path fill="url(#rFlameI)" opacity="0.85">
            <animate
              attributeName="d"
              values="M88,255 Q100,310 112,255;M88,255 Q100,300 112,255;M88,255 Q100,315 112,255;M88,255 Q100,305 112,255;M88,255 Q100,310 112,255"
              dur="0.28s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      )}
    </svg>
  );
}
