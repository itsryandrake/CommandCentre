import { useState, useCallback } from "react";
import { sexyTexts, poseInspiration } from "@/data/sanctuary/dirtyPictureData";
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
} from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function getRandomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function DirtyPicture() {
  const [currentText, setCurrentText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateText = useCallback(() => {
    setCurrentText(getRandomItem(sexyTexts));
    setCopied(false);
  }, []);

  const copyToClipboard = useCallback(async () => {
    if (!currentText) return;
    try {
      await navigator.clipboard.writeText(currentText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = currentText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [currentText]);

  // Get unique categories for grouping
  const categories = Array.from(new Set(poseInspiration.map((p) => p.category)));

  return (
    <div className="space-y-8">
      {/* Generate Text Section */}
      <section>
        <h3 className="text-lg font-semibold text-white/80 mb-4">
          Generate Text
        </h3>

        <div className="flex flex-col items-center gap-4">
          {currentText && (
            <div className="w-full max-w-md flex justify-end">
              <div className="relative max-w-[80%]">
                <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-3 text-sm">
                  {currentText}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={generateText}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {currentText ? "Generate Another" : "Generate Text"}
            </Button>
            {currentText && (
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/10"
              >
                {copied ? "Copied!" : "Copy"}
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Pose Inspiration Section */}
      <section>
        <h3 className="text-lg font-semibold text-white/80 mb-4">
          Pose Inspiration
        </h3>

        {categories.map((category) => (
          <div key={category} className="mb-6">
            <h4 className="text-sm font-medium text-primary/70 uppercase tracking-wider mb-3">
              {category}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {poseInspiration
                .filter((pose) => pose.category === category)
                .map((pose) => (
                  <GlassCard
                    key={pose.title}
                    className="border-primary/20 hover:border-primary/40 transition-colors"
                  >
                    <GlassCardHeader className="pb-2">
                      <GlassCardTitle className="text-sm text-white/90">
                        {pose.title}
                      </GlassCardTitle>
                      <Badge
                        variant="outline"
                        className="w-fit border-primary/30 text-primary text-xs"
                      >
                        {pose.category}
                      </Badge>
                    </GlassCardHeader>
                    <GlassCardContent>
                      <p className="text-xs text-white/60 leading-relaxed">
                        {pose.description}
                      </p>
                    </GlassCardContent>
                  </GlassCard>
                ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
