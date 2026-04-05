import { useState, useMemo, useEffect } from "react";
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
} from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import type { GifEntry } from "@/data/sanctuary/gifList";

const ITEMS_PER_PAGE = 12;

function extractFilename(path: string): string {
  const parts = path.split("/");
  return parts[parts.length - 1];
}

export default function VisualInspiration() {
  const [gifList, setGifList] = useState<GifEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetch("/sanctuary/gif-list.json")
      .then((res) => res.json())
      .then((data: { gifs: GifEntry[] }) => setGifList(data.gifs))
      .catch(() => setGifList([]));
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(gifList.map((g) => g.category));
    return ["All", ...Array.from(cats).sort()];
  }, [gifList]);

  const filtered = useMemo(() => {
    if (selectedCategory === "All") return gifList;
    return gifList.filter((g) => g.category === selectedCategory);
  }, [selectedCategory, gifList]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const pageItems = filtered.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  const toggleReveal = (globalIndex: number) => {
    setRevealedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(globalIndex)) {
        next.delete(globalIndex);
      } else {
        next.add(globalIndex);
      }
      return next;
    });
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setPage(0);
    setRevealedIndices(new Set());
  };

  if (gifList.length === 0) {
    return (
      <GlassCard>
        <GlassCardContent>
          <p className="text-muted-foreground text-center py-8">Loading gallery...</p>
        </GlassCardContent>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Visual Inspiration</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={selectedCategory === cat ? "default" : "outline"}
                className={
                  selectedCategory === cat
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "border-primary/30 text-primary hover:bg-primary/10"
                }
                onClick={() => handleCategoryChange(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </GlassCardContent>
      </GlassCard>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {pageItems.map((gif, idx) => {
          const globalIndex = page * ITEMS_PER_PAGE + idx;
          const isRevealed = revealedIndices.has(globalIndex);
          const filename = extractFilename(gif.path);

          return (
            <div
              key={`${gif.path}-${globalIndex}`}
              className="relative rounded-xl overflow-hidden cursor-pointer aspect-square bg-black/20"
              onClick={() => toggleReveal(globalIndex)}
            >
              <img
                src={`/sanctuary/gifs/${filename}`}
                alt={gif.name}
                className="w-full h-full object-cover transition-[filter] duration-500"
                style={{ filter: isRevealed ? "blur(0px)" : "blur(20px)" }}
                loading="lazy"
              />
              {!isRevealed && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white/60 text-sm font-medium">Click to reveal</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            size="sm"
            variant="outline"
            className="border-primary/30 text-primary hover:bg-primary/10"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-white/60 text-sm">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="border-primary/30 text-primary hover:bg-primary/10"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
