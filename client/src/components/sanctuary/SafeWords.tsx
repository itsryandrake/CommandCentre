import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
} from "@/components/ui/glass-card";
import { safeWords } from "@/data/sanctuary/hubData";

const colourMap: Record<string, string> = {
  green: "border-l-sage",
  yellow: "border-l-amber-warm",
  red: "border-l-destructive",
};

const bgMap: Record<string, string> = {
  green: "text-sage",
  yellow: "text-amber-warm",
  red: "text-destructive",
};

export function SafeWords() {
  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle>Safe Words</GlassCardTitle>
      </GlassCardHeader>
      <GlassCardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {safeWords.map((sw) => (
            <div
              key={sw.word}
              className={`rounded-lg border-l-4 bg-white/5 p-4 ${colourMap[sw.colour]}`}
            >
              <p className={`text-lg font-bold ${bgMap[sw.colour]}`}>
                {sw.word}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {sw.meaning}
              </p>
            </div>
          ))}
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
