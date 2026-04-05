import { useState, useMemo } from "react";
import { positionsData, type PositionCategory } from "@/data/sanctuary/positionsData";
import { useFavourites } from "@/hooks/useSanctuary";
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
} from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const CATEGORY_LABELS: Record<PositionCategory, string> = {
  "man-on-top": "Man on Top",
  "woman-on-top": "Woman on Top",
  "from-behind": "From Behind",
  sitting: "Sitting",
  standing: "Standing",
  oral: "Oral",
};

function DifficultyDots({ level }: { level: 1 | 2 | 3 }) {
  return (
    <div className="flex gap-1" title={`Difficulty: ${level}/3`}>
      {[1, 2, 3].map((dot) => (
        <span
          key={dot}
          className={`w-2 h-2 rounded-full ${
            dot <= level ? "bg-primary" : "bg-white/20"
          }`}
        />
      ))}
    </div>
  );
}

export function PositionExplorer() {
  const [activeCategory, setActiveCategory] = useState<PositionCategory | "all" | "favourites">("all");
  const { isFavourite, toggle } = useFavourites("positions");

  const categories = useMemo(() => {
    const cats = Array.from(new Set(positionsData.map((p) => p.category)));
    return cats;
  }, []);

  const filteredPositions = useMemo(() => {
    if (activeCategory === "all") return [...positionsData];
    if (activeCategory === "favourites")
      return positionsData.filter((p) => isFavourite(p.id));
    return positionsData.filter((p) => p.category === activeCategory);
  }, [activeCategory, isFavourite]);

  return (
    <div className="space-y-6">
      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={activeCategory === "all" ? "default" : "outline"}
          onClick={() => setActiveCategory("all")}
          className={
            activeCategory === "all"
              ? "bg-primary hover:bg-primary/90 text-primary-foreground"
              : "border-primary/30 text-primary hover:bg-primary/10"
          }
        >
          All
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat}
            size="sm"
            variant={activeCategory === cat ? "default" : "outline"}
            onClick={() => setActiveCategory(cat)}
            className={
              activeCategory === cat
                ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                : "border-primary/30 text-primary hover:bg-primary/10"
            }
          >
            {CATEGORY_LABELS[cat as PositionCategory]}
          </Button>
        ))}
        <Button
          size="sm"
          variant={activeCategory === "favourites" ? "default" : "outline"}
          onClick={() => setActiveCategory("favourites")}
          className={
            activeCategory === "favourites"
              ? "bg-primary hover:bg-primary/90 text-primary-foreground"
              : "border-primary/30 text-primary hover:bg-primary/10"
          }
        >
          Favourites
        </Button>
      </div>

      {/* Positions grid */}
      {filteredPositions.length === 0 ? (
        <p className="text-center text-white/40 py-8">
          {activeCategory === "favourites"
            ? "No favourites yet. Tap the heart to add some!"
            : "No positions found."}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPositions.map((position) => (
            <GlassCard
              key={position.id}
              className="border-primary/20 hover:border-primary/40 transition-colors group"
            >
              <GlassCardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <GlassCardTitle className="text-sm text-white/90">
                    {position.name}
                  </GlassCardTitle>
                  <button
                    onClick={() => toggle(position.id)}
                    className="text-lg transition-transform hover:scale-110 shrink-0"
                    aria-label={
                      isFavourite(position.id)
                        ? `Remove ${position.name} from favourites`
                        : `Add ${position.name} to favourites`
                    }
                  >
                    {isFavourite(position.id) ? (
                      <span className="text-primary">&#9829;</span>
                    ) : (
                      <span className="text-white/30 group-hover:text-white/50">
                        &#9825;
                      </span>
                    )}
                  </button>
                </div>
              </GlassCardHeader>
              <GlassCardContent className="space-y-3">
                {/* Position image */}
                <div className="flex justify-center">
                  <img
                    src={position.image}
                    alt={position.name}
                    className="w-32 h-32 object-contain opacity-80"
                    loading="lazy"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="border-primary/30 text-primary text-xs"
                  >
                    {CATEGORY_LABELS[position.category]}
                  </Badge>
                  <DifficultyDots level={position.difficulty} />
                </div>

                <a
                  href={position.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-primary/60 hover:text-primary transition-colors text-center"
                >
                  View details &rarr;
                </a>
              </GlassCardContent>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
