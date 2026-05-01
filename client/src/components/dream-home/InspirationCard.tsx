import { useState } from "react";
import { Castle, Trash2, Check } from "lucide-react";
import type { DreamHomeImage } from "@shared/types/dreamHome";
import { cn } from "@/lib/utils";
import { getTagColour } from "./dreamHomeUtils";

export function InspirationCard({
  image,
  onSelect,
  isSelected,
  selectionActive,
  onToggleSelect,
  onDelete,
}: {
  image: DreamHomeImage;
  onSelect: () => void;
  isSelected: boolean;
  selectionActive: boolean;
  onToggleSelect: () => void;
  onDelete: (id: string) => void;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      onClick={() => {
        if (selectionActive) {
          onToggleSelect();
        } else {
          onSelect();
        }
      }}
      className={cn(
        "group relative mb-4 w-full cursor-pointer overflow-hidden rounded-xl bg-card shadow-sm transition-all duration-200 hover:shadow-lg active:scale-[0.98] text-left break-inside-avoid",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
    >
      {!imageError ? (
        <img
          src={image.imageUrl}
          alt={image.aiDescription || image.title || "Inspiration"}
          className="w-full object-contain"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      ) : (
        <div className="flex h-48 items-center justify-center bg-muted">
          <Castle className="h-8 w-8 text-muted-foreground/40" />
        </div>
      )}

      {/* Selection checkbox — top left */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect();
        }}
        className={cn(
          "absolute top-2 left-2 z-10 flex size-5 items-center justify-center rounded border-2 transition-all",
          selectionActive
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100",
          isSelected
            ? "border-primary bg-primary"
            : "border-white/70 bg-black/40 hover:bg-black/60"
        )}
      >
        {isSelected && <Check className="h-3 w-3 text-white" />}
      </div>

      {/* Delete button — top right */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(image.id);
        }}
        className="absolute top-2 right-2 z-10 rounded-full bg-black/60 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600/90"
      >
        <Trash2 className="h-3.5 w-3.5 text-white" />
      </button>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1.5">
          {image.aiDescription && (
            <p className="text-xs text-white/90 line-clamp-2">
              {image.aiDescription}
            </p>
          )}
          {image.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {image.tags.slice(0, 4).map((t) => (
                <span
                  key={t.tag}
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white",
                    getTagColour(t.tag)
                  )}
                >
                  {t.tag}
                </span>
              ))}
              {image.tags.length > 4 && (
                <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] text-white">
                  +{image.tags.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
