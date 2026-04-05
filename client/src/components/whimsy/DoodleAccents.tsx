/**
 * Decorative SVG doodles along the right edge — squiggles, stars, dots.
 * Static, low opacity, hand-drawn feel.
 */
export function DoodleAccents() {
  return (
    <div
      className="pointer-events-none fixed bottom-0 right-0 z-0 h-full w-48 overflow-hidden opacity-[0.06] dark:opacity-[0.04]"
      aria-hidden="true"
    >
      <svg
        width="180"
        height="100%"
        viewBox="0 0 180 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full"
        preserveAspectRatio="xMaxYMid slice"
      >
        {/* Star 1 */}
        <path
          d="M140 80 L143 90 L153 90 L145 96 L148 106 L140 100 L132 106 L135 96 L127 90 L137 90Z"
          fill="#F2A93B"
          stroke="#1C1C1C"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Squiggle 1 */}
        <path
          d="M100 180 Q110 170 120 185 Q130 200 140 190 Q150 180 160 195"
          stroke="#0E8A6E"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Dot cluster */}
        <circle cx="155" cy="280" r="4" fill="#E85D3A" />
        <circle cx="140" cy="290" r="2.5" fill="#0E8A6E" />
        <circle cx="160" cy="300" r="3" fill="#4A9FD9" />

        {/* Zigzag */}
        <path
          d="M120 400 L130 385 L140 400 L150 385 L160 400"
          stroke="#E85D3A"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Star 2 (smaller) */}
        <path
          d="M130 500 L132 506 L138 506 L133 510 L135 516 L130 512 L125 516 L127 510 L122 506 L128 506Z"
          fill="#4A9FD9"
          stroke="#1C1C1C"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Wavy line */}
        <path
          d="M110 600 Q120 590 130 600 Q140 610 150 600 Q160 590 170 600"
          stroke="#0E8A6E"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Circle ring */}
        <circle
          cx="145"
          cy="700"
          r="10"
          stroke="#F2A93B"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="4 3"
        />

        {/* Small cross */}
        <path
          d="M155 750 L155 764 M148 757 L162 757"
          stroke="#F5C842"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
