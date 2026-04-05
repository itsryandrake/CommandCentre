import { useState, useCallback } from "react";
import { blackCards, goldCards } from "@/data/sanctuary/dareCards";
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

export function DareMeCards() {
  const [blackCard, setBlackCard] = useState<string | null>(null);
  const [goldCard, setGoldCard] = useState<string | null>(null);
  const [daresDrawn, setDaresDrawn] = useState(0);

  const drawCard = useCallback(() => {
    setBlackCard(getRandomItem(blackCards));
    setGoldCard(getRandomItem(goldCards));
    setDaresDrawn((prev) => prev + 1);
  }, []);

  const combinedDare =
    blackCard && goldCard
      ? blackCard.replace("<blank>", goldCard)
      : null;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Dare card */}
      <GlassCard className="w-full max-w-md border-primary/30 bg-primary/5">
        <GlassCardHeader className="text-center">
          <GlassCardTitle className="text-primary">
            Dare Me
          </GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent className="flex flex-col items-center gap-4">
          {combinedDare ? (
            <p className="text-center text-lg font-medium text-white/90 min-h-[4rem] flex items-center">
              {combinedDare}
            </p>
          ) : (
            <p className="text-center text-white/50 min-h-[4rem] flex items-center">
              Draw a card to reveal your dare...
            </p>
          )}

          {blackCard && goldCard && (
            <div className="flex gap-2 flex-wrap justify-center">
              <Badge variant="outline" className="border-zinc-500/50 text-zinc-300">
                Prompt: {blackCard}
              </Badge>
              <Badge variant="outline" className="border-amber-warm/50 text-amber-warm">
                Fill: {goldCard}
              </Badge>
            </div>
          )}
        </GlassCardContent>
      </GlassCard>

      {/* Controls */}
      <div className="flex gap-3">
        <Button
          onClick={drawCard}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {combinedDare ? "New Dare" : "Draw Card"}
        </Button>
      </div>

      {/* Session counter */}
      {daresDrawn > 0 && (
        <p className="text-sm text-white/40">
          Dares drawn this session: {daresDrawn}
        </p>
      )}
    </div>
  );
}
