import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { dirtyTalkMessages, sexyEmojis } from "@/data/sanctuary/dirtyTalkMessages";

const SHOW_INTERVAL = 20_000;
const DISPLAY_DURATION = 5_000;
const FADE_DURATION = 300;

function getRandomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function DirtyToast() {
  const [, setLocation] = useLocation();
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const [message, setMessage] = useState("");
  const [emoji, setEmoji] = useState("");

  const showToast = useCallback(() => {
    setMessage(getRandomItem(dirtyTalkMessages));
    setEmoji(getRandomItem(sexyEmojis));
    setFading(false);
    setVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      setVisible(false);
      setFading(false);
    }, FADE_DURATION);
  }, []);

  // Show toast every 20 seconds
  useEffect(() => {
    const interval = setInterval(showToast, SHOW_INTERVAL);
    return () => clearInterval(interval);
  }, [showToast]);

  // Auto-hide after 5 seconds
  useEffect(() => {
    if (!visible || fading) return;
    const timeout = setTimeout(hideToast, DISPLAY_DURATION);
    return () => clearTimeout(timeout);
  }, [visible, fading, hideToast]);

  if (!visible) return null;

  const handleClick = () => {
    hideToast();
    setLocation("/sanctuary/intimacy");
  };

  return (
    <div
      onClick={handleClick}
      className={`
        fixed bottom-6 right-6 z-50 max-w-sm cursor-pointer
        whimsy-card-elevated rounded-2xl border border-primary/20 px-5 py-4
        shadow-lg shadow-primary/10
        transition-all duration-300 ease-out
        ${fading ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"}
      `}
      style={{
        animation: fading ? undefined : "slideUpFade 0.3s ease-out",
      }}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{emoji}</span>
        <p className="text-sm font-medium text-foreground leading-relaxed">
          {message}
        </p>
      </div>
      <style>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(1rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
