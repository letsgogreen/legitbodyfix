export function HeroBodyMap() {
  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[34rem]"
      aria-label="Movement focus map showing shoulder, hip, and knee regions"
      role="img"
    >
      <svg viewBox="0 0 560 560" className="h-full w-full" aria-hidden="true">
        <circle
          cx="280"
          cy="280"
          r="226"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.13"
          strokeWidth="1.5"
        />
        <circle
          cx="280"
          cy="280"
          r="174"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.13"
          strokeWidth="1.5"
        />
        <circle
          cx="280"
          cy="280"
          r="116"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.13"
          strokeWidth="1.5"
        />
        <line x1="54" y1="414" x2="506" y2="414" stroke="currentColor" strokeOpacity="0.15" />

        <g fill="currentColor" opacity="0.08" transform="translate(10 12)">
          <ellipse cx="280" cy="112" rx="31" ry="37" />
          <path d="M236 151 L324 151 L347 309 L213 309 Z" />
          <path d="M210 164 L240 172 L208 350 L174 339 Z" />
          <path d="M350 164 L320 172 L352 350 L386 339 Z" />
          <path d="M225 300 L276 300 L265 500 L212 500 Z" />
          <path d="M284 300 L335 300 L348 500 L295 500 Z" />
        </g>

        <g fill="currentColor">
          <ellipse cx="280" cy="100" rx="31" ry="37" />
          <path d="M236 139 L324 139 L347 297 L213 297 Z" />
          <path d="M210 152 L240 160 L208 338 L174 327 Z" />
          <path d="M350 152 L320 160 L352 338 L386 327 Z" />
          <path d="M225 288 L276 288 L265 488 L212 488 Z" />
          <path d="M284 288 L335 288 L348 488 L295 488 Z" />
        </g>

        <g fill="#c9ff2f" stroke="currentColor" strokeWidth="5">
          <circle cx="236" cy="164" r="10" />
          <circle cx="310" cy="300" r="10" />
          <circle cx="265" cy="414" r="10" />
        </g>

        <g
          fill="currentColor"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="11"
          fontWeight="700"
        >
          <text x="20" y="212">
            01 / SHOULDER
          </text>
          <text x="450" y="345">
            02 / HIP
          </text>
          <text x="46" y="475">
            03 / KNEE
          </text>
          <text x="522" y="316" transform="rotate(90 522 316)" letterSpacing="2">
            MOBILITY / STABILITY / STRENGTH
          </text>
        </g>
      </svg>
    </div>
  );
}
