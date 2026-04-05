import { useEffect, useRef, useState } from "react";

/**
 * A paper plane that occasionally flies across the screen.
 * Appears every 45-90 seconds — a playful easter egg.
 */
export function PaperPlane() {
  const [flying, setFlying] = useState(false);
  const [yPos, setYPos] = useState(30);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    function scheduleFlight() {
      const delay = 45000 + Math.random() * 45000; // 45-90s
      timeoutRef.current = setTimeout(() => {
        setYPos(15 + Math.random() * 50); // top 65% of screen
        setFlying(true);

        setTimeout(() => {
          setFlying(false);
          scheduleFlight();
        }, 8000);
      }, delay);
    }

    // First appearance after 20-40s
    const initialDelay = 20000 + Math.random() * 20000;
    timeoutRef.current = setTimeout(() => {
      setYPos(15 + Math.random() * 50);
      setFlying(true);
      setTimeout(() => {
        setFlying(false);
        scheduleFlight();
      }, 8000);
    }, initialDelay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!flying) return null;

  return (
    <div
      className="pointer-events-none fixed z-0 opacity-[0.08] dark:opacity-[0.05]"
      style={{ top: `${yPos}%` }}
      aria-hidden="true"
    >
      <svg
        width="48"
        height="32"
        viewBox="0 0 48 32"
        className="plane-fly"
      >
        {/* Paper plane body */}
        <path
          d="M2 16 L46 2 L30 16 L46 30Z"
          fill="#F2A93B"
          stroke="#1C1C1C"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Fold line */}
        <path
          d="M2 16 L30 16"
          stroke="#1C1C1C"
          strokeWidth="1"
          opacity="0.4"
        />
        {/* Wing highlight */}
        <path
          d="M6 15 L28 8 L28 15Z"
          fill="#E85D3A"
          opacity="0.5"
        />
      </svg>
    </div>
  );
}
