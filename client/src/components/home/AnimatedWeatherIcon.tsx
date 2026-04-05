/**
 * Animated SVG weather icons with colour coding.
 * Each condition gets a unique animation and palette.
 */

interface AnimatedWeatherIconProps {
  condition: string;
  size?: number;
  className?: string;
}

export function AnimatedWeatherIcon({
  condition,
  size = 24,
  className = "",
}: AnimatedWeatherIconProps) {
  const cond = condition.toLowerCase();

  if (cond === "clear") return <SunIcon size={size} className={className} />;
  if (cond === "partly cloudy") return <PartlyCloudyIcon size={size} className={className} />;
  if (cond === "rain" || cond === "drizzle") return <RainIcon size={size} className={className} />;
  if (cond === "thunderstorm") return <ThunderstormIcon size={size} className={className} />;
  if (cond === "snow") return <SnowIcon size={size} className={className} />;
  if (cond === "fog") return <FogIcon size={size} className={className} />;
  return <CloudyIcon size={size} className={className} />;
}

function SunIcon({ size, className }: { size: number; className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-label="Clear sky">
      {/* Rotating rays */}
      <g className="origin-center animate-[spin_20s_linear_infinite]">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line
            key={angle}
            x1="24"
            y1="6"
            x2="24"
            y2="10"
            stroke="#E8A838"
            strokeWidth="2"
            strokeLinecap="round"
            transform={`rotate(${angle} 24 24)`}
          />
        ))}
      </g>
      {/* Sun body */}
      <circle cx="24" cy="24" r="10" fill="#F5C040" />
      {/* Inner glow */}
      <circle cx="24" cy="24" r="10" fill="url(#sunGlow)" />
      <defs>
        <radialGradient id="sunGlow">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#F5C040" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function PartlyCloudyIcon({ size, className }: { size: number; className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-label="Partly cloudy">
      {/* Sun peeking */}
      <circle cx="18" cy="16" r="8" fill="#F5C040" opacity="0.9" />
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <line
          key={angle}
          x1="18"
          y1="5"
          x2="18"
          y2="8"
          stroke="#E8A838"
          strokeWidth="1.5"
          strokeLinecap="round"
          transform={`rotate(${angle} 18 16)`}
          opacity="0.7"
        />
      ))}
      {/* Cloud */}
      <g className="animate-[cloudFloat_6s_ease-in-out_infinite]">
        <path
          d="M14 32 Q14 26 20 26 Q20 22 26 22 Q32 22 34 26 Q38 26 38 30 Q38 34 34 34 L18 34 Q14 34 14 32Z"
          fill="#B8AFA6"
          opacity="0.85"
        />
        <path
          d="M14 32 Q14 26 20 26 Q20 22 26 22 Q32 22 34 26 Q38 26 38 30 Q38 34 34 34 L18 34 Q14 34 14 32Z"
          fill="url(#cloudHighlight)"
        />
      </g>
      <defs>
        <linearGradient id="cloudHighlight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.3" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function CloudyIcon({ size, className }: { size: number; className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-label="Cloudy">
      {/* Back cloud */}
      <g className="animate-[cloudFloat_8s_ease-in-out_infinite]" opacity="0.5">
        <path
          d="M10 28 Q10 22 16 22 Q16 18 22 18 Q28 18 30 22 Q34 22 34 26 Q34 30 30 30 L14 30 Q10 30 10 28Z"
          fill="#9B8E82"
        />
      </g>
      {/* Front cloud */}
      <g className="animate-[cloudFloat_6s_ease-in-out_infinite_0.5s]">
        <path
          d="M14 34 Q14 28 20 28 Q20 24 26 24 Q32 24 34 28 Q38 28 38 32 Q38 36 34 36 L18 36 Q14 36 14 34Z"
          fill="#B8AFA6"
        />
      </g>
    </svg>
  );
}

function RainIcon({ size, className }: { size: number; className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-label="Rain">
      {/* Cloud */}
      <path
        d="M12 24 Q12 18 18 18 Q18 14 24 14 Q30 14 32 18 Q36 18 36 22 Q36 26 32 26 L16 26 Q12 26 12 24Z"
        fill="#7BA3C4"
        opacity="0.8"
      />
      {/* Rain drops — staggered animation */}
      {[
        { x: 17, delay: "0s" },
        { x: 22, delay: "0.3s" },
        { x: 27, delay: "0.6s" },
        { x: 32, delay: "0.15s" },
      ].map(({ x, delay }) => (
        <line
          key={x}
          x1={x}
          y1={28}
          x2={x - 1.5}
          y2={34}
          stroke="#5B93BD"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.7"
          style={{
            animation: `rainDrop 1s ease-in infinite ${delay}`,
          }}
        />
      ))}
    </svg>
  );
}

function ThunderstormIcon({ size, className }: { size: number; className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-label="Thunderstorm">
      {/* Dark cloud */}
      <path
        d="M10 22 Q10 16 16 16 Q16 12 22 12 Q28 12 30 16 Q34 16 34 20 Q34 24 30 24 L14 24 Q10 24 10 22Z"
        fill="#6B7A8D"
        opacity="0.9"
      />
      {/* Lightning bolt */}
      <g className="animate-[lightningFlash_3s_ease-in-out_infinite]">
        <polygon
          points="22,24 18,33 23,33 20,42 30,30 25,30 28,24"
          fill="#F5C040"
          opacity="0.9"
        />
      </g>
      {/* Rain */}
      {[
        { x: 14, delay: "0s" },
        { x: 32, delay: "0.4s" },
      ].map(({ x, delay }) => (
        <line
          key={x}
          x1={x}
          y1={26}
          x2={x - 1}
          y2={31}
          stroke="#5B93BD"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.5"
          style={{
            animation: `rainDrop 0.8s ease-in infinite ${delay}`,
          }}
        />
      ))}
    </svg>
  );
}

function SnowIcon({ size, className }: { size: number; className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-label="Snow">
      {/* Cloud */}
      <path
        d="M12 22 Q12 16 18 16 Q18 12 24 12 Q30 12 32 16 Q36 16 36 20 Q36 24 32 24 L16 24 Q12 24 12 22Z"
        fill="#A8B4C0"
        opacity="0.7"
      />
      {/* Snowflakes */}
      {[
        { cx: 18, cy: 30, delay: "0s" },
        { cx: 24, cy: 32, delay: "0.5s" },
        { cx: 30, cy: 29, delay: "1s" },
        { cx: 21, cy: 36, delay: "0.7s" },
        { cx: 27, cy: 37, delay: "0.2s" },
      ].map(({ cx, cy, delay }) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r="1.5"
          fill="#D4E2ED"
          style={{
            animation: `snowFall 2.5s ease-in-out infinite ${delay}`,
          }}
        />
      ))}
    </svg>
  );
}

function FogIcon({ size, className }: { size: number; className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-label="Fog">
      {/* Fog lines with gentle float */}
      {[
        { y: 18, width: 28, x: 10, delay: "0s", opacity: 0.3 },
        { y: 23, width: 24, x: 12, delay: "0.5s", opacity: 0.5 },
        { y: 28, width: 26, x: 11, delay: "1s", opacity: 0.4 },
        { y: 33, width: 22, x: 13, delay: "1.5s", opacity: 0.3 },
      ].map(({ y, width, x, delay, opacity }) => (
        <line
          key={y}
          x1={x}
          y1={y}
          x2={x + width}
          y2={y}
          stroke="#9B8E82"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity={opacity}
          style={{
            animation: `fogDrift 4s ease-in-out infinite ${delay}`,
          }}
        />
      ))}
    </svg>
  );
}
